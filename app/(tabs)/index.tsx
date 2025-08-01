import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert,
  SafeAreaView 
} from 'react-native';
import SearchBar from '@/components/SearchBar';
import LocationFilter from '@/components/LocationFilter';
import InventoryCard from '@/components/InventoryCard';
import { useInventory } from '@/hooks/useInventory';
import { fuzzySearch, getUniqueLocations } from '@/utils/search';
import { Colors, Spacing, Typography } from '@/constants/styles';

export default function InventoryScreen() {
  const { items, loading, error, refreshing, updateItem, refresh } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();

  // Get the most recent update time
  const lastUpdated = items.length > 0 
    ? new Date(Math.max(...items.map(item => new Date(item.last_updated || 0).getTime())))
    : null;

  // Get unique locations for filtering
  const locations = useMemo(() => getUniqueLocations(items), [items]);

  const filteredItems = useMemo(() => {
    return fuzzySearch(items, searchQuery, selectedLocation);
  }, [items, searchQuery, selectedLocation]);

  const handleTransaction = async (itemId: string, type: 'buy' | 'sell', quantity: number) => {
    try {
      await updateItem(itemId, type, quantity);
      Alert.alert(
        'Transaction Successful', 
        `${type === 'buy' ? 'Added' : 'Removed'} ${quantity} items ${type === 'buy' ? 'to' : 'from'} inventory.`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      if (errorMessage.includes('OAuth2')) {
        Alert.alert(
          'Setup Required',
          'Buy/sell functionality requires OAuth2 authentication. Please follow the setup guide to enable write access.',
          [
            { text: 'OK' },
            { 
              text: 'View Setup Guide', 
              onPress: () => {
                // You could navigate to a setup guide screen here
                console.log('Navigate to setup guide');
              }
            }
          ]
        );
      } else {
        Alert.alert('Transaction Failed', errorMessage);
      }
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.setupText}>
            Please ensure your Google Sheets integration is properly configured.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <Text style={styles.subtitle}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {refreshing && ' • Refreshing...'}
          {lastUpdated && !refreshing && ` • Updated ${lastUpdated.toLocaleTimeString()}`}
        </Text>
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, code, or location..."
      />

      <LocationFilter
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InventoryCard 
            item={item} 
            onTransaction={handleTransaction}
            showTransactionControls={true}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading inventory...' : 'No items found'}
            </Text>
            {!loading && (searchQuery || selectedLocation) && (
              <Text style={styles.emptySubtext}>
                Try adjusting your search terms or location filter
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  setupText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
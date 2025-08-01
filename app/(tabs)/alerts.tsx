import React, { useMemo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle } from 'lucide-react-native';
import LocationFilter from '@/components/LocationFilter';
import InventoryCard from '@/components/InventoryCard';
import { useInventory } from '@/hooks/useInventory';
import { filterLowStockItems, getUniqueLocations } from '@/utils/search';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/styles';

export default function AlertsScreen() {
  const { items, loading, error, refreshing, refresh } = useInventory();
  const [isTabRefreshing, setIsTabRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();

  // Refresh data when tab becomes active
  useFocusEffect(
    React.useCallback(() => {
      setIsTabRefreshing(true);
      refresh().finally(() => {
        setIsTabRefreshing(false);
      });
    }, [refresh])
  );

  // Get the most recent update time
  const lastUpdated = items.length > 0 
    ? new Date(Math.max(...items.map(item => new Date(item.last_updated || 0).getTime())))
    : null;

  // Get unique locations for filtering
  const locations = useMemo(() => getUniqueLocations(items), [items]);

  const lowStockItems = useMemo(() => {
    return filterLowStockItems(items, selectedLocation);
  }, [items, selectedLocation]);

  const handleTransaction = () => {
    // This is a read-only page, so no transactions allowed
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
        <View style={styles.titleContainer}>
          <AlertTriangle size={28} color={Colors.error} />
          <Text style={styles.title}>Stock Alerts</Text>
        </View>
        <Text style={styles.subtitle}>
          {lowStockItems.length} {lowStockItems.length === 1 ? 'item needs' : 'items need'} attention
          {(refreshing || isTabRefreshing) && ' • Refreshing...'}
          {lastUpdated && !refreshing && !isTabRefreshing && ` • Updated ${lastUpdated.toLocaleTimeString()}`}
        </Text>
      </View>

      <LocationFilter
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
      />

      <FlatList
        data={lowStockItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InventoryCard 
            item={item} 
            onTransaction={handleTransaction}
            showTransactionControls={false}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            tintColor={Colors.error}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <Text style={styles.emptyText}>Loading alerts...</Text>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <AlertTriangle size={48} color={Colors.success} />
                </View>
                <Text style={styles.successTitle}>All Good!</Text>
                <Text style={styles.successText}>
                  {selectedLocation 
                    ? `No items are below minimum stock levels in ${selectedLocation}`
                    : 'No items are below minimum stock levels'
                  }
                </Text>
              </>
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
    paddingBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginLeft: Spacing.sm,
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
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
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
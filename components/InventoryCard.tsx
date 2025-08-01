import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Package, Minus, Plus } from 'lucide-react-native';
import { InventoryItem } from '@/types/inventory';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/styles';

interface InventoryCardProps {
  item: InventoryItem;
  onTransaction: (itemId: string, type: 'buy' | 'sell', quantity: number) => void;
  showTransactionControls?: boolean;
}

export default function InventoryCard({ 
  item, 
  onTransaction, 
  showTransactionControls = true 
}: InventoryCardProps) {
  const [quantity, setQuantity] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const isLowStock = item.stock_vol < item.min_value;

  const handleTransaction = async (type: 'buy' | 'sell') => {
    const qty = parseInt(quantity);
    
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive number.');
      return;
    }

    if (type === 'sell' && qty > item.stock_vol) {
      Alert.alert('Insufficient Stock', 'Cannot sell more items than available in stock.');
      return;
    }

    setIsProcessing(true);
    try {
      await onTransaction(item.id, type, qty);
      setQuantity('1');
    } catch (error) {
      Alert.alert('Transaction Failed', 'Failed to process transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, isLowStock && styles.lowStockContainer]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Package size={24} color={isLowStock ? Colors.error : Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.itemCode}>Code: {item.item_code}</Text>
        </View>
        {isLowStock && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>LOW</Text>
          </View>
        )}
      </View>

      <View style={styles.stockInfo}>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Current Stock:</Text>
          <Text style={[styles.stockValue, isLowStock && styles.lowStockText]}>
            {item.stock_vol} {item.unit_measurement}
          </Text>
        </View>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Minimum:</Text>
          <Text style={styles.stockValue}>
            {item.min_value} {item.unit_measurement}
          </Text>
        </View>
        {item.location && (
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Location:</Text>
            <Text style={styles.stockValue}>
              {item.location}
            </Text>
          </View>
        )}
      </View>

      {showTransactionControls && (
        <View style={styles.transactionSection}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityInputContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  const current = parseInt(quantity) || 1;
                  if (current > 1) setQuantity((current - 1).toString());
                }}
              >
                <Minus size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                textAlign="center"
              />
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  const current = parseInt(quantity) || 1;
                  setQuantity((current + 1).toString());
                }}
              >
                <Plus size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.buyButton]}
              onPress={() => handleTransaction('buy')}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.sellButton]}
              onPress={() => handleTransaction('sell')}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  lowStockContainer: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  itemCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  alertBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  alertText: {
    color: Colors.surface,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  stockInfo: {
    marginBottom: Spacing.md,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  stockLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  stockValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  lowStockText: {
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  transactionSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  quantityLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  quantityInput: {
    width: 50,
    height: 32,
    textAlign: 'center',
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: Colors.accent,
  },
  sellButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
});
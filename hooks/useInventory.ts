import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '@/types/inventory';
import { apiClient } from '@/services/apiClient';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const data = await apiClient.getInventoryData();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, type: 'buy' | 'sell', quantity: number) => {
    try {
      console.log('Starting transaction:', { itemId, type, quantity });
      
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      console.log('Current item:', item);

      const newStockVol = type === 'buy' 
        ? item.stock_vol + quantity 
        : item.stock_vol - quantity;

      console.log('New stock volume:', newStockVol);

      if (newStockVol < 0) {
        throw new Error('Insufficient stock');
      }

      console.log('Updating Google Sheets...');
      await apiClient.updateInventoryItem(itemId, type, quantity, newStockVol);
      console.log('Google Sheets updated successfully');
      
      // Fetch fresh data from Google Sheets to ensure consistency
      // This ensures we get the exact data that was saved, including preserved fields
      const freshData = await apiClient.getInventoryData();
      const updatedItem = freshData.find(i => i.id === itemId);
      
      if (updatedItem) {
        // Update local state with fresh data from Google Sheets
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId 
              ? updatedItem
              : i
          )
        );
        console.log('Local state updated with fresh data from Google Sheets');
      } else {
        // Fallback to optimistic update if fresh data fetch fails
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId 
              ? { ...i, stock_vol: newStockVol, last_updated: new Date().toISOString() }
              : i
          )
        );
        console.log('Local state updated with optimistic update');
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    }
  }, [items]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      // Force a fresh fetch from Google Sheets
      const freshData = await apiClient.getInventoryData();
      setItems(freshData);
      console.log('Data refreshed from server');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh inventory data');
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refreshing,
    updateItem,
    refresh,
  };
}
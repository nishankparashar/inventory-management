import { InventoryItem } from '@/types/inventory';
import { apiClient } from './apiClient';

export class GoogleSheetsService {
  async getInventoryData(): Promise<InventoryItem[]> {
    try {
      return await apiClient.getInventoryData();
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      throw new Error('Failed to fetch inventory data from server');
    }
  }

  async updateInventoryItem(itemId: string, newStockVol: number): Promise<boolean> {
    try {
      // This method signature is maintained for compatibility
      // The actual update logic is now handled by the backend API
      throw new Error('Direct update not supported. Use updateItem from useInventory hook.');
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }
}

// Default service instance - will be configured by user
export const sheetsService = new GoogleSheetsService();
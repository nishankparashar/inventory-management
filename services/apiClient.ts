import { InventoryItem } from '@/types/inventory';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    // In development, use the local server
    // In production, this would be your deployed API URL
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8081' 
      : window.location.origin;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getInventoryData(): Promise<InventoryItem[]> {
    try {
      const response = await this.makeRequest<{ data: InventoryItem[] }>('/inventory');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
      throw new Error('Failed to fetch inventory data from server');
    }
  }

  async updateInventoryItem(
    itemId: string, 
    type: 'buy' | 'sell', 
    quantity: number,
    newStockVol: number
  ): Promise<boolean> {
    try {
      await this.makeRequest('/inventory', {
        method: 'PUT',
        body: JSON.stringify({
          itemId,
          stockVol: newStockVol,
          type,
          quantity,
        }),
      });
      return true;
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
import axios from 'axios';
import { tokenManager } from './tokenManager';


// Google Sheets API configuration
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export class GoogleSheetsService {
  private spreadsheetId: string;
  private apiKey: string;

  constructor(spreadsheetId: string, apiKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.apiKey = apiKey;
  }

  private async getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Try to get a valid access token from the token manager
    const accessToken = await tokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }

  async getInventoryData(range: string = 'Sheet1!A:G'): Promise<any[]> {
    try {
      const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values/${range}`;
      const headers = await this.getHeaders();
      const params = headers.Authorization ? {} : { key: this.apiKey };
      
      const response = await axios.get(url, {
        headers,
        params,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) return [];

      // Assume first row contains headers
      const headers_row = rows[0];
      const data = rows.slice(1).map((row: any[], index: number) => ({
        id: (index + 1).toString(),
        item_name: row[0] || '',
        item_code: row[1] || '',
        stock_vol: parseFloat(row[2]) || 0,
        unit_measurement: row[3] || '',
        min_value: parseFloat(row[4]) || 0,
        location: row[5] || '',
        last_updated: row[6] || new Date().toISOString(),
      }));

      return data;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      throw new Error('Failed to fetch inventory data from Google Sheets');
    }
  }

  async updateInventoryItem(itemId: string, newStockVol: number): Promise<boolean> {
    try {
      // Check if we have write access (OAuth2 token)
      if (!tokenManager.isAuthenticated()) {
        throw new Error('Write access requires OAuth2 authentication. Please set up OAuth2 credentials for buy/sell functionality.');
      }

      // First, get the current row data to preserve unit_measurement and min_value
      const currentData = await this.getInventoryData();
      const currentItem = currentData.find(item => item.id === itemId);
      
      if (!currentItem) {
        throw new Error('Item not found');
      }

      const rowNumber = parseInt(itemId) + 1; // +1 because itemId is 0-based but sheets are 1-based
      const range = `Sheet1!C${rowNumber}:G${rowNumber}`;
      const values = [
        [
          newStockVol, 
          currentItem.unit_measurement || '', 
          currentItem.min_value || 0, 
          currentItem.location || '',
          new Date().toISOString()
        ]
      ];

      const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
      const headers = await this.getHeaders();

      const response = await axios.put(url, {
        values,
      }, {
        headers,
      });

      console.log('Update response:', response.data);
      return true;
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your OAuth2 credentials or re-authenticate.');
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied. Please ensure the Google Sheet is shared with your account.');
      } else if (error.message?.includes('OAuth2')) {
        throw error; // Re-throw our custom OAuth2 error
      } else {
        throw new Error('Failed to update inventory item in Google Sheets');
      }
    }
  }
}

// Default service instance - will be configured by user
export const sheetsService = new GoogleSheetsService(
  process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID || '',
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ''
);
export interface InventoryItem {
  id: string;
  item_name: string;
  item_code: string;
  stock_vol: number;
  unit_measurement: string;
  min_value: number;
  location: string;
  last_updated?: string;
}

export interface Transaction {
  item_id: string;
  type: 'buy' | 'sell';
  quantity: number;
  timestamp: string;
}

export interface SearchFilters {
  query: string;
  location?: string;
  sortBy: 'name' | 'code' | 'stock';
  sortOrder: 'asc' | 'desc';
}
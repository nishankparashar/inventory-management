import { InventoryItem, SearchFilters } from '@/types/inventory';

export function fuzzySearch(items: InventoryItem[], query: string, locationFilter?: string): InventoryItem[] {
  let filteredItems = items;

  // Apply location filter first
  if (locationFilter && locationFilter.trim()) {
    filteredItems = items.filter(item => 
      item.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }

  if (!query.trim()) return filteredItems;

  const searchTerm = query.toLowerCase();
  
  return filteredItems
    .map(item => ({
      ...item,
      searchScore: calculateSearchScore(item, searchTerm)
    }))
    .filter(item => item.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .map(({ searchScore, ...item }) => item);
}

function calculateSearchScore(item: InventoryItem, searchTerm: string): number {
  const name = item.item_name.toLowerCase();
  const code = item.item_code.toLowerCase();
  const location = item.location.toLowerCase();
  
  let score = 0;
  
  // Exact matches get highest score
  if (name === searchTerm || code === searchTerm || location === searchTerm) {
    score += 100;
  }
  
  // Starts with search term
  if (name.startsWith(searchTerm) || code.startsWith(searchTerm) || location.startsWith(searchTerm)) {
    score += 50;
  }
  
  // Contains search term
  if (name.includes(searchTerm) || code.includes(searchTerm) || location.includes(searchTerm)) {
    score += 25;
  }
  
  // Fuzzy matching - count matching characters
  const nameMatches = countMatches(name, searchTerm);
  const codeMatches = countMatches(code, searchTerm);
  const locationMatches = countMatches(location, searchTerm);
  score += Math.max(nameMatches, codeMatches, locationMatches) * 2;
  
  return score;
}

function countMatches(text: string, pattern: string): number {
  let matches = 0;
  let patternIndex = 0;
  
  for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
    if (text[i] === pattern[patternIndex]) {
      matches++;
      patternIndex++;
    }
  }
  
  return matches;
}

export function filterLowStockItems(items: InventoryItem[], locationFilter?: string): InventoryItem[] {
  let filteredItems = items;
  
  // Apply location filter if provided
  if (locationFilter && locationFilter.trim()) {
    filteredItems = items.filter(item => 
      item.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }
  
  return filteredItems.filter(item => {
    const stockVol = Number(item.stock_vol) || 0;
    const minValue = Number(item.min_value) || 0;
    return stockVol < minValue;
  });
}

export function getUniqueLocations(items: InventoryItem[]): string[] {
  const locations = items
    .map(item => item.location)
    .filter(location => location && location.trim())
    .map(location => location.trim());
  
  return [...new Set(locations)].sort();
}
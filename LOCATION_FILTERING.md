# Location-Based Filtering Feature

## Overview
This update adds location-based filtering to the inventory management system, allowing users to filter items by location in both the main inventory view and alerts screen.

## Features Added

### 1. Location Column in Google Sheets
- Added a new column (Column G) to store location information for each inventory item
- The location field is optional but recommended for better organization

### 2. Location Filtering UI
- **LocationFilter Component**: A horizontal scrollable list of location chips
- Users can filter by "All Locations" or select a specific location
- Filter chips show available locations from the current inventory data

### 3. Enhanced Search Functionality
- Search now includes location matching
- Users can search by item name, code, or location
- Location filtering works in combination with text search

### 4. Location Display
- Location information is displayed on each inventory card
- Shows the location where each item is stored

### 5. Alerts with Location Context
- Alerts screen now supports location filtering
- Shows low stock items for specific locations
- Success message adapts to show location-specific information

## Google Sheets Setup

### Required Column Structure
Your Google Sheet should have the following columns:
1. **A**: Item Name
2. **B**: Item Code  
3. **C**: Stock Volume
4. **D**: Unit Measurement
5. **E**: Minimum Value
6. **F**: Location (NEW)
7. **G**: Last Updated

### Example Data Format
```
Item Name    | Item Code | Stock | Unit | Min | Location    | Last Updated
Laptop       | LAP001    | 5     | pcs  | 2   | Warehouse A | 2024-01-15
Mouse        | MOU002    | 10    | pcs  | 5   | Office      | 2024-01-15
Keyboard     | KEY003    | 3     | pcs  | 2   | Warehouse B | 2024-01-15
```

## Usage

### Filtering by Location
1. **Main Inventory Screen**: Use the location filter chips below the search bar
2. **Alerts Screen**: Use the location filter to see low stock items for specific locations
3. **Combined Filtering**: Use both text search and location filter together

### Search by Location
- Type location names in the search bar to find items by location
- Search supports partial matching and fuzzy search for locations

## Technical Implementation

### Updated Files
- `types/inventory.ts`: Added location field to InventoryItem interface
- `services/googleSheets.ts`: Updated to read location column (Column G)
- `utils/search.ts`: Enhanced search to include location matching and filtering
- `components/LocationFilter.tsx`: New component for location filtering UI
- `components/InventoryCard.tsx`: Added location display
- `app/(tabs)/index.tsx`: Integrated location filtering in main inventory
- `app/(tabs)/alerts.tsx`: Added location filtering to alerts

### Key Functions
- `getUniqueLocations()`: Extracts unique locations from inventory data
- `fuzzySearch()`: Enhanced to support location filtering and search
- `filterLowStockItems()`: Updated to support location-based filtering

## Benefits
1. **Better Organization**: Group items by physical location
2. **Focused Alerts**: See low stock issues for specific locations
3. **Improved Search**: Find items by where they're stored
4. **Location Management**: Track inventory across multiple locations

## Migration Notes
- Existing sheets without a location column will show empty location fields
- The system gracefully handles missing location data
- No breaking changes to existing functionality 
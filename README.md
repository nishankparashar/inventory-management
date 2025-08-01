# Inventory Management App

A React Native Expo app for managing inventory with Google Sheets integration.

## Features

- 📱 Cross-platform mobile app (iOS, Android, Web)
- 🔍 Real-time search functionality
- 📊 Google Sheets integration for data storage
- 🔄 Pull-to-refresh functionality
- 📈 Stock level tracking with buy/sell transactions
- 🎨 Modern UI with responsive design

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Google Sheets API access

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Sheets Setup

1. Create a Google Sheet with the following columns:
   - A: Item Name
   - B: Item Code
   - C: Stock Volume
   - D: Unit Measurement
   - E: Minimum Value
   - F: Last Updated

2. Set up Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create credentials (API Key)
   - Share your Google Sheet with the service account email (if using service account)

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN=your_access_token_here
```

**Note:** The access token is optional if you're using API key authentication.

### 4. Get Your Spreadsheet ID

The spreadsheet ID is the long string in your Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

### 5. Run the App

```bash
# Start development server
npm run dev

# Or use Expo CLI
expo start
```

## Project Structure

```
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Main inventory screen
│   │   └── alerts.tsx     # Alerts screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── InventoryCard.tsx  # Inventory item card
│   └── SearchBar.tsx      # Search component
├── hooks/                 # Custom React hooks
│   ├── useInventory.ts    # Inventory data management
│   └── useFrameworkReady.ts
├── services/              # API services
│   └── googleSheets.ts    # Google Sheets integration
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── constants/             # App constants and styles
```

## Usage

1. **View Inventory**: The main screen displays all inventory items
2. **Search**: Use the search bar to filter items by name or code
3. **Transactions**: Tap on items to buy or sell stock
4. **Refresh**: Pull down to refresh data from Google Sheets
5. **Alerts**: Check the alerts tab for low stock notifications

## Troubleshooting

### Common Issues

1. **"Connection Error"**: 
   - Verify your Google Sheets API credentials
   - Check that the spreadsheet is shared with the correct permissions
   - Ensure the spreadsheet ID is correct

2. **"Failed to fetch inventory data"**:
   - Verify your API key has access to Google Sheets API
   - Check that the sheet range is correct (default: Sheet1!A:F)

3. **Build errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Clear Expo cache: `expo start --clear`

## Development

### Adding New Features

1. Create new components in the `components/` directory
2. Add new screens in the `app/` directory
3. Extend the Google Sheets service for new data operations
4. Update TypeScript types as needed

### Styling

The app uses a centralized styling system in `constants/styles.ts`. Update colors, spacing, and typography there.

## License

This project is licensed under the MIT License. 
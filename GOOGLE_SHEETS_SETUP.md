# Google Sheets Setup Guide

This guide will help you set up Google Sheets integration for the Inventory Management App.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Inventory Management" or any name you prefer

## Step 2: Set Up the Data Structure

Your Google Sheet should have the following columns in this exact order:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Item Name | The name of the inventory item | "Laptop Dell XPS 13" |
| B | Item Code | Unique identifier for the item | "LAP001" |
| C | Stock Volume | Current quantity in stock | 15 |
| D | Unit Measurement | Unit of measurement | "units" |
| E | Minimum Value | Minimum stock level before alert | 5 |
| F | Last Updated | Timestamp of last update | 2024-01-15T10:30:00Z |

### Sample Data

Here's an example of how your first few rows should look:

```
Item Name          | Item Code | Stock Volume | Unit Measurement | Minimum Value | Last Updated
Laptop Dell XPS 13 | LAP001    | 15          | units            | 5             | 2024-01-15T10:30:00Z
iPhone 15 Pro      | PHN001    | 8           | units            | 3             | 2024-01-15T10:30:00Z
Wireless Mouse     | ACC001    | 25          | units            | 10            | 2024-01-15T10:30:00Z
```

## Step 3: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 4: Create API Credentials

### Option A: API Key (Recommended for simple setup)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Google Sheets API only

### Option B: Service Account (More secure)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Download the JSON key file
5. Share your Google Sheet with the service account email

## Step 5: Get Your Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL in your browser
3. The URL will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
4. Copy the `SPREADSHEET_ID_HERE` part

## Step 6: Configure the App

1. Create a `.env` file in your project root (if not already created)
2. Add your credentials:

```env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

## Step 7: Test the Integration

1. Run the app: `npm run dev`
2. The app should now load your inventory data from Google Sheets
3. Try adding/removing stock to test the integration

## Troubleshooting

### "Connection Error" Message

- Verify your API key is correct
- Ensure Google Sheets API is enabled
- Check that your spreadsheet ID is correct
- Make sure your Google Sheet is accessible (not private)

### "Failed to fetch inventory data"

- Verify the column structure matches exactly
- Check that your API key has access to Google Sheets API
- Ensure the sheet range is correct (default: Sheet1!A:F)

### Permission Issues

- If using API key: Make sure the Google Sheet is publicly accessible (anyone with link can view)
- If using service account: Share the sheet with the service account email

## Security Notes

- Keep your API key secure and don't commit it to version control
- Consider using environment variables in production
- Restrict API key permissions to only what's needed
- Regularly rotate your API keys

## Advanced Configuration

### Custom Sheet Range

If your data is not in Sheet1 or uses different columns, you can modify the range in `services/googleSheets.ts`:

```typescript
// Change this line in getInventoryData method
const range = 'Sheet1!A:F'; // Default range
```

### Multiple Sheets

To use multiple sheets, you can modify the service to handle different ranges or create separate service instances. 
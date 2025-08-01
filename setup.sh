#!/bin/bash

echo "🚀 Setting up Inventory Management App"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Google Sheets Configuration
# Replace these values with your actual Google Sheets API credentials

# Your Google Spreadsheet ID (found in the URL of your Google Sheet)
EXPO_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# Your Google API Key (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# Optional: Access Token for OAuth2 authentication
# Leave empty if using API key authentication
EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN=your_access_token_here
EOF
    echo "✅ .env file created"
    echo "⚠️  Please update the .env file with your Google Sheets credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your Google Sheets credentials"
echo "2. Create a Google Sheet with columns: Item Name, Item Code, Stock Volume, Unit Measurement, Minimum Value, Last Updated"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "For detailed setup instructions, see README.md" 
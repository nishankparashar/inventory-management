# Automatic Token Refresh Setup

## Overview
This update implements automatic OAuth2 token refresh functionality, eliminating the need to manually update access tokens every hour. The system now automatically refreshes tokens before they expire and stores them securely.

## Features Added

### 1. Automatic Token Refresh
- **Token Manager**: Centralized token management with automatic refresh
- **Expiration Detection**: Monitors token expiration with 5-minute buffer
- **Background Refresh**: Refreshes tokens automatically before they expire
- **Concurrent Request Handling**: Prevents multiple simultaneous refresh attempts

### 2. Secure Token Storage
- **AsyncStorage**: Tokens stored securely in device storage
- **Encrypted Storage**: Tokens persist across app restarts
- **Automatic Cleanup**: Failed tokens are automatically cleared

### 3. User Interface
- **Settings Screen**: New tab for OAuth2 management
- **OAuth Setup Component**: Easy token configuration
- **Token Status Display**: Shows authentication status and expiration
- **Manual Refresh**: Option to manually refresh tokens

### 4. Enhanced Error Handling
- **Graceful Degradation**: Falls back to read-only mode when tokens fail
- **Clear Error Messages**: User-friendly error notifications
- **Automatic Recovery**: Attempts to refresh failed tokens

## Setup Instructions

### Step 1: Get OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add these authorized redirect URIs:
   - `http://localhost:8081`
   - `http://localhost:19006`
   - `exp://localhost:19000`
7. Click "Create"
8. Note your **Client ID** and **Client Secret**

### Step 2: Get Initial Tokens

#### Option A: Google OAuth Playground (Recommended)

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the settings icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your OAuth2 client ID and client secret
5. Close settings
6. In the left panel, find "Google Sheets API v4"
7. Select "https://www.googleapis.com/auth/spreadsheets"
8. Click "Authorize APIs"
9. Sign in with your Google account
10. Click "Exchange authorization code for tokens"
11. Copy both the **Access token** and **Refresh token**

#### Option B: Using the App

1. Open the app and go to the **Settings** tab
2. Tap "Setup OAuth2"
3. Follow the instructions to get tokens from Google OAuth Playground
4. Enter the tokens in the app

### Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=your_sheet_id
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_oauth_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_oauth_client_secret
```

### Step 4: Save Tokens in App

1. Go to **Settings** tab
2. Tap "Setup OAuth2"
3. Enter your access token and refresh token
4. Tap "Save Tokens"

## How It Works

### Token Lifecycle
1. **Initial Setup**: User provides access token and refresh token
2. **Storage**: Tokens stored securely in AsyncStorage
3. **Automatic Refresh**: System checks token expiration before each API call
4. **Background Refresh**: If token expires within 5 minutes, it's refreshed automatically
5. **Error Recovery**: Failed refreshes trigger re-authentication

### Refresh Process
```typescript
// Before each API call
const accessToken = await tokenManager.getAccessToken();

// If token is expired or will expire soon
if (isExpired(token)) {
  // Automatically refresh using refresh token
  const newToken = await refreshAccessToken();
  // Update stored token data
  await setTokenData(newToken);
}
```

### Security Features
- **Token Isolation**: Each app instance has its own token storage
- **Automatic Cleanup**: Failed tokens are removed automatically
- **No Token Logging**: Tokens are never logged to console
- **Secure Storage**: Uses React Native's secure storage

## User Interface

### Settings Tab
- **Authentication Status**: Shows if user is authenticated
- **Token Expiration**: Displays when current token expires
- **Setup OAuth2**: Button to configure OAuth2 tokens
- **Refresh Token**: Manual refresh option
- **Logout**: Clear stored tokens

### OAuth Setup Screen
- **Access Token Input**: Multi-line text input for access token
- **Refresh Token Input**: Multi-line text input for refresh token
- **Expiration Time**: Configurable token expiration (default: 3600 seconds)
- **Save/Clear**: Buttons to save or clear tokens
- **Instructions**: Step-by-step guide to get tokens

## Error Handling

### Common Scenarios
1. **Token Expired**: Automatically refreshed in background
2. **Refresh Failed**: User prompted to re-authenticate
3. **Network Error**: Retry mechanism with exponential backoff
4. **Invalid Tokens**: Automatic cleanup and re-authentication prompt

### Error Messages
- "Authentication failed. Please check your OAuth2 credentials or re-authenticate."
- "Token refresh failed. Please re-authenticate."
- "No refresh token available. Please re-authenticate."

## Benefits

### For Users
- **No Manual Token Updates**: Tokens refresh automatically
- **Persistent Authentication**: Stay logged in across app restarts
- **Better UX**: No interruptions for token management
- **Clear Status**: Always know authentication status

### For Developers
- **Centralized Management**: Single point for token handling
- **Automatic Recovery**: Self-healing token system
- **Better Error Handling**: Graceful degradation
- **Security**: Secure token storage and handling

## Troubleshooting

### "Token refresh failed"
- Check your OAuth2 client credentials
- Ensure refresh token is valid
- Try re-authenticating in Settings

### "No refresh token available"
- You need to get a new refresh token
- Use Google OAuth Playground to get fresh tokens
- Save both access and refresh tokens

### "Authentication failed"
- Verify your Google Sheet is shared with your account
- Check OAuth2 scope includes write permissions
- Ensure tokens are properly saved in Settings

## Migration from Manual Tokens

If you were using manual access tokens:

1. **Backup**: Note your current access token
2. **Get Refresh Token**: Use Google OAuth Playground to get refresh token
3. **Update App**: Install the new version with token refresh
4. **Setup OAuth2**: Go to Settings and configure OAuth2
5. **Test**: Try a buy/sell operation to verify it works

## Technical Details

### Files Added/Modified
- `services/tokenManager.ts`: Core token management logic
- `components/OAuthSetup.tsx`: OAuth2 setup interface
- `app/(tabs)/settings.tsx`: Settings screen with OAuth management
- `services/googleSheets.ts`: Updated to use token manager
- `hooks/useInventory.ts`: Initialize token manager on startup
- `app/(tabs)/_layout.tsx`: Added settings tab

### Dependencies Added
- `@react-native-async-storage/async-storage`: Secure token storage

### Environment Variables
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: OAuth2 client ID
- `EXPO_PUBLIC_GOOGLE_CLIENT_SECRET`: OAuth2 client secret

## Security Notes

- **Client Secret**: In production, client secret should be kept server-side
- **Token Storage**: Tokens are stored locally on device
- **Scope**: Uses minimal scope for Google Sheets access
- **Expiration**: Tokens automatically expire and refresh
- **Revocation**: Users can clear tokens anytime in Settings 
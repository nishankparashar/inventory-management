# OAuth2 Setup Guide for Write Access

## Why OAuth2 is Needed

Your inventory app currently has **read-only access** to Google Sheets using an API key. To enable **buy/sell functionality** (writing data), you need OAuth2 authentication.

## Step-by-Step OAuth2 Setup

### Step 1: Create OAuth2 Credentials

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
8. Download the JSON file

### Step 2: Get Access Token

#### Option A: Using Google OAuth Playground (Easiest)

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
11. Copy the "Access token" value

#### Option B: Using a Simple Web App

Create a simple HTML file to get the access token:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Google OAuth2 Token</title>
</head>
<body>
    <button onclick="authorize()">Get Access Token</button>
    <div id="result"></div>

    <script>
        const CLIENT_ID = 'YOUR_CLIENT_ID';
        const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
        
        function authorize() {
            gapi.load('auth2', function() {
                gapi.auth2.init({client_id: CLIENT_ID}).then(function(auth2) {
                    auth2.signIn().then(function(googleUser) {
                        const token = googleUser.getAuthResponse().access_token;
                        document.getElementById('result').innerHTML = 
                            '<p>Access Token: <code>' + token + '</code></p>';
                    });
                });
            });
        }
    </script>
    <script src="https://apis.google.com/js/api.js"></script>
</body>
</html>
```

### Step 3: Update Your .env File

Add the access token to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=1Cad8ILGK1nVIf_WoVqbb0Y-fbvxpIyi0_he52tU32Xg
EXPO_PUBLIC_GOOGLE_API_KEY=AIzaSyBwBldYHDUIRb3HJ_nu37N-pF25Cn8TULk
EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
```

### Step 4: Test the Setup

1. Restart your development server: `npm run dev`
2. Try buying or selling an item
3. Check your Google Sheet to see if the stock updates

## Important Notes

### Access Token Expiration
- Access tokens expire after 1 hour
- You'll need to refresh the token periodically
- For production apps, implement token refresh logic

### Security
- Never commit access tokens to version control
- Use environment variables in production
- Consider using a backend service for token management

### Alternative: Service Account (Recommended for Production)

For production apps, consider using a service account instead:

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Download the JSON key file
4. Share your Google Sheet with the service account email
5. Use the service account credentials in your app

## Troubleshooting

### "Access token expired"
- Get a new access token using the OAuth Playground
- Update your `.env` file

### "Permission denied"
- Ensure your Google Sheet is shared with your account
- Check that the OAuth2 scope includes write permissions

### "Invalid credentials"
- Verify your OAuth2 client ID and secret
- Make sure you're using the correct redirect URIs

## Quick Test

After setting up OAuth2, you can test the API directly:

```bash
curl -X PUT "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1!C2:F2?valueInputOption=USER_ENTERED" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"values":[["20","","","2024-07-30T01:30:00Z"]]}'
```

This should update the stock of your first item to 20. 
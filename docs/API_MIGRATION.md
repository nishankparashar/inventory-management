# API Migration Guide

## Overview

This guide explains how to migrate from the insecure frontend Google Sheets integration to the new secure backend API implementation.

## What Changed

### Before (Insecure)
```
Frontend App → Google Sheets API (Direct)
     ↑
  Exposed credentials in EXPO_PUBLIC_* variables
```

### After (Secure)
```
Frontend App → Backend API → Google Sheets API
     ↑            ↑              ↑
  No credentials  Secure creds   OAuth2/API Key
```

## Migration Steps

### Step 1: Update Environment Variables

#### Remove from Frontend (.env)
```env
# DELETE these lines - they're no longer needed
EXPO_PUBLIC_GOOGLE_SHEETS_ID=...
EXPO_PUBLIC_GOOGLE_API_KEY=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=...
EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN=...
EXPO_PUBLIC_GOOGLE_REFRESH_TOKEN=...
```

#### Add to Backend (.env)
```env
# ADD these lines - secure backend credentials
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_ACCESS_TOKEN=your_access_token_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### Step 2: Test the Migration

#### 1. Start the Development Server
```bash
npm run dev
```

#### 2. Verify API Endpoints
Open your browser's developer tools and check:

**GET Request Test:**
```javascript
fetch('/api/inventory')
  .then(response => response.json())
  .then(data => console.log('Inventory data:', data));
```

**PUT Request Test:**
```javascript
fetch('/api/inventory', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemId: '1',
    stockVol: 20,
    type: 'buy',
    quantity: 5
  })
})
.then(response => response.json())
.then(data => console.log('Update result:', data));
```

### Step 3: Verify Security

#### Check Frontend Environment
In browser console, verify credentials are not exposed:
```javascript
// These should all be undefined
console.log('EXPO_PUBLIC_GOOGLE_SHEETS_ID:', process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID);
console.log('EXPO_PUBLIC_GOOGLE_API_KEY:', process.env.EXPO_PUBLIC_GOOGLE_API_KEY);
```

#### Check Backend Logs
Server console should show:
```
✅ Google Sheets ID configured
✅ API Key configured  
✅ OAuth credentials configured
✅ Token refresh working
```

## API Reference

### GET /api/inventory

**Purpose**: Fetch all inventory items

**Authentication**: None required (handled by backend)

**Response**:
```json
{
  "data": [
    {
      "id": "1",
      "item_name": "Laptop Dell XPS 13",
      "item_code": "LAP001", 
      "stock_vol": 15,
      "unit_measurement": "units",
      "min_value": 5,
      "location": "Warehouse A",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### PUT /api/inventory

**Purpose**: Update inventory item stock level

**Authentication**: None required (handled by backend)

**Request Body**:
```json
{
  "itemId": "1",
  "stockVol": 20,
  "type": "buy",
  "quantity": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Added 5 items"
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid item ID"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch inventory data"
}
```

### Frontend Error Handling
The frontend automatically handles these errors and shows appropriate messages to users.

## Security Features

### 1. **Rate Limiting**
- 100 requests per minute per IP
- Prevents API abuse
- Configurable limits

### 2. **Input Validation**
- All request data validated
- Type checking enforced
- SQL injection prevention

### 3. **Credential Protection**
- Google credentials never sent to frontend
- OAuth tokens managed securely on backend
- Automatic token refresh

### 4. **CORS Protection**
- Proper CORS headers
- Origin validation
- Preflight request handling

## Troubleshooting

### "Failed to fetch inventory data"

**Possible Causes:**
1. Backend environment variables not set
2. Google Sheets API not enabled
3. Invalid spreadsheet ID
4. Network connectivity issues

**Solutions:**
1. Check `.env` file has all required variables
2. Verify Google Cloud Console API settings
3. Test spreadsheet access manually
4. Check server logs for detailed errors

### "Authentication failed"

**Possible Causes:**
1. Invalid OAuth2 credentials
2. Expired refresh token
3. Insufficient API permissions

**Solutions:**
1. Regenerate OAuth2 credentials
2. Get new refresh token from OAuth Playground
3. Verify Google Sheets API scope permissions

### "Rate limit exceeded"

**Possible Causes:**
1. Too many requests from same IP
2. Automated scripts hitting API

**Solutions:**
1. Wait for rate limit window to reset
2. Implement request throttling in frontend
3. Contact admin to adjust rate limits

## Performance Considerations

### 1. **Caching**
- Backend can implement caching for frequently accessed data
- Reduces Google Sheets API calls
- Improves response times

### 2. **Batch Operations**
- Multiple updates can be batched into single Google Sheets call
- Reduces API quota usage
- Better performance for bulk operations

### 3. **Connection Pooling**
- Reuse HTTP connections to Google Sheets API
- Reduces connection overhead
- Better resource utilization

## Next Steps

1. **Monitor API Usage**: Track request patterns and performance
2. **Add Authentication**: Implement user authentication for multi-tenant support
3. **Add Caching**: Implement Redis or in-memory caching for better performance
4. **Add Logging**: Implement structured logging for better monitoring
5. **Add Tests**: Create unit and integration tests for API endpoints

The migration to a secure backend API provides a solid foundation for scaling your inventory management system while maintaining the highest security standards.
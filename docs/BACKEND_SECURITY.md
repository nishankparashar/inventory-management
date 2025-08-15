# Backend Security Implementation

## Overview

This document outlines the secure backend implementation that protects Google Sheets API credentials by moving them from frontend environment variables to a secure server-side API.

## Security Improvements

### 1. **Credential Protection**
- **Before**: Google API credentials exposed in `EXPO_PUBLIC_*` environment variables
- **After**: All credentials stored securely on the backend, never exposed to client

### 2. **API Endpoints**
- **GET /api/inventory**: Fetch inventory data from Google Sheets
- **PUT /api/inventory**: Update inventory items with transaction data
- **OPTIONS /api/inventory**: CORS preflight handling

### 3. **Authentication Flow**
```
Frontend → Backend API → Google Sheets API
   ↑           ↑              ↑
   No creds   Secure creds   OAuth2/API Key
```

## Backend Implementation

### API Route Structure
```
app/
└── api/
    └── inventory+api.ts    # Secure API endpoints
```

### Security Features

#### 1. **Rate Limiting**
- 100 requests per minute per client IP
- Prevents API abuse and DoS attacks
- Configurable limits for different environments

#### 2. **Input Validation**
- Validates all incoming request data
- Type checking for critical parameters
- Sanitizes user inputs to prevent injection attacks

#### 3. **Token Management**
- Automatic OAuth2 token refresh
- 5-minute expiration buffer for proactive refresh
- Secure token storage on server

#### 4. **Error Handling**
- Detailed server-side logging
- Generic error messages to client (no sensitive info)
- Proper HTTP status codes

### Environment Variables (Backend)

```env
# Secure backend environment variables
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_ACCESS_TOKEN=your_access_token
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

**Key Changes:**
- Removed `EXPO_PUBLIC_` prefix (no longer exposed to frontend)
- All credentials now server-side only
- Frontend has no access to sensitive data

## Frontend Changes

### 1. **API Client Service**
- New `ApiClient` class handles all server communication
- Abstracts API calls from components
- Centralized error handling and retry logic

### 2. **Removed Direct Google Sheets Access**
- No more direct Google Sheets API calls from frontend
- All operations go through secure backend API
- Simplified frontend code with better separation of concerns

### 3. **Updated Hooks**
- `useInventory` hook now uses `ApiClient` instead of direct Google Sheets service
- Removed token manager initialization from frontend
- Cleaner, more focused frontend logic

## API Endpoints Documentation

### GET /api/inventory

**Description**: Fetch all inventory items from Google Sheets

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

**Error Response**:
```json
{
  "error": "Failed to fetch inventory data"
}
```

### PUT /api/inventory

**Description**: Update inventory item stock level

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

**Error Response**:
```json
{
  "error": "Invalid item ID"
}
```

## Security Best Practices Implemented

### 1. **Principle of Least Privilege**
- Frontend only has access to necessary API endpoints
- Backend handles all sensitive operations
- Google credentials isolated to server environment

### 2. **Defense in Depth**
- Rate limiting at API level
- Input validation on all requests
- CORS protection for cross-origin requests
- Proper error handling without information leakage

### 3. **Token Security**
- Automatic token refresh prevents expired token issues
- Tokens never transmitted to frontend
- Secure server-side token storage

### 4. **Audit Trail**
- Server-side logging of all operations
- Error tracking and monitoring
- Request/response logging for debugging

## Deployment Considerations

### 1. **Environment Configuration**
```bash
# Production environment variables
GOOGLE_SHEETS_ID=prod_spreadsheet_id
GOOGLE_API_KEY=prod_api_key
GOOGLE_CLIENT_ID=prod_oauth_client_id
GOOGLE_CLIENT_SECRET=prod_oauth_client_secret
GOOGLE_ACCESS_TOKEN=prod_access_token
GOOGLE_REFRESH_TOKEN=prod_refresh_token
```

### 2. **HTTPS Requirements**
- All API communications must use HTTPS in production
- SSL/TLS certificates properly configured
- Secure headers implemented

### 3. **Monitoring**
- API endpoint monitoring
- Error rate tracking
- Performance metrics
- Security event logging

## Migration Guide

### Step 1: Update Environment Variables
1. Remove all `EXPO_PUBLIC_GOOGLE_*` variables from frontend `.env`
2. Add backend environment variables without `EXPO_PUBLIC_` prefix
3. Ensure backend has access to all required credentials

### Step 2: Test API Endpoints
1. Start the development server
2. Test GET /api/inventory endpoint
3. Test PUT /api/inventory endpoint with sample data
4. Verify error handling works correctly

### Step 3: Verify Security
1. Check that frontend cannot access Google credentials
2. Verify rate limiting is working
3. Test token refresh functionality
4. Confirm CORS headers are properly set

## Benefits

### 1. **Enhanced Security**
- Google API credentials never exposed to client
- Reduced attack surface
- Better compliance with security standards

### 2. **Better Architecture**
- Clear separation between frontend and backend
- Centralized API logic
- Easier to maintain and scale

### 3. **Improved Reliability**
- Automatic token refresh
- Better error handling
- Rate limiting prevents abuse

### 4. **Future-Proof**
- Easy to add authentication
- Scalable for multiple clients
- Ready for production deployment

The backend now securely handles all Google Sheets operations while maintaining the same functionality for the frontend users.
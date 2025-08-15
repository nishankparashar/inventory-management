import { InventoryItem } from '@/types/inventory';

// Backend environment variables (secure)
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting middleware
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute

  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false;
  }
  
  clientData.count++;
  return true;
}

// Token management
let tokenData: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
} | null = null;

async function getValidAccessToken(): Promise<string> {
  // Initialize token data if not set
  if (!tokenData && GOOGLE_ACCESS_TOKEN && GOOGLE_REFRESH_TOKEN) {
    tokenData = {
      access_token: GOOGLE_ACCESS_TOKEN,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      expires_at: Date.now() + (3600 * 1000), // 1 hour from now
    };
  }

  if (!tokenData) {
    throw new Error('No OAuth credentials configured');
  }

  // Check if token needs refresh (5 minute buffer)
  const bufferTime = 5 * 60 * 1000;
  if (Date.now() >= (tokenData.expires_at - bufferTime)) {
    await refreshAccessToken();
  }

  return tokenData.access_token;
}

async function refreshAccessToken(): Promise<void> {
  if (!tokenData?.refresh_token || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing OAuth credentials for token refresh');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }

    tokenData = {
      ...tokenData,
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    };

    console.log('Access token refreshed successfully');
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token');
  }
}

// Google Sheets API functions
async function fetchInventoryData(): Promise<InventoryItem[]> {
  if (!GOOGLE_SHEETS_ID) {
    throw new Error('Google Sheets ID not configured');
  }

  const range = 'Sheet1!A:G';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}`;
  
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Try OAuth first, fallback to API key
  try {
    const accessToken = await getValidAccessToken();
    headers['Authorization'] = `Bearer ${accessToken}`;
  } catch (error) {
    console.log('OAuth not available, using API key');
    if (!GOOGLE_API_KEY) {
      throw new Error('No authentication method available');
    }
  }

  const requestUrl = headers.Authorization 
    ? url 
    : `${url}?key=${GOOGLE_API_KEY}`;

  const response = await fetch(requestUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rows = data.values || [];
  
  if (rows.length === 0) return [];

  // Convert rows to inventory items (skip header row)
  return rows.slice(1).map((row: any[], index: number) => ({
    id: (index + 1).toString(),
    item_name: row[0] || '',
    item_code: row[1] || '',
    stock_vol: parseFloat(row[2]) || 0,
    unit_measurement: row[3] || '',
    min_value: parseFloat(row[4]) || 0,
    location: row[5] || '',
    last_updated: row[6] || new Date().toISOString(),
  }));
}

async function updateInventoryItem(itemId: string, newStockVol: number): Promise<boolean> {
  if (!GOOGLE_SHEETS_ID) {
    throw new Error('Google Sheets ID not configured');
  }

  // Get access token (required for write operations)
  const accessToken = await getValidAccessToken();
  
  // First, get current data to preserve other fields
  const currentData = await fetchInventoryData();
  const currentItem = currentData.find(item => item.id === itemId);
  
  if (!currentItem) {
    throw new Error('Item not found');
  }

  const rowNumber = parseInt(itemId) + 1; // +1 because itemId is 0-based but sheets are 1-based
  const range = `Sheet1!C${rowNumber}:G${rowNumber}`;
  const values = [
    [
      newStockVol,
      currentItem.unit_measurement || '',
      currentItem.min_value || 0,
      currentItem.location || '',
      new Date().toISOString()
    ]
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to update inventory: ${response.status} ${errorData.error?.message || response.statusText}`);
  }

  return true;
}

// Input validation
function validateInventoryUpdate(data: any): { itemId: string; stockVol: number; type: string; quantity: number } {
  const { itemId, stockVol, type, quantity } = data;
  
  if (!itemId || typeof itemId !== 'string') {
    throw new Error('Invalid item ID');
  }
  
  if (typeof stockVol !== 'number' || stockVol < 0) {
    throw new Error('Invalid stock volume');
  }
  
  if (!['buy', 'sell'].includes(type)) {
    throw new Error('Invalid transaction type');
  }
  
  if (typeof quantity !== 'number' || quantity <= 0) {
    throw new Error('Invalid quantity');
  }
  
  return { itemId, stockVol, type, quantity };
}

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const inventory = await fetchInventoryData();
    
    return new Response(
      JSON.stringify({ data: inventory }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('GET /api/inventory error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    const { itemId, stockVol, type, quantity } = validateInventoryUpdate(body);
    
    const success = await updateInventoryItem(itemId, stockVol);
    
    if (success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${type === 'buy' ? 'Added' : 'Removed'} ${quantity} items` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      throw new Error('Failed to update inventory');
    }
  } catch (error) {
    console.error('PUT /api/inventory error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
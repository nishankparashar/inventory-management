import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  created_at: number;
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export class TokenManager {
  private static instance: TokenManager;
  private clientId: string;
  private clientSecret: string;
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('google_oauth_token');
      if (storedToken) {
        this.tokenData = JSON.parse(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored token:', error);
    }
  }

  async setTokenData(tokenData: TokenData): Promise<void> {
    this.tokenData = {
      ...tokenData,
      created_at: Date.now(),
    };
    
    try {
      await AsyncStorage.setItem('google_oauth_token', JSON.stringify(this.tokenData));
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.tokenData) {
      // Try to initialize from environment variables if no stored token
      await this.initializeFromEnv();
      if (!this.tokenData) {
        return null;
      }
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const expiresAt = this.tokenData.created_at + (this.tokenData.expires_in * 1000);
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (now >= (expiresAt - bufferTime)) {
      // Token is expired or will expire soon, refresh it
      return this.refreshAccessToken();
    }

    return this.tokenData.access_token;
  }

  private async initializeFromEnv(): Promise<void> {
    const accessToken = process.env.EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN;
    const refreshToken = process.env.EXPO_PUBLIC_GOOGLE_REFRESH_TOKEN;
    
    if (accessToken && refreshToken) {
      const tokenData: TokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600, // Default 1 hour
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        created_at: Date.now() - (3600 * 1000), // Mark as expired to force refresh
      };
      
      await this.setTokenData(tokenData);
    }
  }

  private async refreshAccessToken(): Promise<string> {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenData?.refresh_token) {
      throw new Error('No refresh token available. Please re-authenticate.');
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.tokenData!.refresh_token,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const newTokenData: TokenData = {
        ...this.tokenData!,
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        created_at: Date.now(),
      };

      await this.setTokenData(newTokenData);
      console.log('Token refreshed successfully');
      
      return response.data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear stored token if refresh fails
      await this.clearTokenData();
      
      throw new Error('Token refresh failed. Please re-authenticate.');
    }
  }

  async clearTokenData(): Promise<void> {
    this.tokenData = null;
    try {
      await AsyncStorage.removeItem('google_oauth_token');
    } catch (error) {
      console.error('Error clearing stored token:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.tokenData !== null;
  }

  async getStoredTokenData(): Promise<TokenData | null> {
    return this.tokenData;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance(); 
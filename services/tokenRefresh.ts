import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@env';

const REFRESH_TOKEN_KEY = 'EXPO_PUBLIC_GOOGLE_REFRESH_TOKEN';
const ACCESS_TOKEN_KEY = 'EXPO_PUBLIC_GOOGLE_ACCESS_TOKEN';

export async function refreshAccessToken() {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh token');
    }

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}
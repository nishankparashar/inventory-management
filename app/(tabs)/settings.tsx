import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Settings, Shield, RefreshCw, LogOut } from 'lucide-react-native';
import { tokenManager } from '@/services/tokenManager';
import OAuthSetup from '@/components/OAuthSetup';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/styles';

export default function SettingsScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    loadTokenStatus();
  }, []);

  const loadTokenStatus = async () => {
    const authenticated = tokenManager.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const tokenData = await tokenManager.getStoredTokenData();
      setTokenInfo(tokenData);
    }
  };

  const handleAuthenticationComplete = () => {
    setShowOAuthSetup(false);
    loadTokenStatus();
  };

  const handleRefreshToken = async () => {
    try {
      const newToken = await tokenManager.getAccessToken();
      if (newToken) {
        Alert.alert('Success', 'Token refreshed successfully!');
        loadTokenStatus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh token. Please re-authenticate.');
      console.error('Token refresh error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to clear your OAuth2 tokens? This will disable buy/sell functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await tokenManager.clearTokenData();
            setIsAuthenticated(false);
            setTokenInfo(null);
            Alert.alert('Success', 'Logged out successfully.');
          },
        },
      ]
    );
  };

  if (showOAuthSetup) {
    return <OAuthSetup onAuthenticationComplete={handleAuthenticationComplete} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Settings size={28} color={Colors.primary} />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Shield size={20} color={isAuthenticated ? Colors.success : Colors.error} />
            <Text style={styles.statusTitle}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Text>
          </View>
          
          <Text style={styles.statusText}>
            {isAuthenticated 
              ? 'You can use buy/sell functionality'
              : 'OAuth2 authentication required for write access'
            }
          </Text>

          {isAuthenticated && tokenInfo && (
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenLabel}>Token expires:</Text>
              <Text style={styles.tokenValue}>
                {new Date(tokenInfo.created_at + (tokenInfo.expires_in * 1000)).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!isAuthenticated ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setShowOAuthSetup(true)}
            >
              <Text style={styles.buttonText}>Setup OAuth2</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRefreshToken}
              >
                <RefreshCw size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Refresh Token</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={Colors.error} />
                <Text style={styles.dangerButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            This app uses Google Sheets API for inventory management. 
            OAuth2 authentication is required for write operations (buy/sell).
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tokenInfo: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tokenLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  tokenValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  dangerButtonText: {
    color: Colors.error,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  infoCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
}); 
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { tokenManager } from '@/services/tokenManager';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/styles';

interface OAuthSetupProps {
  onAuthenticationComplete: () => void;
}

export default function OAuthSetup({ onAuthenticationComplete }: OAuthSetupProps) {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiresIn, setExpiresIn] = useState('3600');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveTokens = async () => {
    if (!accessToken.trim() || !refreshToken.trim()) {
      Alert.alert('Missing Information', 'Please provide both access token and refresh token.');
      return;
    }

    setIsProcessing(true);
    try {
      const tokenData = {
        access_token: accessToken.trim(),
        refresh_token: refreshToken.trim(),
        expires_in: parseInt(expiresIn) || 3600,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        created_at: Date.now(),
      };

      await tokenManager.setTokenData(tokenData);
      Alert.alert('Success', 'OAuth2 tokens saved successfully! You can now use buy/sell functionality.');
      onAuthenticationComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save tokens. Please try again.');
      console.error('Error saving tokens:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearTokens = async () => {
    Alert.alert(
      'Clear Tokens',
      'Are you sure you want to clear the stored OAuth2 tokens?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await tokenManager.clearTokenData();
            Alert.alert('Success', 'Tokens cleared successfully.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OAuth2 Setup</Text>
        <Text style={styles.subtitle}>
          To enable buy/sell functionality, you need to set up OAuth2 authentication.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Access Token</Text>
          <TextInput
            style={styles.input}
            value={accessToken}
            onChangeText={setAccessToken}
            placeholder="Enter your access token"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Refresh Token</Text>
          <TextInput
            style={styles.input}
            value={refreshToken}
            onChangeText={setRefreshToken}
            placeholder="Enter your refresh token"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Expires In (seconds)</Text>
          <TextInput
            style={styles.input}
            value={expiresIn}
            onChangeText={setExpiresIn}
            placeholder="3600"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveTokens}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Saving...' : 'Save Tokens'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleClearTokens}
          >
            <Text style={styles.secondaryButtonText}>Clear Tokens</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Get Tokens:</Text>
        <Text style={styles.instructionText}>
          1. Go to Google OAuth Playground{'\n'}
          2. Set up your OAuth2 credentials{'\n'}
          3. Select Google Sheets API v4{'\n'}
          4. Authorize and exchange for tokens{'\n'}
          5. Copy both access token and refresh token
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  instructions: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  instructionsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
}); 
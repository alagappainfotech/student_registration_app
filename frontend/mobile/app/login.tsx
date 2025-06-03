import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { navigateToDashboard } from './utils/navigation';
import { Logger } from './utils/logger';
import { AuthenticationError, NetworkError, handleError } from './utils/errorHandler';
import { AppRoute } from './types/navigation';

import { NetworkState } from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  role: string;
  [key: string]: any;
};

interface LoginScreenProps {
  // Add any props needed for the login screen
}

export default function LoginScreen({}: LoginScreenProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true
  });

  useEffect(() => {
    const updateNetworkState = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const simplifiedState: NetworkState = {
          isConnected: state.isConnected || false,
          isInternetReachable: state.isInternetReachable || false
        };
        setNetworkState(simplifiedState);
        
        // Check if we need to redirect based on token
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            const role = decoded.role?.toLowerCase();
            if (role) {
              try {
                navigateToDashboard(role);
              } catch (error) {
                handleError(error);
              }
            } else {
              // Clear invalid token
              await AsyncStorage.removeItem('access_token');
            }
          } catch (error: any) {
            Logger.info('Error:', error);
            // Clear invalid token
            await AsyncStorage.removeItem('access_token');
          }
        }
      } catch (error: any) {
        Logger.info('Failed to get network state or token', error);
        Logger.error('Failed to get network state or token', error);
      }
    };

    // Initial check
    updateNetworkState();

    // Listen for network changes
    const subscription = Network.addEventListener(Network.StateChangeEvent, updateNetworkState);

    return () => {
      subscription.remove();
    };
  }, [router]);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new NetworkError('No internet connection available');
      }

      if (!username || !password) {
        throw new AuthenticationError('Username and password are required');
      }

      try {
        // Get the IP address from AsyncStorage if it exists, otherwise use default
        const ipAddress = await AsyncStorage.getItem('api_ip') || '192.168.1.45';
        const port = await AsyncStorage.getItem('api_port') || '8081';
        
        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(`http://${ipAddress}:${port}/api/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            signal: controller.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new AuthenticationError(errorData.detail || 'Login failed');
          }

          const loginData = await response.json();
          const token = loginData.access_token;
          const decoded = jwtDecode<JwtPayload>(token);
          const role = decoded.role?.toLowerCase();

          if (!role) {
            throw new AuthenticationError('Invalid token: missing role');
          }

          await AsyncStorage.setItem('access_token', token);
          await navigateToDashboard(role);
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new NetworkError('Request timed out');
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error: any) {
        Logger.error('Login failed', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    } catch (error: any) {
      Logger.error('Login failed', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24 
    },
    title: { 
      fontSize: 24, 
      marginBottom: 24 
    },
    error: {
      color: 'red',
      marginBottom: 16,
      textAlign: 'center'
    },
    input: { 
      width: '100%', 
      borderWidth: 1, 
      borderColor: '#ccc', 
      borderRadius: 6, 
      padding: 10, 
      marginBottom: 16 
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile LMS Login</Text>
      
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />

      <Button 
        title={isLoading ? 'Logging in...' : 'Login'} 
        onPress={handleLogin} 
        disabled={isLoading}
      />
    </View>
  );
}

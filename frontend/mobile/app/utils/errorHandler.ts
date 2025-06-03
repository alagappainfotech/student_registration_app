import { Alert } from 'react-native';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error instanceof AuthenticationError) {
      Alert.alert('Authentication Error', error.message);
    } else if (error instanceof NetworkError) {
      Alert.alert('Network Error', error.message);
    } else {
      Alert.alert('Error', error.message);
    }
  } else {
    Alert.alert('Error', 'An unexpected error occurred');
  }
}

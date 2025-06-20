import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FacultyDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>
      <Text>Welcome, Faculty!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

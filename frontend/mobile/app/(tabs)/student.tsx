import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StudentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>
      <Text>Welcome, Student! (Mobile)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 16 },
});

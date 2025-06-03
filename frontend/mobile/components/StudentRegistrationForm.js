import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Snackbar, Text, Card } from 'react-native-paper';
import axios from 'axios';

const initialState = { name: '', email: '', phone: '', date_of_birth: '', address: '' };

export default function StudentRegistrationForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8000/api/students/', form);
      setSuccess(true);
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, justifyContent: 'center', padding: 16 }}
    >
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16, textAlign: 'center' }}>
          Student Registration
        </Text>
        <TextInput
          label="Name"
          value={form.name}
          onChangeText={v => handleChange('name', v)}
          style={{ marginBottom: 8 }}
          mode="outlined"
        />
        <TextInput
          label="Email"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
          style={{ marginBottom: 8 }}
          keyboardType="email-address"
          mode="outlined"
        />
        <TextInput
          label="Phone"
          value={form.phone}
          onChangeText={v => handleChange('phone', v)}
          style={{ marginBottom: 8 }}
          keyboardType="phone-pad"
          mode="outlined"
        />
        <TextInput
          label="Date of Birth (YYYY-MM-DD)"
          value={form.date_of_birth}
          onChangeText={v => handleChange('date_of_birth', v)}
          style={{ marginBottom: 8 }}
          mode="outlined"
        />
        <TextInput
          label="Address"
          value={form.address}
          onChangeText={v => handleChange('address', v)}
          style={{ marginBottom: 8 }}
          multiline
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          Register
        </Button>
        <Snackbar
          visible={success}
          onDismiss={() => setSuccess(false)}
          duration={3000}
          style={{ backgroundColor: 'green' }}
        >
          Registration successful!
        </Snackbar>
        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={{ backgroundColor: 'red' }}
        >
          {error}
        </Snackbar>
      </Card>
    </KeyboardAvoidingView>
  );
}

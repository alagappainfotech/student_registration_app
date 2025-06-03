import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Login from '../components/Login';

// Mock axios and localStorage
jest.mock('axios');

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Login Component', () => {
  const mockSetUser = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset localStorage
    localStorage.clear();
  });

  test('renders login form', () => {
    render(<Login setUser={mockSetUser} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles successful admin login', async () => {
    // Mock successful login response
    const mockLoginResponse = {
      data: {
        tokens: {
          access: 'mock_access_token',
          refresh: 'mock_refresh_token'
        },
        user: { 
          id: 1, 
          username: 'admin', 
          role: 'admin' 
        },
        role: 'admin'
      }
    };
    axios.post.mockResolvedValue(mockLoginResponse);

    // Spy on window.location
    const originalLocation = { ...window.location };
    delete window.location;
    window.location = { 
      ...originalLocation, 
      href: jest.fn() 
    };

    render(<Login setUser={mockSetUser} />);

    // Fill out login form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login to complete
    await waitFor(() => {
      // Check localStorage was set correctly
      expect(localStorage.getItem('access_token')).toBe('mock_access_token');
      expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token');
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 1,
        username: 'admin',
        role: 'admin'
      });

      // Check redirect to admin route
      expect(window.location.href).toBe('/admin');
    }, { timeout: 5000 });
    await flushPromises();
  });

  test('handles login error', async () => {
    // Mock login error response
    const mockErrorResponse = {
      response: {
        data: {
          error: 'Invalid credentials'
        },
        status: 401
      }
    };
    axios.post.mockRejectedValue(mockErrorResponse);

    render(<Login setUser={mockSetUser} />);

    // Fill out login form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBeNull();
    }, { timeout: 5000 });
    await flushPromises();
  });

  test('handles session restoration', async () => {
    // Store original methods
    const originalGetItem = Storage.prototype.getItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalDispatchEvent = window.dispatchEvent;
    const originalIsValidToken = window.isValidToken;

    // Mock window methods and events
    const mockDispatchEvent = jest.fn();
    window.dispatchEvent = mockDispatchEvent;

    // Mock localStorage
    const mockUser = { 
      id: 2, 
      username: 'faculty', 
      role: 'faculty'
    };
    Storage.prototype.getItem = jest.fn((key) => {
      switch(key) {
        case 'user': return JSON.stringify(mockUser);
        case 'access_token': return 'valid_access_token';
        case 'refresh_token': return 'valid_refresh_token';
        default: return null;
      }
    });
    Storage.prototype.removeItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

        case 'user': return JSON.stringify(mockUser);
        case 'access_token': return 'valid_access_token';
        case 'refresh_token': return 'valid_refresh_token';
        default: return null;
    // Mock axios to prevent actual network calls
    axios.post.mockRejectedValue(new Error('No network calls'));
    axios.get.mockRejectedValue(new Error('No network calls'));

    // Mock isValidToken to return true
    const mockIsValidToken = jest.fn((token) => {
      return token === 'valid_access_token' || token === 'valid_refresh_token';
    });
    Object.defineProperty(window, 'isValidToken', { 
      configurable: true, 
      writable: true, 
      value: mockIsValidToken 
    });
    const mockUser = { 
      id: 2, 
      username: 'faculty', 
      role: 'faculty'
    };

    // Store mock user and tokens in localStorage
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'mock_access_token');
    localStorage.setItem('refresh_token', 'mock_refresh_token');

    // Spy on window.location
    const originalLocation = { ...window.location };
    delete window.location;
    window.location = { 
      ...originalLocation, 
      href: jest.fn(() => '/faculty') 
    };

    // Render the Login component
    render(<Login setUser={mockSetUser} />);

    // Wait for session restoration
    await waitFor(async () => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(window.location.href).toBe('/faculty');
    }, { timeout: 5000 });
    await flushPromises();

    // Restore original isValidToken
    Object.defineProperty(window, 'isValidToken', { 
      configurable: true, 
      writable: true, 
      value: originalIsValidToken 
    });
    
    // Restore original location
    window.location = originalLocation;

    // Remove duplicate declaration
    window.isValidToken = jest.fn().mockReturnValue(true);

    render(<Login setUser={mockSetUser} />);

    // Wait for session restoration
    await waitFor(async () => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(window.location.href).toBe('/faculty');
    }, { timeout: 5000 });
    await flushPromises();

    // Restore original isValidToken
    Object.defineProperty(window, 'isValidToken', { 
      configurable: true, 
      writable: true, 
      value: originalIsValidToken 
    });
    
    // Restore original location
    window.location = originalLocation;
  });
});

import '@testing-library/jest-dom';

// Only apply mocks if in a testing environment
if (process.env.NODE_ENV === 'test') {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
}

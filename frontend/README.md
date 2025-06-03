# Frontend Application

This directory contains the frontend code for the Student Registration System, built with React (web) and React Native (mobile).

## 📱 Platforms

- **Web**: Responsive React application
- **Mobile**: Cross-platform mobile app using React Native (Expo)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student_registration_app/frontend
   ```

2. **Install dependencies**
   ```bash
   # For web
   cd web
   npm install
   
   # For mobile
   cd ../mobile
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the web directory with:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

## 🏗 Project Structure

```
frontend/
├── web/                    # React web application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── styles/        # Global styles
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main App component
│   └── package.json
│
└── mobile/                # React Native mobile app
    ├── assets/            # App assets
    ├── src/               # Source code
    │   ├── components/    # Reusable components
    │   ├── navigation/    # Navigation setup
    │   ├── screens/       # App screens
    │   ├── services/      # API services
    │   └── App.js         # Main App component
    └── app.json           # Expo configuration
```

## 🛠 Development

### Web Application

```bash
# Start development server
cd web
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Mobile Application

```bash
# Start Expo development server
cd mobile
expo start

# Run on Android
expo start --android

# Run on iOS
expo start --ios
```

## 🔐 Authentication

The frontend uses JWT for authentication. The authentication flow is as follows:

1. User submits login form with credentials
2. Backend validates credentials and returns JWT tokens
3. Tokens are stored in secure storage (HTTP-only cookies for web, AsyncStorage for mobile)
4. Subsequent requests include the token in the Authorization header

## 📱 Features

### Web
- Responsive design
- Role-based access control
- Form validation
- Real-time updates
- Theme customization

### Mobile
- Offline support
- Push notifications
- Biometric authentication
- Camera integration

## 📚 Documentation

- [React Documentation](https://reactjs.org/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Material-UI Documentation](https://mui.com/)

## 🧪 Testing

Run the test suite:

```bash
# Web tests
cd web
npm test

# Mobile tests
cd ../mobile
npm test
```

## 🚀 Deployment

### Web

1. Build the production bundle:
   ```bash
   cd web
   npm run build
   ```

2. Deploy the `build` directory to your hosting service (Netlify, Vercel, etc.)

### Mobile

1. Build the app:
   ```bash
   cd mobile
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

2. Follow the Expo deployment guide for app store submission

## 👥 User Roles

| Role    | Description                              | Access Level |
|---------|------------------------------------------|--------------|
| Admin   | Full system access                       | Full         |
| Faculty | Manage courses and students             | Limited      |
| Student | View courses and personal information   | Basic        |


## 🔗 Login Credentials

| Role     | Username  | Password    | Web URL                         |
|----------|-----------|-------------|---------------------------------|
| Admin    | admin     | admin123    | http://localhost:5173/admin    |
| Faculty  | faculty1  | faculty123  | http://localhost:5173/faculty  |
| Student  | student1  | student123  | http://localhost:5173/student  |

> **Note:** Replace `localhost` and ports with your actual deployment URLs.

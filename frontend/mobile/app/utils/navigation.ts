import { useRouter } from 'expo-router';
import { AppRoute } from '../types/navigation';

export const getUserDashboardRoute = (role: string): AppRoute => {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'admin':
      return '../admin/dashboard';
    case 'faculty':
      return '../faculty/dashboard';
    case 'student':
      return '../student/dashboard';
    default:
      throw new Error(`Unknown role: ${normalizedRole}`);
  }
};

export const validateRoute = (route: AppRoute): boolean => {
  const validRoutes: AppRoute[] = ['../admin/dashboard', '../faculty/dashboard', '../student/dashboard'];
  return validRoutes.includes(route);
};

export const navigateToDashboard = (role: string): void => {
  try {
    const route = getUserDashboardRoute(role);
    if (!validateRoute(route)) {
      throw new Error('Invalid dashboard route');
    }
    
    // Get router instance
    const router = useRouter();
    if (!router) {
      throw new Error('Router not available');
    }

    // Push to route
    router.push(route);
  } catch (error: any) {
    console.error('Navigation error:', error);
    throw new Error(error.message || 'Failed to navigate to dashboard');
  }
};

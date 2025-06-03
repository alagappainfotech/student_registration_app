export const getUserDashboardRoute = (role: string): string => {
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

export type DashboardRoutes = ReturnType<typeof getUserDashboardRoute>;

// Ensure the routes are valid
export const validateRoute = (route: string): boolean => {
  const validRoutes = ['../admin/dashboard', '../faculty/dashboard', '../student/dashboard'];
  return validRoutes.includes(route);
};

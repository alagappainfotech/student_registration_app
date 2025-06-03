export type RoutePath = string & { __route: true };

export type DashboardRoutes = {
  admin: RoutePath;
  faculty: RoutePath;
  student: RoutePath;
};

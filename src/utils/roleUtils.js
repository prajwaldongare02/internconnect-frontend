// Central place that maps a user role to its dashboard route and label.
// Keeping this in one file means every component (Navbar, Sidebar, Login,
// ProtectedRoute...) redirects consistently when new roles are added.

export const ROLES = {
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  PLACEMENT_OFFICER: 'PLACEMENT_OFFICER',
  ADMIN: 'ADMIN',
};

export const dashboardPathForRole = (role) => {
  switch (role) {
    case ROLES.COMPANY:
      return '/company-dashboard';
    case ROLES.PLACEMENT_OFFICER:
      return '/placement-officer-dashboard';
    case ROLES.ADMIN:
      return '/admin-dashboard';
    case ROLES.STUDENT:
    default:
      return '/student-dashboard';
  }
};

export const roleLabel = (role) => {
  switch (role) {
    case ROLES.COMPANY:
      return 'Company';
    case ROLES.PLACEMENT_OFFICER:
      return 'Placement Officer';
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.STUDENT:
      return 'Student';
    default:
      return role || 'User';
  }
};

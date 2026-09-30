export const Roles = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
}

// Where each role lands after login, or when visiting a guest-only page while logged in.
export const roleHomeRoute = {
  [Roles.CUSTOMER]: { name: 'landing' },
  [Roles.ADMIN]: { name: 'admin-dashboard' },
}

import { Navigate, Outlet } from 'react-router-dom';

// Assuming you store the logged-in user in localStorage after login
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if unauthorized
  }

  return <Outlet />;
};
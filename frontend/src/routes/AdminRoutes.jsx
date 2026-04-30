import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
  const isAdminFlag = localStorage.getItem('isAdmin') === 'true';
  const accessToken = localStorage.getItem('access_token');
  const userRaw = localStorage.getItem('user');
  let userRole = null;
  try {
    userRole = userRaw ? JSON.parse(userRaw)?.role : null;
  } catch {
    userRole = null;
  }
  const isAdmin = isAdminFlag || userRole === 'admin';

  if (!accessToken || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

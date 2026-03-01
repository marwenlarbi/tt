import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // adapter selon la logique de auth

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

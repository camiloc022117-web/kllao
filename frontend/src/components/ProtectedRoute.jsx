import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Cargando..." />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;

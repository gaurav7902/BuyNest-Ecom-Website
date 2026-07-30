import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return children;
};

export default AdminRoute;

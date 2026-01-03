// components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  if (!user || !token) {
    return null; // or a loading spinner
  }

  return children;
};

export default ProtectedRoute;
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { getCurrentUser, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const hasCheckedAuth = useRef(false);
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  // Removed automatic authentication check to prevent loading screens

  // Reset the check flag when user logs out
  useEffect(() => {
    if (!isAuthenticated && hasCheckedAuth.current) {
      // User has logged out, reset the check flag
      hasCheckedAuth.current = false;
    }
  }, [isAuthenticated]);

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading: false, // No loading since we removed automatic auth checks
    error,
    clearAuthError,
  };
};
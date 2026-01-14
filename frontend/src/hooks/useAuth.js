import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { getCurrentUser, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const hasCheckedAuth = useRef(false);
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check for existing authentication on app start
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      console.log('Checking authentication...');

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Authentication check timed out, assuming not authenticated');
      }, 3000); // 3 second timeout

      dispatch(getCurrentUser()).then(() => {
        console.log('Authentication check completed');
        clearTimeout(timeoutId);
      }).catch((error) => {
        console.log('Authentication check failed:', error);
        clearTimeout(timeoutId);
      });
    }
  }, [dispatch]);

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
    loading,
    error,
    clearAuthError,
  };
};
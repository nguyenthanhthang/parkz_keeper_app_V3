import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { login, logout, checkAuth, clearError, mockLogin } from '../store/slices/authSlice';
import { LoginCredentials } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Use shallow equality selector to prevent unnecessary re-renders
  const auth = useSelector((state: RootState) => state.auth, (left, right) => {
    // Include parkingName (and role) to ensure UI updates when these change
    return (
      left.isLoading === right.isLoading &&
      left.isAuthenticated === right.isAuthenticated &&
      left.error === right.error &&
      left.user?.id === right.user?.id &&
      left.user?.parkingName === right.user?.parkingName &&
      left.user?.role === right.user?.role &&
      left.token === right.token
    );
  });

  // Memoize actions to prevent re-renders
  const loginAction = useCallback(
    (credentials: LoginCredentials) => dispatch(login(credentials)),
    [dispatch]
  );

  const logoutAction = useCallback(() => dispatch(logout()), [dispatch]);

  const checkAuthAction = useCallback(() => dispatch(checkAuth()), [dispatch]);

  const clearErrorAction = useCallback(() => dispatch(clearError()), [dispatch]);

  const mockLoginAction = useCallback(
    (role?: string) => dispatch(mockLogin(role || 'Keeper')),
    [dispatch]
  );

  return useMemo(
    () => ({
      ...auth,
      login: loginAction,
      logout: logoutAction,
      checkAuth: checkAuthAction,
      clearError: clearErrorAction,
      mockLogin: __DEV__ ? mockLoginAction : undefined, // Chỉ có trong dev mode
    }),
    [auth, loginAction, logoutAction, checkAuthAction, clearErrorAction, mockLoginAction]
  );
};


import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '../types';
import { authApi } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

type AuthAction =
  | { type: 'INIT'; payload: User | null }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INIT':
      return { user: action.payload, isAuthenticated: action.payload !== null, isLoading: false };
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until localStorage is checked
};

const TOKEN_KEY = 'esellify_token';
const USER_KEY  = 'esellify_user';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Rehydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (token && raw) {
      try {
        dispatch({ type: 'INIT', payload: JSON.parse(raw) as User });
        return;
      } catch { /* ignore */ }
    }
    dispatch({ type: 'INIT', payload: null });
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await authApi.login(credentials.email, credentials.password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await authApi.register(data.name, data.email, data.password, data.confirmPassword);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };
    try {
      const updated = await authApi.updateProfile(state.user.id, updates);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      dispatch({ type: 'UPDATE_PROFILE', payload: updated });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

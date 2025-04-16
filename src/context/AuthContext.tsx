import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { supabase } from '../services/supabaseService';

// Create the default auth state
const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Define the AuthContext type
interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  authState: defaultAuthState,
  signIn: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Check for existing session on load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));

        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User',
            created_at: session.user.created_at || new Date().toISOString()
          };

          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            ...defaultAuthState,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          ...defaultAuthState,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load authentication state',
        });
      }
    };

    loadUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User',
            created_at: session.user.created_at || new Date().toISOString()
          };

          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            ...defaultAuthState,
            loading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // User data will be set by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      }));
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // User data will be set by the auth state change listener
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      }));
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Auth state will be updated by the listener
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState({
        ...defaultAuthState,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

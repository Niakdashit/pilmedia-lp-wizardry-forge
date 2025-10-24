import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth as useSupabaseAuth } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, session, loading, signIn, signUp, signOut } = useSupabaseAuth();
  const [authLoading, setAuthLoading] = useState(true);

  // Gestion du chargement initial
  useEffect(() => {
    if (!loading) {
      setAuthLoading(false);
    }
  }, [loading]);

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

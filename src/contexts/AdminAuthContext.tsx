import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ADMIN_ID = 'ADMIN001';
const ADMIN_PW = 'admin';
const SESSION_KEY = 'okbs_admin_session';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (id: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') setIsAdmin(true);
    setIsLoading(false);
  }, []);

  const signIn = async (id: string, password: string) => {
    if (id === ADMIN_ID && password === ADMIN_PW) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAdmin(true);
      return { error: null };
    }
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
  };

  const signOut = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

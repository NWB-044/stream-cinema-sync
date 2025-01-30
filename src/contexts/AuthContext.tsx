import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceId, getIPAddress } from '@/utils/deviceUtils';

const ADMIN_CREDENTIALS = {
  username: 'Bipho',
  password: 'Kipli123'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    lastSeen: new Date(),
    deviceId: '',
    ipAddress: '',
    theme: 'system'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const deviceId = generateDeviceId();
        const ipAddress = await getIPAddress();
        const storedAuth = localStorage.getItem('auth');
        const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' || 'system';

        console.log('Device ID:', deviceId);
        console.log('IP Address:', ipAddress);

        if (storedAuth) {
          const userData = JSON.parse(storedAuth);
          setAuthState({
            ...userData,
            deviceId,
            ipAddress,
            isLoading: false,
            lastSeen: new Date(),
            isAuthenticated: true,
            theme: storedTheme
          });
          console.log('Auth restored:', userData);
        } else {
          setAuthState(prev => ({
            ...prev,
            deviceId,
            ipAddress,
            isLoading: false,
            theme: storedTheme
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast({
          title: "Error",
          description: "Gagal menginisialisasi autentikasi",
          variant: "destructive",
        });
      }
    };

    initAuth();
  }, [toast]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (authState.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(authState.theme || 'light');
    }
  }, [authState.theme]);

  const login = async (username: string, password: string) => {
    try {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          isOnline: true,
          lastSeen: new Date(),
          deviceId: authState.deviceId,
          ipAddress: authState.ipAddress,
          status: 'Active'
        };
        
        setAuthState(prev => ({
          ...prev,
          user: adminUser,
          isAuthenticated: true,
          isLoading: false
        }));
        
        localStorage.setItem('auth', JSON.stringify(adminUser));
        console.log('Admin login successful');
        
        toast({
          title: "Login Berhasil",
          description: "Selamat datang, Admin!",
        });
      } else {
        throw new Error('Kredensial tidak valid');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const initializeViewer = async (username: string) => {
    try {
      const deviceId = generateDeviceId();
      const ipAddress = await getIPAddress();
      
      const viewerUser: User = {
        id: deviceId,
        username: username || `Viewer_${Math.random().toString(36).substr(2, 9)}`,
        role: 'viewer',
        isOnline: true,
        lastSeen: new Date(),
        deviceId,
        ipAddress,
        status: 'Online'
      };
      
      setAuthState(prev => ({
        ...prev,
        user: viewerUser,
        isAuthenticated: true,
        isLoading: false
      }));
      
      localStorage.setItem('auth', JSON.stringify(viewerUser));
      console.log('Viewer initialized:', viewerUser);
      
      toast({
        title: "Login Berhasil",
        description: "Selamat datang!",
      });
    } catch (error) {
      console.error('Viewer initialization error:', error);
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan saat inisialisasi viewer",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setTheme = (theme: 'dark' | 'light' | 'system') => {
    localStorage.setItem('theme', theme);
    setAuthState(prev => ({ ...prev, theme }));
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuthState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false
    }));
    
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
    
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout,
      isAdmin,
      initializeViewer,
      setTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
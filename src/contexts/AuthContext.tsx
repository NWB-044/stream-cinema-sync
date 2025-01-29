import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeViewer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'Bipho',
  password: 'Kipli123'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const { toast } = useToast();

  // Generate a unique device ID for viewers
  const generateDeviceId = () => {
    const storedId = localStorage.getItem('deviceId');
    if (storedId) return storedId;
    
    const newId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', newId);
    return newId;
  };

  const login = async (username: string, password: string) => {
    try {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          isOnline: true,
          lastSeen: new Date()
        };
        
        setAuthState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false
        });
        
        localStorage.setItem('auth', JSON.stringify(adminUser));
        toast({
          title: "Login Successful",
          description: "Welcome back, admin!",
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const initializeViewer = async () => {
    try {
      const deviceId = generateDeviceId();
      const viewerUser: User = {
        id: deviceId,
        username: `Viewer_${deviceId.slice(-4)}`,
        role: 'viewer',
        deviceId,
        isOnline: true,
        lastSeen: new Date()
      };
      
      setAuthState({
        user: viewerUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      localStorage.setItem('auth', JSON.stringify(viewerUser));
      console.log('Viewer initialized:', viewerUser);
    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect as viewer",
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const userData = JSON.parse(storedAuth);
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, initializeViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
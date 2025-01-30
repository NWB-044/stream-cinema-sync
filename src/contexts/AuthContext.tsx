import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceId, getIPAddress } from '@/utils/deviceUtils';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeViewer: (username: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'Bipho',
  password: 'Kipli123',
  port: '2009'
};

// Store viewer usernames to prevent duplicates
const usedUsernames = new Set<string>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    lastSeen: new Date(),
    deviceId: '',
    ipAddress: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const deviceId = generateDeviceId();
        const ipAddress = await getIPAddress();
        const storedAuth = localStorage.getItem('auth');
        const currentPort = window.location.port;

        console.log('Current port:', currentPort);
        console.log('Device ID:', deviceId);
        console.log('IP Address:', ipAddress);

        if (storedAuth) {
          const userData = JSON.parse(storedAuth);
          // Check if stored credentials match current environment
          if (userData.role === 'admin' && currentPort === ADMIN_CREDENTIALS.port) {
            setAuthState({
              ...userData,
              deviceId,
              ipAddress,
              isLoading: false,
              lastSeen: new Date(),
              isAuthenticated: true
            });
            console.log('Admin auth restored');
          } else if (userData.role === 'viewer' && currentPort !== ADMIN_CREDENTIALS.port) {
            setAuthState({
              ...userData,
              deviceId,
              ipAddress,
              isLoading: false,
              lastSeen: new Date(),
              isAuthenticated: true
            });
            console.log('Viewer auth restored');
          } else {
            // Clear invalid auth state
            localStorage.removeItem('auth');
            setAuthState(prev => ({
              ...prev,
              deviceId,
              ipAddress,
              isLoading: false,
              isAuthenticated: false
            }));
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            deviceId,
            ipAddress,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication",
          variant: "destructive",
        });
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const currentPort = window.location.port;
      
      if (currentPort !== ADMIN_CREDENTIALS.port) {
        throw new Error('Invalid access attempt');
      }

      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          isOnline: true,
          lastSeen: new Date(),
          deviceId: authState.deviceId,
          ipAddress: authState.ipAddress,
          profilePicture: '/placeholder.svg',
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
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const initializeViewer = async (username: string) => {
    try {
      const currentPort = window.location.port;
      
      if (currentPort === ADMIN_CREDENTIALS.port) {
        throw new Error('Invalid port for viewer access');
      }

      if (usedUsernames.has(username)) {
        throw new Error('Username already taken');
      }

      const viewerUser: User = {
        id: authState.deviceId || generateDeviceId(),
        username,
        role: 'viewer',
        isOnline: true,
        lastSeen: new Date(),
        deviceId: authState.deviceId,
        ipAddress: authState.ipAddress,
        profilePicture: '/placeholder.svg',
        status: 'Online'
      };
      
      usedUsernames.add(username);
      
      setAuthState(prev => ({
        ...prev,
        user: viewerUser,
        isAuthenticated: true,
        isLoading: false
      }));
      
      localStorage.setItem('auth', JSON.stringify(viewerUser));
      console.log('Viewer initialized:', viewerUser);
    } catch (error) {
      console.error('Viewer initialization error:', error);
      throw error;
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = {
      ...authState.user,
      ...updates,
      lastSeen: new Date()
    };

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));

    localStorage.setItem('auth', JSON.stringify(updatedUser));
    console.log('Profile updated:', updatedUser);
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  const logout = () => {
    const username = authState.user?.username;
    if (username) {
      usedUsernames.delete(username);
    }
    
    localStorage.removeItem('auth');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      deviceId: authState.deviceId,
      ipAddress: authState.ipAddress,
      lastSeen: new Date()
    });
    
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout, 
      initializeViewer,
      updateProfile,
      isAdmin 
    }}>
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
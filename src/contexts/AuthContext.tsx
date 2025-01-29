import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceId, getIPAddress } from '@/utils/deviceUtils';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeViewer: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'Bipho',
  password: 'Kipli123',
  port: 2009
};

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
          // Verify if admin is accessing through correct port
          if (userData.role === 'admin' && currentPort !== String(ADMIN_CREDENTIALS.port)) {
            console.log('Admin accessing from wrong port');
            localStorage.removeItem('auth');
            setAuthState(prev => ({
              ...prev,
              deviceId,
              ipAddress,
              isLoading: false
            }));
            return;
          }

          setAuthState({
            ...userData,
            deviceId,
            ipAddress,
            isLoading: false,
            lastSeen: new Date()
          });
          console.log('Auth restored from storage:', userData);
        } else {
          // Auto-initialize viewer if not on admin port
          if (currentPort !== String(ADMIN_CREDENTIALS.port)) {
            await initializeViewer();
          }
          setAuthState(prev => ({
            ...prev,
            deviceId,
            ipAddress,
            isLoading: false
          }));
          console.log('New session initialized');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication",
          variant: "destructive"
        });
      }
    };

    initAuth();
    const interval = setInterval(() => {
      setAuthState(prev => ({
        ...prev,
        lastSeen: new Date()
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const currentPort = window.location.port;
      
      if (currentPort !== String(ADMIN_CREDENTIALS.port)) {
        throw new Error('Admin login only allowed on port 2009');
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
        console.log('Admin login successful:', adminUser);
        
        toast({
          title: "Login Successful",
          description: "Welcome back, admin!",
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const initializeViewer = async () => {
    try {
      const deviceId = authState.deviceId || generateDeviceId();
      const ipAddress = authState.ipAddress || await getIPAddress();
      
      const viewerUser: User = {
        id: deviceId,
        username: `Viewer_${deviceId.slice(-4)}`,
        role: 'viewer',
        deviceId,
        ipAddress,
        isOnline: true,
        lastSeen: new Date(),
        profilePicture: '/placeholder.svg',
        status: 'Online'
      };
      
      setAuthState(prev => ({
        ...prev,
        user: viewerUser,
        isAuthenticated: true,
        isLoading: false,
        deviceId,
        ipAddress
      }));
      
      localStorage.setItem('auth', JSON.stringify(viewerUser));
      console.log('Viewer initialized:', viewerUser);
      
      toast({
        title: "Connected",
        description: "You're now connected as a viewer",
      });
    } catch (error) {
      console.error('Viewer initialization error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect as viewer",
        variant: "destructive"
      });
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
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  const logout = () => {
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
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
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
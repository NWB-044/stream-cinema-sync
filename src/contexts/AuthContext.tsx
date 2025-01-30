import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceId, getIPAddress } from '@/utils/deviceUtils';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  initializeViewer: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'Bipho',
  password: 'Kipli123',
  port: '2009'
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
        const currentPort = window.location.port;
        const storedAuth = localStorage.getItem('auth');

        console.log('Current port:', currentPort);
        console.log('Device ID:', deviceId);
        console.log('IP Address:', ipAddress);

        if (storedAuth) {
          const userData = JSON.parse(storedAuth);
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
          } else if (currentPort !== ADMIN_CREDENTIALS.port) {
            // Auto-login as viewer for non-admin ports
            const viewerUser: User = {
              id: deviceId,
              username: `Viewer_${Math.random().toString(36).substr(2, 9)}`,
              role: 'viewer',
              isOnline: true,
              lastSeen: new Date(),
              deviceId,
              ipAddress,
              status: 'Online'
            };
            
            setAuthState({
              user: viewerUser,
              isAuthenticated: true,
              isLoading: false,
              deviceId,
              ipAddress,
              lastSeen: new Date()
            });
            
            localStorage.setItem('auth', JSON.stringify(viewerUser));
            console.log('Viewer auto-login:', viewerUser);
          }
        } else if (currentPort !== ADMIN_CREDENTIALS.port) {
          // Auto-login as viewer for new sessions on non-admin ports
          const viewerUser: User = {
            id: deviceId,
            username: `Viewer_${Math.random().toString(36).substr(2, 9)}`,
            role: 'viewer',
            isOnline: true,
            lastSeen: new Date(),
            deviceId,
            ipAddress,
            status: 'Online'
          };
          
          setAuthState({
            user: viewerUser,
            isAuthenticated: true,
            isLoading: false,
            deviceId,
            ipAddress,
            lastSeen: new Date()
          });
          
          localStorage.setItem('auth', JSON.stringify(viewerUser));
          console.log('New viewer auto-login:', viewerUser);
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
          description: "Gagal menginisialisasi autentikasi",
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
        throw new Error('Port tidak valid untuk akses admin');
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
      
      setAuthState({
        user: viewerUser,
        isAuthenticated: true,
        isLoading: false,
        deviceId,
        ipAddress,
        lastSeen: new Date()
      });
      
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
      initializeViewer
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

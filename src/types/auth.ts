export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  isOnline: boolean;
  lastSeen: Date;
  deviceId?: string;
  ipAddress?: string;
  status: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceId?: string;
  ipAddress?: string;
  lastSeen?: Date;
  theme?: 'dark' | 'light' | 'system';
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  initializeViewer: (username: string) => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}
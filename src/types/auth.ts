export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  deviceId?: string;
  ipAddress?: string;
  lastSeen?: Date;
  isOnline?: boolean;
  profilePicture?: string;
  status?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceId?: string;
  ipAddress?: string;
  lastSeen?: Date;
}
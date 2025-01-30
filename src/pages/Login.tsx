import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [viewerUsername, setViewerUsername] = useState('');
  const [isAdminPort, setIsAdminPort] = useState(false);
  const { login, initializeViewer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPort = window.location.port;
    setIsAdminPort(currentPort === '2009');
    
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleViewerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initializeViewer(viewerUsername);
      navigate('/');
    } catch (error) {
      console.error('Viewer registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stream-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-stream-primary" />
          <h1 className="text-3xl font-bold text-stream-text">
            {isAdminPort ? 'Admin Login' : 'Viewer Registration'}
          </h1>
        </div>
        
        {isAdminPort ? (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-stream-primary hover:bg-stream-primary/90"
            >
              Login as Admin
            </Button>
          </form>
        ) : (
          <form onSubmit={handleViewerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="viewerUsername">Choose a Username</Label>
              <Input
                id="viewerUsername"
                type="text"
                placeholder="Enter your viewer username"
                value={viewerUsername}
                onChange={(e) => setViewerUsername(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-stream-primary hover:bg-stream-primary/90"
              disabled={!viewerUsername.trim()}
            >
              Join as Viewer
            </Button>
          </form>
        )}

        <div className="text-sm text-gray-400 text-center">
          {isAdminPort 
            ? 'Admin access only. Viewers should use a different port.' 
            : 'Choose a unique username to join as a viewer.'}
        </div>
      </div>
    </div>
  );
};

export default Login;
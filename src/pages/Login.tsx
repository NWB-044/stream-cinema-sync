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
  const [isWrongPort, setIsWrongPort] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPort = window.location.port;
    setIsWrongPort(currentPort !== '2009');
    
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWrongPort) return;
    
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isWrongPort) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stream-background">
        <div className="w-full max-w-md p-8 space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Admin login is only available on port 2009. Current port: {window.location.port}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stream-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-stream-primary" />
          <h1 className="text-3xl font-bold text-stream-text">Admin Login</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-stream-primary hover:bg-stream-primary/90"
          >
            Login
          </Button>
        </form>

        <div className="text-sm text-gray-400 text-center">
          Admin access only. Viewers will be automatically connected.
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [viewerUsername, setViewerUsername] = useState('');
  const { login, initializeViewer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved viewer username
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed.role === 'viewer') {
        setViewerUsername(parsed.username);
      }
    }

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
      console.error('Login gagal:', error);
    }
  };

  const handleViewerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initializeViewer(viewerUsername);
      navigate('/');
    } catch (error) {
      console.error('Registrasi viewer gagal:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Stream Cinema Sync
          </CardTitle>
          <CardDescription className="text-center">
            Pilih mode login yang sesuai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="viewer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="viewer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Viewer
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="viewer">
              <form onSubmit={handleViewerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="viewerUsername">Username</Label>
                  <Input
                    id="viewerUsername"
                    type="text"
                    placeholder="Masukkan username viewer"
                    value={viewerUsername}
                    onChange={(e) => setViewerUsername(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Masuk sebagai Viewer
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username Admin</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login sebagai Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import FileManager from '../components/FileManager';
import Chat from '../components/Chat';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { user, logout, initializeViewer } = useAuth();
  const [currentVideo, setCurrentVideo] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'viewer') {
      const randomUsername = `Viewer_${Math.random().toString(36).substr(2, 9)}`;
      initializeViewer(randomUsername);
    }
  }, [user?.role]);

  const handleFileSelect = (file: string) => {
    setCurrentVideo(file);
    toast({
      title: "Video Selected",
      description: `Now playing: ${file}`,
    });
    console.log('Selected video:', file);
  };

  const handleSubtitleSelect = (file: string) => {
    setSubtitle(file);
    console.log('Selected subtitle:', file);
  };

  return (
    <div className="min-h-screen bg-stream-background text-stream-text">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">{user?.username}</span>
            <span className="text-xs px-2 py-1 rounded bg-stream-primary">
              {user?.role.toUpperCase()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-stream-text hover:text-stream-primary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {user?.role === 'admin' && (
            <div className="lg:col-span-3 animate-fadeIn">
              <FileManager 
                onVideoSelect={handleFileSelect}
                onSubtitleSelect={handleSubtitleSelect}
                isAdmin={true}
              />
            </div>
          )}

          <div className={`lg:col-span-${user?.role === 'admin' ? '6' : '9'} animate-fadeIn`}>
            <VideoPlayer
              src={currentVideo}
              subtitle={subtitle}
              isAdmin={user?.role === 'admin'}
            />
          </div>

          <div className="lg:col-span-3 animate-fadeIn">
            <Chat isAdmin={user?.role === 'admin'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
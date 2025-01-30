import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import FileManager from '../components/FileManager';
import Chat from '../components/Chat';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { user, logout } = useAuth();
  const [currentVideo, setCurrentVideo] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const handleFileSelect = (file: string) => {
    setCurrentVideo(file);
    toast({
      title: "Video Dipilih",
      description: `Memutar: ${file}`,
    });
    console.log('Selected video:', file);
  };

  const handleSubtitleSelect = (file: string) => {
    setSubtitle(file);
    toast({
      title: "Subtitle Dipilih",
      description: `Subtitle aktif: ${file}`,
    });
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
            Keluar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {isAdmin && (
            <div className="lg:col-span-3 animate-fadeIn">
              <FileManager 
                onVideoSelect={handleFileSelect}
                onSubtitleSelect={handleSubtitleSelect}
                isAdmin={true}
              />
            </div>
          )}

          <div className={`lg:col-span-${isAdmin ? '6' : '9'} animate-fadeIn`}>
            <VideoPlayer
              src={currentVideo}
              subtitle={subtitle}
              isAdmin={isAdmin}
            />
          </div>

          <div className="lg:col-span-3 animate-fadeIn">
            <Chat isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
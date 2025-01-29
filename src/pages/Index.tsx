import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import FileManager from '../components/FileManager';
import Chat from '../components/Chat';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // For demo, we'll set admin based on localStorage
    const role = localStorage.getItem('role') || 'viewer';
    setIsAdmin(role === 'admin');
    console.log('Role set:', role);
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* File Manager Section */}
          <div className="lg:col-span-3 animate-fadeIn">
            <FileManager 
              onVideoSelect={handleFileSelect}
              onSubtitleSelect={handleSubtitleSelect}
              isAdmin={isAdmin}
            />
          </div>

          {/* Video Player Section */}
          <div className="lg:col-span-6 animate-fadeIn">
            <VideoPlayer
              src={currentVideo}
              subtitle={subtitle}
              isAdmin={isAdmin}
            />
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-3 animate-fadeIn">
            <Chat isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
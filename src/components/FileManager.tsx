import React, { useState } from 'react';
import { Folder, Film, Subtitles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileManagerProps {
  onVideoSelect: (file: string) => void;
  onSubtitleSelect: (file: string) => void;
  isAdmin: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  onVideoSelect,
  onSubtitleSelect,
  isAdmin
}) => {
  const [currentPath, setCurrentPath] = useState('/');
  
  // Mock file system - replace with actual file system integration
  const mockFiles = [
    { name: 'Movies', type: 'folder', path: '/movies' },
    { name: 'Anime', type: 'folder', path: '/anime' },
    { name: 'Sample.mp4', type: 'video', path: '/sample.mp4' },
    { name: 'English.srt', type: 'subtitle', path: '/english.srt' },
  ];

  const handleFileClick = (file: typeof mockFiles[0]) => {
    if (!isAdmin) return;
    
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      console.log('Navigated to:', file.path);
    } else if (file.type === 'video') {
      onVideoSelect(file.path);
      console.log('Selected video:', file.path);
    } else if (file.type === 'subtitle') {
      onSubtitleSelect(file.path);
      console.log('Selected subtitle:', file.path);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>
      
      {/* Path breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPath('/')}
          className="hover:text-white"
        >
          Root
        </Button>
        {currentPath !== '/' && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span>{currentPath.split('/').filter(Boolean).join(' / ')}</span>
          </>
        )}
      </div>

      {/* File list */}
      <div className="space-y-2">
        {mockFiles.map((file) => (
          <Button
            key={file.path}
            variant="ghost"
            className={`w-full justify-start gap-2 ${
              !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
            onClick={() => handleFileClick(file)}
          >
            {file.type === 'folder' && <Folder className="h-4 w-4" />}
            {file.type === 'video' && <Film className="h-4 w-4" />}
            {file.type === 'subtitle' && <Subtitles className="h-4 w-4" />}
            <span className="truncate">{file.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
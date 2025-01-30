import React, { useState, useEffect } from 'react';
import { Folder, Film, Subtitles, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FileManagerProps {
  onVideoSelect: (file: string) => void;
  onSubtitleSelect: (file: string) => void;
  isAdmin: boolean;
}

interface FileItem {
  name: string;
  type: 'folder' | 'video' | 'subtitle';
  path: string;
  lastModified?: Date;
}

const FileManager: React.FC<FileManagerProps> = ({
  onVideoSelect,
  onSubtitleSelect,
  isAdmin
}) => {
  const [currentPath, setCurrentPath] = useState('/storage/emulated/0');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchFiles(currentPath);
    }
  }, [currentPath, isAdmin]);

  const fetchFiles = async (path: string) => {
    try {
      // In a real implementation, this would use a native API to access device files
      // For now, we'll simulate with some example files
      const deviceFiles = await simulateDeviceFiles(path);
      setFiles(deviceFiles);
      setError(null);
      console.log('Fetched files for path:', path);
    } catch (err) {
      setError('Failed to access device storage. Please check permissions.');
      console.error('File access error:', err);
    }
  };

  const simulateDeviceFiles = async (path: string): Promise<FileItem[]> => {
    // This is a temporary simulation
    // In production, this would be replaced with actual device file access
    return [
      {
        name: 'Videos',
        type: 'folder',
        path: `${path}/Videos`,
        lastModified: new Date()
      },
      {
        name: 'Downloads',
        type: 'folder',
        path: `${path}/Downloads`,
        lastModified: new Date()
      },
      {
        name: 'sample_video.mp4',
        type: 'video',
        path: `${path}/sample_video.mp4`,
        lastModified: new Date()
      }
    ];
  };

  const handleFileClick = (file: FileItem) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin can access files",
        variant: "destructive"
      });
      return;
    }
    
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      console.log('Navigated to:', file.path);
    } else if (file.type === 'video') {
      onVideoSelect(file.path);
      toast({
        title: "Video Selected",
        description: file.name,
      });
      console.log('Selected video:', file.path);
    } else if (file.type === 'subtitle') {
      onSubtitleSelect(file.path);
      toast({
        title: "Subtitle Selected",
        description: file.name,
      });
      console.log('Selected subtitle:', file.path);
    }
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath) {
      setCurrentPath(parentPath);
      console.log('Navigated up to:', parentPath);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-[calc(100vh-2rem)] flex flex-col">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Path navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateUp}
          disabled={currentPath === '/storage/emulated/0'}
          className="hover:text-white"
        >
          Up
        </Button>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate">{currentPath}</span>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {files.map((file) => (
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
            <div className="flex-1 flex justify-between items-center">
              <span className="truncate">{file.name}</span>
              {file.lastModified && (
                <span className="text-xs text-gray-500">
                  {file.lastModified.toLocaleDateString()}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
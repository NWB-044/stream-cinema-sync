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
  handle?: FileSystemHandle;
  lastModified?: Date;
}

const VideoFileTypes = ['.mp4', '.webm', '.ogg', '.mov'];
const SubtitleFileTypes = ['.srt', '.vtt', '.ass'];

const FileManager: React.FC<FileManagerProps> = ({
  onVideoSelect,
  onSubtitleSelect,
  isAdmin
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });

      const newFiles: FileItem[] = [];
      for await (const entry of dirHandle.values()) {
        const name = entry.name.toLowerCase();
        if (entry.kind === 'file') {
          if (VideoFileTypes.some(ext => name.endsWith(ext))) {
            newFiles.push({
              name: entry.name,
              type: 'video',
              path: entry.name,
              handle: entry,
              lastModified: new Date()
            });
          } else if (SubtitleFileTypes.some(ext => name.endsWith(ext))) {
            newFiles.push({
              name: entry.name,
              type: 'subtitle',
              path: entry.name,
              handle: entry,
              lastModified: new Date()
            });
          }
        }
      }

      setFiles(newFiles);
      setError(null);
      console.log('Files loaded:', newFiles);
    } catch (err) {
      console.error('File access error:', err);
      setError('Failed to access files. Please grant permission.');
      toast({
        title: "Error",
        description: "Failed to access files",
        variant: "destructive",
      });
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (!isAdmin || !file.handle) return;

    try {
      if (file.handle.kind === 'file') {
        const fileHandle = file.handle as FileSystemFileHandle;
        const fileData = await fileHandle.getFile();
        const url = URL.createObjectURL(fileData);

        if (file.type === 'video') {
          onVideoSelect(url);
          toast({
            title: "Video Selected",
            description: file.name,
          });
        } else if (file.type === 'subtitle') {
          onSubtitleSelect(url);
          toast({
            title: "Subtitle Selected",
            description: file.name,
          });
        }
      }
    } catch (err) {
      console.error('Error accessing file:', err);
      toast({
        title: "Error",
        description: "Failed to access file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">File Manager</h2>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
            className="text-white hover:text-gray-200"
          >
            Select Folder
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
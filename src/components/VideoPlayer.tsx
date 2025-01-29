import React, { useRef, useState, useEffect } from 'react';
import { Maximize, Minimize, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  subtitle: string;
  isAdmin: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, subtitle, isAdmin }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      console.log('Video progress:', progress);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    console.log('Playback toggled:', !isPlaying);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    console.log('Fullscreen toggled:', !isFullscreen);
  };

  const skipForward = () => {
    if (!videoRef.current || !isAdmin) return;
    videoRef.current.currentTime += 10;
    console.log('Skipped forward 10s');
  };

  const skipBackward = () => {
    if (!videoRef.current || !isAdmin) return;
    videoRef.current.currentTime -= 10;
    console.log('Skipped backward 10s');
  };

  return (
    <div className="relative group bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        src={src}
        crossOrigin="anonymous"
      >
        {subtitle && <track kind="subtitles" src={subtitle} default />}
      </video>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-600 rounded-full mb-4">
          <div 
            className="h-full bg-stream-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? (
              <Minimize className="h-6 w-6" />
            ) : (
              <Maximize className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
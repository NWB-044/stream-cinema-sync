import React, { useRef, useState, useEffect } from 'react';
import { 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  src: string;
  subtitle: string;
  isAdmin: boolean;
}

interface VideoSettings {
  volume: number;
  subtitleOpacity: number;
  lastPosition: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, subtitle, isAdmin }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [subtitleOpacity, setSubtitleOpacity] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Load saved settings when video source changes
  useEffect(() => {
    if (src) {
      const savedSettings = localStorage.getItem(`video-settings-${src}`);
      if (savedSettings) {
        const settings: VideoSettings = JSON.parse(savedSettings);
        setVolume(settings.volume);
        setSubtitleOpacity(settings.subtitleOpacity);
        if (videoRef.current) {
          videoRef.current.currentTime = settings.lastPosition;
        }
      }
      console.log('Video settings loaded for:', src);
    }
  }, [src]);

  // Save settings when they change
  useEffect(() => {
    if (src && videoRef.current) {
      const settings: VideoSettings = {
        volume,
        subtitleOpacity,
        lastPosition: videoRef.current.currentTime
      };
      localStorage.setItem(`video-settings-${src}`, JSON.stringify(settings));
      console.log('Video settings saved:', settings);
    }
  }, [src, volume, subtitleOpacity]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        skipForward();
      } else if (e.code === 'ArrowLeft') {
        skipBackward();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      toast({
        title: "Video Paused",
        description: "The video has been paused",
      });
    } else {
      videoRef.current.play();
      toast({
        title: "Video Playing",
        description: "The video has started playing",
      });
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
    toast({
      title: "Skipped Forward",
      description: "Skipped 10 seconds forward",
    });
    console.log('Skipped forward 10s');
  };

  const skipBackward = () => {
    if (!videoRef.current || !isAdmin) return;
    videoRef.current.currentTime -= 10;
    toast({
      title: "Skipped Backward",
      description: "Skipped 10 seconds backward",
    });
    console.log('Skipped backward 10s');
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    console.log('Volume changed:', newVolume);
  };

  const handleSubtitleOpacityChange = (value: number[]) => {
    const newOpacity = value[0];
    setSubtitleOpacity(newOpacity);
    const subtitles = document.querySelector('track');
    if (subtitles) {
      (subtitles as any).style.opacity = newOpacity;
    }
    console.log('Subtitle opacity changed:', newOpacity);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickPosition = (clientX - left) / width;

    if (clickPosition < 0.3) {
      skipBackward();
    } else if (clickPosition > 0.7) {
      skipForward();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className="relative group bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video"
        src={src}
        crossOrigin="anonymous"
      >
        {subtitle && <track kind="subtitles" src={subtitle} default />}
      </video>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const pos = (e.clientX - rect.left) / rect.width;
               if (videoRef.current) {
                 videoRef.current.currentTime = pos * videoRef.current.duration;
               }
             }}>
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

          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVolumeChange([volume === 0 ? 1 : 0])}
                className="text-white hover:bg-white/20"
              >
                {volume === 0 ? (
                  <VolumeX className="h-6 w-6" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Subtitle Opacity Control */}
            {subtitle && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-6 w-6" />
                </Button>
                <div className="w-24">
                  <Slider
                    value={[subtitleOpacity]}
                    max={1}
                    step={0.1}
                    onValueChange={handleSubtitleOpacityChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            )}

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
    </div>
  );
};

export default VideoPlayer;
import { useState, useRef, useEffect } from 'react';
import { WikiImage } from '@/data/wikiImages';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface GameHUDProps {
  currentImage: WikiImage | null;
  visitedCount: number;
  totalImages: number;
  isLocked: boolean;
  onResetProgress?: () => void;
  onOpenGallery?: () => void;
}

// Inline music player for menu
const MenuMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/10/25/audio_3712e4bc0c.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-primary/20">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-primary" />
        ) : (
          <Play className="w-4 h-4 text-primary" />
        )}
      </button>
      
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="p-1"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-primary" />
        )}
      </button>

      <Slider
        value={[volume * 100]}
        onValueChange={(val) => setVolume(val[0] / 100)}
        max={100}
        step={1}
        className="w-20"
      />
      
      <span className="text-xs text-muted-foreground">Music</span>
    </div>
  );
};

const GameHUD = ({ currentImage, visitedCount, totalImages, isLocked, onResetProgress, onOpenGallery }: GameHUDProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/auth');
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    signOut();
  };

  const handleResetProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResetProgress) onResetProgress();
  };

  const handleOpenGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenGallery) onOpenGallery();
  };

  return (
    <>
      {/* Main Menu - show when not locked */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-50">
          <div className="hud-panel text-center max-w-md p-8">
            {/* Fun Logo */}
            <div className="mb-6">
              <div className="relative inline-block">
                <span className="text-5xl">🌀</span>
                <span className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</span>
              </div>
              <h1 className="text-3xl font-bold mt-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                DIMENSION WALKER
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore the Wiki Multiverse
              </p>
            </div>

            {/* Progress display */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Dimensions Explored</span>
                <span className="text-lg font-bold text-primary">{visitedCount} / {totalImages}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(visitedCount / totalImages) * 100}%` }}
                />
              </div>
              {visitedCount === totalImages && totalImages > 0 && (
                <p className="text-accent text-sm mt-2 font-bold">🎉 All dimensions explored!</p>
              )}
            </div>
            
            {/* Auth section */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-primary/20">
              {user ? (
                <div className="space-y-3">
                  <p className="text-sm text-primary">✓ Signed in as {user.email?.split('@')[0]}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOpenGallery}
                      className="flex-1"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Gallery
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSignOut}
                      className="flex-1"
                    >
                      Sign Out
                    </Button>
                  </div>
                  {visitedCount > 0 && onResetProgress && (
                    <button
                      onClick={handleResetProgress}
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Reset Progress
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Sign in to save your journey!</p>
                  <Button 
                    onClick={handleSignIn}
                    className="glow-button w-full"
                  >
                    Sign In / Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Music Player */}
            <div className="mb-6">
              <MenuMusicPlayer />
            </div>

            {/* Controls */}
            <div className="space-y-1 mb-6 text-left text-sm">
              <p className="text-muted-foreground"><span className="text-primary font-bold">WASD</span> Move</p>
              <p className="text-muted-foreground"><span className="text-primary font-bold">Mouse</span> Look</p>
              <p className="text-muted-foreground"><span className="text-primary font-bold">Q/E</span> Float up/down</p>
              <p className="text-muted-foreground"><span className="text-primary font-bold">ESC</span> Menu</p>
            </div>
            
            <div className="glow-button cursor-pointer inline-block px-10 py-3 text-lg font-bold">
              🚀 Click to Play
            </div>
          </div>
        </div>
      )}

      {/* Minimal in-game HUD - just current dimension info */}
      {isLocked && (
        <>
          {/* Top left - Current location */}
          <div className="hud-panel top-4 left-4 pointer-events-none">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Dimension</p>
            <h3 className="text-sm font-bold text-primary">
              {currentImage?.title || 'Void'}
            </h3>
          </div>

          {/* Top right - Simple counter */}
          <div className="hud-panel top-4 right-4 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{visitedCount}</span>
              <span className="text-muted-foreground text-sm">/ {totalImages}</span>
            </div>
          </div>

          {/* Crosshair */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-5 h-5 relative">
              <div className="absolute left-1/2 top-0 w-0.5 h-1.5 bg-primary/50 -translate-x-1/2" />
              <div className="absolute left-1/2 bottom-0 w-0.5 h-1.5 bg-primary/50 -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 h-0.5 w-1.5 bg-primary/50 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 h-0.5 w-1.5 bg-primary/50 -translate-y-1/2" />
            </div>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <p className="text-xs text-muted-foreground/50">ESC for menu</p>
          </div>
        </>
      )}
    </>
  );
};

export default GameHUD;
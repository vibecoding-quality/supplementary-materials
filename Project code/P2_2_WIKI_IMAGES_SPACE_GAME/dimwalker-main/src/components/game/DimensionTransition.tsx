import { useEffect, useState } from 'react';

interface DimensionTransitionProps {
  isTransitioning: boolean;
  imageName: string;
  onComplete: () => void;
}

const DimensionTransition = ({ isTransitioning, imageName, onComplete }: DimensionTransitionProps) => {
  const [phase, setPhase] = useState<'idle' | 'enter' | 'white' | 'emerge'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      // Phase 1: Quick zoom/blur into portal
      setPhase('enter');
      
      // Phase 2: White flash - you've crossed through
      const whiteTimer = setTimeout(() => {
        setPhase('white');
      }, 300);

      // Phase 3: Emerge into new dimension
      const emergeTimer = setTimeout(() => {
        setPhase('emerge');
      }, 450);

      // Complete - new dimension is ready
      const completeTimer = setTimeout(() => {
        setPhase('idle');
        onComplete();
      }, 800);

      return () => {
        clearTimeout(whiteTimer);
        clearTimeout(emergeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isTransitioning, onComplete]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Phase 1: Zoom into portal */}
      {phase === 'enter' && (
        <div 
          className="absolute inset-0 bg-black"
          style={{
            animation: 'zoom-in 0.3s ease-in forwards',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-4 h-4 bg-primary rounded-full"
              style={{
                animation: 'portal-grow 0.3s ease-in forwards',
                boxShadow: '0 0 60px 30px hsl(var(--primary))',
              }}
            />
          </div>
        </div>
      )}

      {/* Phase 2: White flash - crossed through */}
      {phase === 'white' && (
        <div 
          className="absolute inset-0 bg-white"
          style={{
            animation: 'flash-fade 0.15s ease-out forwards',
          }}
        />
      )}

      {/* Phase 3: Emerge with dimension name */}
      {phase === 'emerge' && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-background"
          style={{
            animation: 'emerge-fade 0.35s ease-out forwards',
          }}
        >
          <div className="text-center animate-fade-in">
            <p className="text-xs text-primary uppercase tracking-[0.3em] mb-2 opacity-70">
              Dimension Entered
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {imageName}
            </h2>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoom-in {
          0% { opacity: 0; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes portal-grow {
          0% { transform: scale(1); }
          100% { transform: scale(100); }
        }
        @keyframes flash-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes emerge-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DimensionTransition;
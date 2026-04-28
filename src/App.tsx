import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Binary, Disc3 } from 'lucide-react';
import { SnakeGame } from './components/SnakeGame';
import { DUMMY_TRACKS } from './data/music';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [globalGlitch, setGlobalGlitch] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // occasionally trigger global screen tear
  useEffect(() => {
    const triggerRandomGlitch = () => {
      if (Math.random() > 0.8) {
        setGlobalGlitch(true);
        setTimeout(() => setGlobalGlitch(false), 150);
      }
    };
    const interval = setInterval(triggerRandomGlitch, 5000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? DUMMY_TRACKS.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-mono relative bg-black text-[#0ff] crt ${globalGlitch ? 'screen-tear' : ''}`}>
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-4 border-b-2 border-[#f0f] bg-black/90 flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <Binary className="w-8 h-8 text-[#0ff]" />
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-[#0ff] glitch-text" data-text="0xSNAKE_OS">
            0xSNAKE_OS
          </h1>
        </div>
        
        {/* Score Display */}
        <div className="flex items-center gap-2 border-2 border-[#0ff] px-4 py-1 bg-black">
          <span className="text-[#f0f] text-xs font-sans tracking-widest">MEM</span>
          <span className="text-lg font-bold text-[#0ff]">{score.toString().padStart(4, '0')}</span>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        <div className="p-2 border border-[#f0f]/30 bg-black shadow-[0_0_20px_rgba(255,0,255,0.2)]">
           <SnakeGame 
            isPlaying={isPlaying} 
            onScoreChange={setScore} 
          />
        </div>
      </main>

      {/* Floating Music Player */}
      <footer className="relative z-20 pb-6 w-full flex justify-center px-4">
        <div className="w-full max-w-2xl bg-black border-2 border-[#0ff] p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0_#f0f]">
          
          {/* Track Info */}
          <div className="flex items-center gap-4 w-full md:w-1/2">
            <div className="relative w-12 h-12 flex-shrink-0 bg-black border border-[#f0f] flex items-center justify-center overflow-hidden">
              <Disc3 className={`w-6 h-6 text-[#f0f] ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : ''}`} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#0ff] font-bold truncate glitch-text" data-text={currentTrack.title}>
                 &gt; {currentTrack.title}
              </span>
              <span className="text-[10px] text-[#f0f] font-sans truncate">SRC: {currentTrack.artist}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 w-full md:w-1/2 justify-end">
             {/* Visualizer bars */}
             <div className="hidden sm:flex items-end gap-[2px] h-8 px-4 border-l border-[#0ff]/50">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-[#f0f]"
                  style={{ 
                    height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={prevTrack}
                className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff]/10 p-2 border border-transparent hover:border-[#f0f] transition-all grid place-items-center"
                aria-label="Previous track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center bg-transparent border-2 border-[#0ff] text-[#f0f] hover:bg-[#0ff] hover:text-black transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
              
              <button 
                onClick={nextTrack}
                className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff]/10 p-2 border border-transparent hover:border-[#f0f] transition-all grid place-items-center"
                aria-label="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

          <audio 
            ref={audioRef}
            src={currentTrack.url}
            onEnded={nextTrack}
            preload="auto"
          />
        </div>
      </footer>
    </div>
  );
}

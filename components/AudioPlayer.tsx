import React, { useRef, useEffect, useState } from 'react';
import { PodcastEpisode } from '../types';

interface AudioPlayerProps {
  episode: PodcastEpisode;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ episode, currentTime, onTimeUpdate }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Force audio element to reload when the source URL changes
  // This is a backup measure in case the key prop isn't enough, especially on mobile Safari
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.load();
        setIsPlaying(false);
    }
  }, [episode.audioUrl]);

  // Sync external currentTime (from clicking transcript) to audio element
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
      // If we clicked to seek, usually expected to play
      if (!isPlaying) {
        audioRef.current.play().catch(e => console.error("Play failed", e));
        setIsPlaying(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  // Handle Playback Rate
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
      if (!audioRef.current) return;
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.min(Math.max(newTime, 0), duration);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      onTimeUpdate(time);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 0.75, 0.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    // Fixed bottom with high z-index and pb-safe for iPhone home bar area
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-50 pb-safe">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-1">
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Progress Bar Row */}
        <div className="flex items-center gap-3 w-full mb-1">
            <span className="text-xs text-gray-500 w-10 text-right font-medium tabular-nums">{formatTime(currentTime)}</span>
            <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-suomi-blue hover:h-1.5 transition-all"
            />
            <span className="text-xs text-gray-500 w-10 font-medium tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-3 items-center w-full">
            
            {/* Left: Speed & Title (Desktop only) */}
            <div className="flex items-center justify-start gap-4">
                <button 
                    onClick={cycleSpeed}
                    className="text-xs font-bold text-suomi-blue bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                    title="Playback Speed"
                >
                    {playbackRate}x
                </button>
                <div className="hidden sm:block truncate pr-2 max-w-[150px]">
                    <p className="text-xs font-semibold text-gray-700 truncate">{episode.title}</p>
                </div>
            </div>

            {/* Center: Main Controls (Rewind, Play, Forward) */}
            <div className="flex items-center justify-center gap-6">
                {/* Rewind 15s */}
                <button 
                    onClick={() => skip(-15)}
                    className="text-gray-500 hover:text-suomi-blue transition-colors p-2"
                    title="Rewind 15 seconds"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        <text x="8" y="14" fontSize="6" fill="currentColor" fontWeight="bold" transform="translate(3,4)">15</text>
                    </svg>
                </button>

                {/* Play/Pause Button */}
                <button 
                onClick={togglePlay}
                className="w-14 h-14 flex-shrink-0 bg-suomi-blue text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-all shadow-lg active:scale-95"
                >
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-7 h-7 ml-1">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                )}
                </button>

                {/* Forward 30s */}
                <button 
                    onClick={() => skip(30)}
                    className="text-gray-500 hover:text-suomi-blue transition-colors p-2"
                    title="Forward 30 seconds"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                         <text x="8" y="14" fontSize="6" fill="currentColor" fontWeight="bold" transform="translate(1,4)">30</text>
                    </svg>
                </button>
            </div>

            {/* Right: Empty for balance or Secondary info */}
            <div className="flex justify-end">
                 {/* Could put volume here later, keeping empty for centering balance for now */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
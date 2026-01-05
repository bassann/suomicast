
import React from 'react';
import { StoredEpisode } from '../services/dbService';

interface ArchiveProps {
  episodes: StoredEpisode[];
  onSelectEpisode: (stored: StoredEpisode) => void;
  currentEpisodeId?: string;
}

const Archive: React.FC<ArchiveProps> = ({ episodes, onSelectEpisode, currentEpisodeId }) => {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.25c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Your library is empty.</p>
        <p className="text-sm text-gray-400">Past episodes will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Archive</h3>
      <div className="grid grid-cols-1 gap-4">
        {episodes.map((item) => {
          const isPlaying = currentEpisodeId === item.episode.id;
          return (
            <div 
              key={item.dateKey}
              onClick={() => onSelectEpisode(item)}
              className={`group flex items-center gap-4 p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${isPlaying ? 'border-suomi-blue bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isPlaying ? 'bg-suomi-blue text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-suomi-blue'}`}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold uppercase">{item.dateKey.split('-').slice(1).join('/')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold truncate ${isPlaying ? 'text-suomi-blue' : 'text-gray-900'}`}>{item.episode.title}</h4>
                <p className="text-sm text-gray-500 truncate">{item.episode.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-medium text-gray-400 block">{item.episode.duration}</span>
                <span className="text-[10px] text-gray-300 uppercase tracking-tighter">{item.dateKey}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Archive;

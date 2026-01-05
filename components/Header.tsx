
import React from 'react';

interface HeaderProps {
  currentView: 'home' | 'library';
  onViewChange: (view: 'home' | 'library') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-suomi-blue rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            S
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Suomi<span className="text-suomi-blue">Cast</span></h1>
        </div>
        
        <nav className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => onViewChange('home')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currentView === 'home' ? 'bg-white text-suomi-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Today
          </button>
          <button 
            onClick={() => onViewChange('library')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currentView === 'library' ? 'bg-white text-suomi-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Library
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

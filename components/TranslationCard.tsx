import React from 'react';
import { TargetLanguage, TranslationResult } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface TranslationCardProps {
  isLoading: boolean;
  translation: TranslationResult | null;
  currentLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
  onClose: () => void;
}

const TranslationCard: React.FC<TranslationCardProps> = ({
  isLoading,
  translation,
  currentLanguage,
  onLanguageChange,
  onClose,
}) => {
  return (
    <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-8 md:bottom-28 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-40 animate-fade-in-up">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
           <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
             AI Translator
           </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Language</label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.label)}
              className={`
                px-3 py-1 rounded-full text-sm flex items-center gap-1 border transition-colors
                ${currentLanguage === lang.label 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <span>{lang.flag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[120px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-suomi-blue"></div>
             <p className="text-sm text-gray-400">Asking Gemini...</p>
          </div>
        ) : translation ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-1">Original (Finnish)</p>
              <p className="text-gray-900 italic font-medium">"{translation.original}"</p>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-sm text-gray-400 mb-1">Translation ({currentLanguage})</p>
              <p className="text-lg text-gray-800 font-semibold">{translation.translation}</p>
            </div>
            {translation.notes && (
               <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Learning Note</p>
                  <p className="text-sm text-yellow-800">{translation.notes}</p>
               </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a text segment to translate.
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;
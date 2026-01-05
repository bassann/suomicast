
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import Transcript from './components/Transcript';
import TranslationCard from './components/TranslationCard';
import Archive from './components/Archive';
import { MOCK_PODCAST } from './constants';
import { TranscriptSegment, TargetLanguage, TranslationResult, PodcastEpisode } from './types';
import { geminiService } from './services/geminiService';
import { dbService, StoredEpisode } from './services/dbService';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'library'>('home');
  const [podcast, setPodcast] = useState<PodcastEpisode | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<StoredEpisode[]>([]);
  
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isUpdatingBackground, setIsUpdatingBackground] = useState(false);
  const [newEpisodeAvailable, setNewEpisodeAvailable] = useState<PodcastEpisode | null>(null);
  const [newAudioBlob, setNewAudioBlob] = useState<Blob | null>(null);
  
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>(TargetLanguage.ENGLISH);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslationCard, setShowTranslationCard] = useState(false);

  useEffect(() => {
    loadContent();
    refreshArchive();
  }, []);

  const loadContent = async () => {
    setIsLoadingInitial(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const contentDate = new Date(now);
      if (hour < 12) contentDate.setDate(contentDate.getDate() - 1);
      
      const year = contentDate.getFullYear();
      const month = String(contentDate.getMonth() + 1).padStart(2, '0');
      const day = String(contentDate.getDate()).padStart(2, '0');
      const todayKey = `${year}-${month}-${day}`;
      
      const todayCached = await dbService.getEpisode(todayKey);
      
      if (todayCached) {
        const audioUrl = URL.createObjectURL(todayCached.audioBlob);
        setPodcast({ ...todayCached.episode, audioUrl });
        setIsLoadingInitial(false);
        return;
      }

      const latestCached = await dbService.getLatestEpisode();
      if (latestCached) {
          const audioUrl = URL.createObjectURL(latestCached.audioBlob);
          setPodcast({ ...latestCached.episode, audioUrl });
          setIsLoadingInitial(false); 
      }

      if (process.env.API_KEY) {
           setIsUpdatingBackground(true);
           const { episode, audioBlob } = await geminiService.generateDailyEpisode(todayKey);
           
           if (audioBlob.size > 0) {
               await dbService.saveEpisode(todayKey, episode, audioBlob);
               refreshArchive();
           }

           if (latestCached) {
               setNewEpisodeAvailable(episode);
               setNewAudioBlob(audioBlob);
           } else {
               const audioUrl = URL.createObjectURL(audioBlob);
               setPodcast({ ...episode, audioUrl });
           }
      } else {
           if (!latestCached) setPodcast(MOCK_PODCAST);
      }
    } catch (error) {
      console.error(error);
      if (!podcast) setPodcast(MOCK_PODCAST); 
    } finally {
      setIsLoadingInitial(false);
      setIsUpdatingBackground(false);
    }
  };

  const refreshArchive = async () => {
    const episodes = await dbService.getAllEpisodes();
    setAllEpisodes(episodes);
  };

  const handleSelectEpisode = (stored: StoredEpisode) => {
    if (podcast?.audioUrl) URL.revokeObjectURL(podcast.audioUrl);
    const audioUrl = URL.createObjectURL(stored.audioBlob);
    setPodcast({ ...stored.episode, audioUrl });
    setCurrentTime(0);
    setView('home');
    setShowTranslationCard(false);
  };

  const handleApplyNewEpisode = () => {
    if (!newEpisodeAvailable) return;
    if (podcast?.audioUrl) URL.revokeObjectURL(podcast.audioUrl);
    let newAudioUrl = "";
    if (newAudioBlob) newAudioUrl = URL.createObjectURL(newAudioBlob);
    setPodcast({ ...newEpisodeAvailable, audioUrl: newAudioUrl });
    setNewEpisodeAvailable(null);
    setNewAudioBlob(null);
    setCurrentTime(0);
    setView('home');
  };

  useEffect(() => {
    if (!podcast) return;
    const currentSeg = podcast.transcript.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
    if (currentSeg && !showTranslationCard) {
      setActiveSegmentId(currentSeg.id);
    }
  }, [currentTime, showTranslationCard, podcast]);

  const handleSegmentClick = async (segment: TranscriptSegment) => {
    setCurrentTime(segment.startTime);
    setActiveSegmentId(segment.id);
    setShowTranslationCard(true);
    await translateText(segment.text, selectedLanguage);
  };

  const translateText = async (text: string, lang: TargetLanguage) => {
    setIsTranslating(true);
    setTranslation(null);
    try {
      const result = await geminiService.translateSegment(text, lang);
      setTranslation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLanguageChange = async (lang: TargetLanguage) => {
    setSelectedLanguage(lang);
    if (translation) await translateText(translation.original, lang);
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-suomi-blue"></div>
        <p className="text-gray-500 font-medium">Loading SuomiCast News...</p>
      </div>
    );
  }

  if (!podcast) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-40 md:pb-32">
      <Header currentView={view} onViewChange={setView} />

      {newEpisodeAvailable && (
        <div className="bg-indigo-600 text-white px-4 py-3 shadow-md sticky top-16 z-30 flex justify-between items-center animate-fade-in-down">
            <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-medium text-sm">Today's news is out!</span>
            </div>
            <button onClick={handleApplyNewEpisode} className="bg-white text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-50">
                Switch to Today
            </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'home' ? (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 h-48 bg-suomi-blue rounded-xl shadow-inner flex flex-col items-center justify-center text-white shrink-0 overflow-hidden relative">
                    <div className="absolute top-2 left-2 bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">LIVE</div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-80 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Uutiset</span>
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-suomi-blue text-xs font-bold uppercase">
                          News Bulletin
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{podcast.title}</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">{podcast.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {podcast.duration}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>Selkosuomi (Easy)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">News Transcript</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-6 min-h-[400px]">
                        <Transcript 
                            segments={podcast.transcript} 
                            activeSegmentId={activeSegmentId}
                            onSegmentClick={handleSegmentClick}
                        />
                    </div>
                </div>
                <div className="hidden md:block">
                   <div className="sticky top-24 space-y-4">
                      <div className="bg-gradient-to-br from-suomi-blue/5 to-blue-100/20 rounded-xl p-6 border border-suomi-blue/10">
                          <h4 className="font-bold text-suomi-blue mb-2">Daily Selkosuomi</h4>
                          <p className="text-sm text-blue-800/70 mb-4">
                              Today's news summarized by AI for Finnish learners. Click any text to translate difficult words.
                          </p>
                          <div className="pt-4 border-t border-blue-200/30 flex items-center justify-between">
                            <span className="text-[10px] text-blue-400 font-mono">Gemini 3 Flash</span>
                            <span className="text-[10px] text-blue-400 font-mono">24kHz Audio</span>
                          </div>
                      </div>
                      <button onClick={() => setView('library')} className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.25c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                        View All Past News
                      </button>
                   </div>
                </div>
            </div>
          </>
        ) : (
          <Archive 
            episodes={allEpisodes} 
            onSelectEpisode={handleSelectEpisode} 
            currentEpisodeId={podcast.id} 
          />
        )}
      </main>

      {showTranslationCard && (
        <TranslationCard 
            isLoading={isTranslating}
            translation={translation}
            currentLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onClose={() => setShowTranslationCard(false)}
        />
      )}

      <AudioPlayer 
        key={podcast.id}
        episode={podcast}
        currentTime={currentTime}
        onTimeUpdate={setCurrentTime}
      />
    </div>
  );
};

export default App;

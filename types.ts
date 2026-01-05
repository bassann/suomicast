export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  transcript: TranscriptSegment[];
}

export enum TargetLanguage {
  ENGLISH = 'English',
  CHINESE = 'Chinese (Simplified)',
  UKRAINIAN = 'Ukrainian',
  SPANISH = 'Spanish',
  GERMAN = 'German'
}

export interface TranslationResult {
  original: string;
  translation: string;
  notes: string;
  detectedLanguage: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
}

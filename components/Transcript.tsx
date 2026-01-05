import React from 'react';
import { TranscriptSegment } from '../types';

interface TranscriptProps {
  segments: TranscriptSegment[];
  activeSegmentId: string | null;
  onSegmentClick: (segment: TranscriptSegment) => void;
}

const Transcript: React.FC<TranscriptProps> = ({ segments, activeSegmentId, onSegmentClick }) => {
  return (
    <div className="space-y-4 pb-32">
      {segments.map((segment) => {
        const isActive = activeSegmentId === segment.id;
        return (
          <p
            key={segment.id}
            onClick={() => onSegmentClick(segment)}
            className={`
              cursor-pointer p-3 rounded-lg transition-all duration-200 text-lg leading-relaxed
              ${isActive 
                ? 'bg-suomi-blue/10 text-suomi-blue font-medium border-l-4 border-suomi-blue shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
              }
            `}
          >
            {segment.text}
          </p>
        );
      })}
    </div>
  );
};

export default Transcript;
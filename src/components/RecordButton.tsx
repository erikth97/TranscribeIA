import React from 'react';
import type { RecordingStatus } from '../types';

interface RecordButtonProps {
  status: RecordingStatus;
  onToggle: () => void;
  duration?: number;
  wordCount?: number;
}

const RecordButton: React.FC<RecordButtonProps> = ({
  status,
  onToggle,
  duration = 0,
  wordCount = 0
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'idle':
        return {
          emoji: '🎙️',
          className: 'bg-purple-600 hover:bg-purple-700 border-purple-500 hover:scale-110',
          disabled: false
        };
      
      case 'recording':
        return {
          emoji: '🔴',
          className: 'bg-red-600 hover:bg-red-700 border-red-500 animate-pulse hover:scale-110',
          disabled: false
        };
      
      case 'processing':
        return {
          emoji: '⏳',
          className: 'bg-orange-600 border-orange-500 cursor-not-allowed',
          disabled: true
        };
      
      case 'completed':
        return {
          emoji: '✅',
          className: 'bg-green-600 hover:bg-green-700 border-green-500 hover:scale-110',
          disabled: false
        };
      
      default:
        return {
          emoji: '❌',
          className: 'bg-red-600 border-red-500 cursor-not-allowed',
          disabled: true
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Circular Record Button - 80px */}
      <button
        onClick={buttonConfig.disabled ? undefined : onToggle}
        disabled={buttonConfig.disabled}
        className={`
          w-20 h-20 rounded-full border-4 font-semibold text-white 
          transition-all duration-200 transform
          focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
          disabled:transform-none disabled:hover:scale-100
          flex items-center justify-center
          ${buttonConfig.className}
        `}
      >
        <span className="text-2xl">{buttonConfig.emoji}</span>
      </button>

      {/* Status Indicator */}
      <div className="text-center">
        {status === 'idle' && (
          <p className="text-sm text-purple-300 font-medium">Listo para grabar</p>
        )}
        
        {status === 'recording' && (
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">GRABANDO</span>
            </div>
            <div className="text-xl font-mono text-white">{formatDuration(duration)}</div>
          </div>
        )}
        
        {status === 'processing' && (
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2 text-orange-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">PROCESANDO</span>
            </div>
            <div className="text-xl font-mono text-white">{formatDuration(duration)}</div>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <span className="text-sm font-medium">COMPLETADO</span>
            </div>
            <div className="text-sm text-gray-300">
              {formatDuration(duration)} • {wordCount.toLocaleString()} palabras
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordButton;
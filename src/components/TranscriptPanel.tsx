import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { useMeetingStore } from '../store/meetingStore';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TranscriptPanelProps {
  className?: string;
}

const TranscriptPanel: FC<TranscriptPanelProps> = ({ className = '' }) => {
  const { transcript, status, wordCount, duration, error, isSupported } = useWebSpeech();
  const { setTranscriptData } = useMeetingStore();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  // Save transcript drafts to localStorage for recovery
  const [, setTranscriptHistory] = useLocalStorage<any[]>('transcript-history', []);
  const [lastTranscript, setLastTranscript] = useLocalStorage<string>('last-transcript', '');

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Update store when transcript changes
  useEffect(() => {
    setTranscriptData({
      text: transcript,
      isRecording: status === 'recording',
      wordCount,
      duration
    });
  }, [transcript, status, wordCount, duration, setTranscriptData]);

  // Save transcript to localStorage for backup/recovery
  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      setLastTranscript(transcript);
      
      // Save completed transcripts to history
      if (status === 'completed' && transcript.length > 50) {
        const historyEntry = {
          id: Date.now(),
          text: transcript,
          wordCount,
          duration,
          timestamp: new Date().toISOString(),
          preview: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : '')
        };
        
        setTranscriptHistory((prev: any[]) => {
          const newHistory = [historyEntry, ...prev];
          // Keep only last 10 transcripts
          return newHistory.slice(0, 10);
        });
      }
    }
  }, [transcript, status, lastTranscript, wordCount, duration, setLastTranscript, setTranscriptHistory]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording': return 'text-red-400';
      case 'processing': return 'text-orange-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Listo para grabar';
      case 'recording': return 'Grabando...';
      case 'processing': return 'Procesando...';
      case 'completed': return 'Transcripción completada';
      case 'error': return 'Error en la grabación';
      default: return 'Estado desconocido';
    }
  };

  if (!isSupported) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center text-red-400 mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Navegador no compatible
          </div>
          <p className="text-sm text-red-300">
            Tu navegador no soporta la API de reconocimiento de voz. 
            Prueba con Chrome, Edge o Firefox actualizado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center ${getStatusColor()}`}>
            {status === 'recording' && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            )}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          {status === 'recording' && (
            <div className="text-sm text-gray-400">
              {formatDuration(duration)}
            </div>
          )}
        </div>
        
        {wordCount > 0 && (
          <div className="text-sm text-gray-400">
            {wordCount.toLocaleString()} palabras
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center text-red-400 text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div className="bg-gray-700 rounded-lg min-h-64 max-h-96 overflow-y-auto">
        {transcript ? (
          <div className="p-4">
            <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {transcript}
            </div>
            <div ref={transcriptEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-sm">
                {status === 'idle' 
                  ? 'Presiona el botón de grabación para comenzar' 
                  : 'El texto de la conversación aparecerá aquí...'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Actions */}
      {transcript && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-MX')}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              className="flex items-center px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              title="Copiar transcripción"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptPanel;
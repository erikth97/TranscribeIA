import { useState, useCallback } from 'react';
import { SpeechRecognitionResult, RecordingStatus } from '../types';

export const useWebSpeech = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();

  const startRecording = useCallback(() => {
    // Web Speech API logic will be implemented here
    setStatus('recording');
    setError(undefined);
    console.log('Starting recording...');
  }, []);

  const stopRecording = useCallback(() => {
    // Stop Web Speech API logic will be implemented here
    setStatus('completed');
    console.log('Stopping recording...');
  }, []);

  const resetRecording = useCallback(() => {
    setStatus('idle');
    setTranscript('');
    setWordCount(0);
    setDuration(0);
    setError(undefined);
  }, []);

  // Helper function to update transcript data
  const updateTranscript = useCallback((newText: string) => {
    setTranscript(newText);
    setWordCount(newText.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, []);

  return {
    status,
    transcript,
    wordCount,
    duration,
    error,
    isRecording: status === 'recording',
    startRecording,
    stopRecording,
    resetRecording,
    updateTranscript
  };
};
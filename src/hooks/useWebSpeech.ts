import { useState, useCallback, useRef, useEffect } from 'react';
import type { RecordingStatus } from '../types';
import '../types/speechTypes';

export const useWebSpeech = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in (window as any) || 'webkitSpeechRecognition' in (window as any));

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Tu navegador no soporta la API de reconocimiento de voz');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX'; // Cambio de es-ES a es-MX según requerimiento

    recognition.onstart = () => {
      setStatus('recording');
      setError(undefined);
      startTimeRef.current = Date.now();
      
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (transcript + finalTranscript + interimTranscript).trim();
      setTranscript(fullTranscript);
      setWordCount(fullTranscript.split(/\s+/).filter(word => word.length > 0).length);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Show popup for all errors but handle some gracefully
      setError(`Error de reconocimiento: ${event.error}`);
      setShowErrorPopup(true);
      
      // Try to restart automatically for no-speech timeout
      if (event.error === 'no-speech' && status === 'recording') {
        console.warn('No speech detected, attempting restart...');
        setTimeout(() => {
          try {
            recognition.start();
            setError(undefined);
            setShowErrorPopup(false);
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            setStatus('error');
          }
        }, 100);
        return;
      }
      
      // For other errors, set error state
      setStatus('error');
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    recognition.onend = () => {
      if (status === 'recording') {
        setStatus('completed');
      }
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]); // Remove status dependency to prevent infinite loop

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        setStatus('recording');
        setError(undefined);
        setTranscript('');
        setWordCount(0);
        setDuration(0);
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Permiso de micrófono denegado');
      setStatus('error');
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && status === 'recording') {
      setStatus('processing');
      recognitionRef.current.stop();
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Simulate processing time
      setTimeout(() => {
        setStatus('completed');
      }, 1000);
    }
  }, [status]);

  const resetRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setStatus('idle');
    setTranscript('');
    setWordCount(0);
    setDuration(0);
    setError(undefined);
  }, []);

  // Add error recovery function
  const recoverFromError = useCallback(() => {
    console.log('Attempting to recover from error state...');
    setStatus('idle');
    setError(undefined);
    setShowErrorPopup(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition during recovery:', error);
      }
    }
  }, []);

  // Close error popup function
  const closeErrorPopup = useCallback(() => {
    setShowErrorPopup(false);
  }, []);

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
    showErrorPopup,
    isRecording: status === 'recording',
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
    updateTranscript,
    recoverFromError,
    closeErrorPopup
  };
};
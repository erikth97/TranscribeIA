import { useState, useCallback, useRef, useEffect } from 'react';
import type { RecordingStatus } from '../types';
import '../types/speechTypes';

export const useWebSpeech = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();

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
    recognition.lang = 'es-ES';

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
      setError(`Error de reconocimiento: ${event.error}`);
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
  }, [isSupported, status]);

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
      recognitionRef.current.stop();
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
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
    updateTranscript
  };
};
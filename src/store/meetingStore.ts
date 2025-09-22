import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MeetingData, TranscriptData, SummaryData } from '../types';

interface MeetingState {
  // Core data using defined types
  meetingData: MeetingData;
  transcriptData: TranscriptData;
  summaryData: SummaryData;
  
  // Session data
  sessionId: string;
  lastSaved: number;
  
  // Actions
  setMeetingData: (data: MeetingData) => void;
  updateMeetingData: (data: Partial<MeetingData>) => void;
  setTranscriptData: (data: Partial<TranscriptData>) => void;
  setSummaryData: (data: Partial<SummaryData>) => void;
  startNewSession: () => void;
  saveSession: () => void;
  resetStore: () => void;
  
  // Computed getters
  getIsFormComplete: () => boolean;
  getSessionDuration: () => number;
}

const initialMeetingData: MeetingData = {
  name: '',
  participants: [],
  type: 'daily'
};

const initialTranscriptData: TranscriptData = {
  text: '',
  isRecording: false,
  wordCount: 0,
  duration: 0
};

const initialSummaryData: SummaryData = {
  content: '',
  isLoading: false,
  error: undefined
};

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      // Initial state
      meetingData: initialMeetingData,
      transcriptData: initialTranscriptData,
      summaryData: initialSummaryData,
      sessionId: generateSessionId(),
      lastSaved: Date.now(),
      
      // Actions
      setMeetingData: (data) => {
        set({ 
          meetingData: data,
          lastSaved: Date.now()
        });
      },
      
      updateMeetingData: (data) => {
        set((state) => ({
          meetingData: { ...state.meetingData, ...data },
          lastSaved: Date.now()
        }));
      },
      
      setTranscriptData: (data) => {
        set((state) => ({
          transcriptData: { ...state.transcriptData, ...data },
          lastSaved: Date.now()
        }));
      },
      
      setSummaryData: (data) => {
        set((state) => ({
          summaryData: { ...state.summaryData, ...data },
          lastSaved: Date.now()
        }));
      },
      
      startNewSession: () => {
        set({
          meetingData: initialMeetingData,
          transcriptData: initialTranscriptData,
          summaryData: initialSummaryData,
          sessionId: generateSessionId(),
          lastSaved: Date.now()
        });
      },
      
      saveSession: () => {
        set({ lastSaved: Date.now() });
        
        // Save to additional storage if needed (e.g., export functionality)
        const state = get();
        const sessionData = {
          sessionId: state.sessionId,
          meetingData: state.meetingData,
          transcriptData: state.transcriptData,
          summaryData: state.summaryData,
          timestamp: Date.now()
        };
        
        try {
          const sessions = JSON.parse(localStorage.getItem('meeting_sessions') || '[]');
          const existingIndex = sessions.findIndex((s: any) => s.sessionId === state.sessionId);
          
          if (existingIndex >= 0) {
            sessions[existingIndex] = sessionData;
          } else {
            sessions.push(sessionData);
          }
          
          // Keep only last 10 sessions
          if (sessions.length > 10) {
            sessions.splice(0, sessions.length - 10);
          }
          
          localStorage.setItem('meeting_sessions', JSON.stringify(sessions));
        } catch (error) {
          console.error('Error saving session:', error);
        }
      },
      
      resetStore: () => {
        set({
          meetingData: initialMeetingData,
          transcriptData: initialTranscriptData,
          summaryData: initialSummaryData,
          sessionId: generateSessionId(),
          lastSaved: Date.now()
        });
      },
      
      // Computed getters
      getIsFormComplete: () => {
        const { meetingData } = get();
        const validParticipants = meetingData.participants.filter(p => p.trim().length > 0);
        return !!(meetingData.name.length >= 3 && validParticipants.length > 0 && meetingData.type);
      },
      
      getSessionDuration: () => {
        const { transcriptData } = get();
        return transcriptData.duration;
      }
    }),
    {
      name: 'meeting-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        meetingData: state.meetingData,
        transcriptData: {
          text: state.transcriptData.text,
          wordCount: state.transcriptData.wordCount,
          duration: state.transcriptData.duration,
          isRecording: false // Don't persist recording state
        },
        summaryData: state.summaryData,
        sessionId: state.sessionId,
        lastSaved: state.lastSaved
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset recording state on app reload
          state.transcriptData.isRecording = false;
        }
      }
    }
  )
);
import { create } from 'zustand';
import type { MeetingData, TranscriptData, SummaryData } from '../types';

interface MeetingState {
  // Core data using defined types
  meetingData: MeetingData;
  transcriptData: TranscriptData;
  summaryData: SummaryData;
  
  // Actions
  setMeetingData: (data: MeetingData) => void;
  setTranscriptData: (data: Partial<TranscriptData>) => void;
  setSummaryData: (data: Partial<SummaryData>) => void;
  resetStore: () => void;
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

export const useMeetingStore = create<MeetingState>((set) => ({
  // Initial state
  meetingData: initialMeetingData,
  transcriptData: initialTranscriptData,
  summaryData: initialSummaryData,
  
  // Actions
  setMeetingData: (data) => set({ meetingData: data }),
  
  setTranscriptData: (data) => set((state) => ({
    transcriptData: { ...state.transcriptData, ...data }
  })),
  
  setSummaryData: (data) => set((state) => ({
    summaryData: { ...state.summaryData, ...data }
  })),
  
  resetStore: () => set({
    meetingData: initialMeetingData,
    transcriptData: initialTranscriptData,
    summaryData: initialSummaryData
  })
}));
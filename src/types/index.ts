// Core Meeting Data Interface
export interface MeetingData {
  name: string;
  participants: string[];
  type: 'daily' | 'planning' | 'retrospective';
}

// Core Transcript Data Interface
export interface TranscriptData {
  text: string;
  isRecording: boolean;
  wordCount: number;
  duration: number;
}

// Core Summary Data Interface
export interface SummaryData {
  content: string;
  isLoading: boolean;
  error?: string;
}

// Extended types for additional functionality
export interface ExtendedMeetingData extends MeetingData {
  project?: string;
  department?: string;
  date?: Date;
}

export interface TranscriptSegment {
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface ExtendedTranscriptData extends TranscriptData {
  startTime?: Date;
  segments?: TranscriptSegment[];
  averageConfidence?: number;
}

export interface ExtendedSummaryData extends SummaryData {
  isGenerated: boolean;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    generatedAt: Date;
  };
}

// Web Speech API types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'txt' | 'md';
  includeMetadata: boolean;
  includeTranscript: boolean;
}

// Form types
export interface MeetingFormData {
  name: string;
  participants: string;
  type: 'daily' | 'planning' | 'retrospective';
}

// Recording states
export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'completed' | 'error';
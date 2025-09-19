import { MeetingData, TranscriptData, ApiResponse } from '../types';

interface SummaryRequest {
  transcript: string;
  metadata: {
    meetingName: string;
    participants: string[];
    type: string;
    duration?: number;
    wordCount?: number;
  };
}

interface SummaryResponse {
  success: boolean;
  summary: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    model: string;
  };
  error?: string;
}

export const generateSummary = async (
  transcriptData: TranscriptData,
  meetingData: MeetingData
): Promise<SummaryResponse> => {
  try {
    const requestData: SummaryRequest = {
      transcript: transcriptData.text,
      metadata: {
        meetingName: meetingData.name,
        participants: meetingData.participants,
        type: meetingData.type,
        duration: transcriptData.duration,
        wordCount: transcriptData.wordCount
      }
    };

    const response = await fetch('https://vps.torremotomex.com/webhook/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      success: false,
      summary: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
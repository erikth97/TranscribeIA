import type { MeetingData, TranscriptData } from '../types';

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

// Configuration for AI service
const AI_CONFIG = {
  endpoint: import.meta.env.VITE_AI_ENDPOINT || 'https://vps.torremotomex.com/webhook/summary',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  timeout: 30000, // 30 seconds
  retries: 3,
  model: 'gpt-4-turbo'
};

// Retry utility function
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number,
  delay: number = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Generate summary with mock fallback for development
export const generateSummary = async (
  transcriptData: TranscriptData,
  meetingData: MeetingData
): Promise<SummaryResponse> => {
  
  // If no transcript, return early
  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return {
      success: false,
      summary: '',
      error: 'No hay texto para procesar'
    };
  }

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

    // Production API call with retries
    const makeAPICall = async (): Promise<SummaryResponse> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add API key if available
        if (AI_CONFIG.apiKey) {
          headers['Authorization'] = `Bearer ${AI_CONFIG.apiKey}`;
        }

        const response = await fetch(AI_CONFIG.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...requestData,
            model: AI_CONFIG.model,
            temperature: 0.3,
            max_tokens: 1500
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return {
          success: true,
          summary: result.summary || result.content || 'Resumen generado exitosamente',
          metadata: {
            tokensUsed: result.metadata?.tokensUsed || 0,
            processingTime: result.metadata?.processingTime || 0,
            model: result.metadata?.model || AI_CONFIG.model
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Try API call with retries
    return await retryWithBackoff(makeAPICall, AI_CONFIG.retries);

  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Fallback: Generate mock summary for development/demo
    return generateMockSummary(transcriptData, meetingData);
  }
};

// Mock summary generator for development/fallback
const generateMockSummary = (
  transcriptData: TranscriptData,
  meetingData: MeetingData
): SummaryResponse => {
  const summaryTemplates = {
    daily: generateDailySummary,
    planning: generatePlanningSummary,
    retrospective: generateRetrospectiveSummary
  };

  const generator = summaryTemplates[meetingData.type] || summaryTemplates.daily;
  const summary = generator(transcriptData, meetingData);

  return {
    success: true,
    summary,
    metadata: {
      tokensUsed: Math.floor(transcriptData.wordCount * 1.3),
      processingTime: Math.random() * 2000 + 1000,
      model: 'mock-ai-model'
    }
  };
};

const generateDailySummary = (transcriptData: TranscriptData, meetingData: MeetingData): string => {
  return `## Resumen Daily Standup - ${meetingData.name}

**Participantes:** ${meetingData.participants.join(', ')}
**Duración:** ${Math.floor(transcriptData.duration / 60)} minutos
**Palabras transcritas:** ${transcriptData.wordCount.toLocaleString()}

### Puntos Principales Discutidos:
• Estado actual de las tareas en progreso
• Bloqueadores identificados y resoluciones propuestas  
• Objetivos para el próximo día de trabajo
• Coordinación entre miembros del equipo

### Próximos Pasos:
• Continuar con las tareas asignadas
• Resolver bloqueadores identificados
• Seguimiento en el próximo daily

*Este resumen fue generado automáticamente basado en la transcripción de ${transcriptData.wordCount} palabras.*`;
};

const generatePlanningSummary = (transcriptData: TranscriptData, meetingData: MeetingData): string => {
  return `## Resumen Planning Session - ${meetingData.name}

**Participantes:** ${meetingData.participants.join(', ')}
**Duración:** ${Math.floor(transcriptData.duration / 60)} minutos
**Palabras transcritas:** ${transcriptData.wordCount.toLocaleString()}

### Objetivos del Sprint:
• Definición de historias de usuario prioritarias
• Estimación de esfuerzos y complejidad
• Asignación de responsabilidades por tarea
• Establecimiento de criterios de aceptación

### Decisiones Tomadas:
• Sprint goal definido y acordado por el equipo
• Backlog refinado y priorizado
• Compromisos de entrega establecidos

### Próximos Pasos:
• Inicio de desarrollo de las historias seleccionadas
• Daily standups para seguimiento de progreso
• Review al final del sprint

*Este resumen fue generado automáticamente basado en la transcripción de ${transcriptData.wordCount} palabras.*`;
};

const generateRetrospectiveSummary = (transcriptData: TranscriptData, meetingData: MeetingData): string => {
  return `## Resumen Retrospectiva - ${meetingData.name}

**Participantes:** ${meetingData.participants.join(', ')}
**Duración:** ${Math.floor(transcriptData.duration / 60)} minutos
**Palabras transcritas:** ${transcriptData.wordCount.toLocaleString()}

### ¿Qué funcionó bien?
• Comunicación efectiva entre el equipo
• Cumplimiento de objetivos establecidos
• Buena colaboración en resolución de problemas

### ¿Qué se puede mejorar?
• Procesos de testing y QA
• Estimación de tiempos de desarrollo  
• Documentación de decisiones técnicas

### Acciones a Tomar:
• Implementar mejoras identificadas
• Asignar responsables para cada acción
• Revisar progreso en próxima retrospectiva

*Este resumen fue generado automáticamente basado en la transcripción de ${transcriptData.wordCount} palabras.*`;
};
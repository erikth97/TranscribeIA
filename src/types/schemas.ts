import { z } from 'zod';

// Meeting Types Schema
export const MeetingTypeSchema = z.enum(['daily', 'planning', 'retrospective'], {
  message: 'Selecciona un tipo de reunión válido'
});

// Core Meeting Data Schema
export const MeetingDataSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'El nombre contiene caracteres no válidos'),
  
  participants: z.array(z.string().min(1, 'Nombre de participante requerido'))
    .min(1, 'Debe haber al menos un participante')
    .max(20, 'Máximo 20 participantes permitidos')
    .refine((participants) => {
      const uniqueParticipants = new Set(participants.map(p => p.trim().toLowerCase()));
      return uniqueParticipants.size === participants.length;
    }, 'No puede haber participantes duplicados'),
  
  type: MeetingTypeSchema
});

// Meeting Form Schema (for form handling)
export const MeetingFormSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Solo se permiten letras, números, espacios y los caracteres: - _ .'),
  
  participants: z.array(z.string())
    .min(1, 'Agrega al menos un participante')
    .max(20, 'Máximo 20 participantes'),
  
  type: MeetingTypeSchema
});

// Transcript Data Schema
export const TranscriptDataSchema = z.object({
  text: z.string().min(0),
  isRecording: z.boolean(),
  wordCount: z.number().min(0).int(),
  duration: z.number().min(0)
});

// Summary Data Schema
export const SummaryDataSchema = z.object({
  content: z.string(),
  isLoading: z.boolean(),
  error: z.string().optional()
});

// Recording Status Schema
export const RecordingStatusSchema = z.enum([
  'idle', 
  'recording', 
  'paused', 
  'processing', 
  'completed', 
  'error'
]);

// Extended schemas for more complex validation
export const ExtendedMeetingDataSchema = MeetingDataSchema.extend({
  project: z.string().optional(),
  department: z.string().optional(),
  date: z.date().optional()
});

export const TranscriptSegmentSchema = z.object({
  text: z.string(),
  timestamp: z.number().min(0),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean()
});

export const ExtendedTranscriptDataSchema = TranscriptDataSchema.extend({
  startTime: z.date().optional(),
  segments: z.array(TranscriptSegmentSchema).optional(),
  averageConfidence: z.number().min(0).max(1).optional()
});

// Form validation schema for dynamic participant input
export const ParticipantSchema = z.string()
  .min(1, 'Nombre requerido')
  .max(50, 'Máximo 50 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios');

// Export configuration schema
export const ExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'txt', 'md']),
  includeMetadata: z.boolean(),
  includeTranscript: z.boolean()
});

// API Response schema
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional()
  });

// Helper function to validate meeting data
export const validateMeetingData = (data: unknown) => {
  return MeetingDataSchema.safeParse(data);
};

// Helper function to validate form data
export const validateMeetingForm = (data: unknown) => {
  return MeetingFormSchema.safeParse(data);
};

// Type inference from schemas
export type MeetingDataInput = z.infer<typeof MeetingDataSchema>;
export type MeetingFormInput = z.infer<typeof MeetingFormSchema>;
export type TranscriptDataInput = z.infer<typeof TranscriptDataSchema>;
export type SummaryDataInput = z.infer<typeof SummaryDataSchema>;
export type RecordingStatusInput = z.infer<typeof RecordingStatusSchema>;
export type ParticipantInput = string;
export type ExportOptionsInput = z.infer<typeof ExportOptionsSchema>;

// Default values for forms
export const defaultMeetingForm: MeetingFormInput = {
  name: '',
  participants: [''],
  type: 'daily'
};

export const defaultMeetingData: MeetingDataInput = {
  name: '',
  participants: [],
  type: 'daily'
};
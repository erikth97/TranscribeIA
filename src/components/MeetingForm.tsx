import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FC } from 'react';
import type { MeetingData } from '../types';
import { MeetingFormSchema, defaultMeetingForm } from '../types/schemas';
import type { MeetingFormInput } from '../types/schemas';
import { useMeetingStore } from '../store/meetingStore';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MeetingForm: FC = () => {
  const { setMeetingData } = useMeetingStore();
  const [savedFormData, setSavedFormData] = useLocalStorage('meeting-form-draft', defaultMeetingForm);

  // React Hook Form setup with Zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, dirtyFields }
  } = useForm<MeetingFormInput>({
    resolver: zodResolver(MeetingFormSchema),
    defaultValues: savedFormData,
    mode: 'onBlur' // Change from onChange to onBlur for better performance
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants' as never
  });

  // Watch form changes for auto-save - MEMOIZED to prevent unnecessary re-renders
  const watchedData = watch();
  
  // Memoize expensive date calculations
  const { formattedDate, formattedTime } = useMemo(() => {
    const currentDate = new Date();
    return {
      formattedDate: currentDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedTime: currentDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  }, []); // Only calculate once on mount


  // Auto-save form data to localStorage on changes - DEBOUNCED
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (Object.keys(dirtyFields).length > 0) {
          setSavedFormData(watchedData);
        }
      } catch (error) {
        console.error('Error auto-saving form data:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [watchedData, dirtyFields, setSavedFormData]);

  // Auto-save to store when form is valid - DEBOUNCED
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (isValid && watchedData.participants.length > 0) {
          const validParticipants = watchedData.participants.filter(p => p.trim().length > 0);
          
          if (validParticipants.length > 0) {
            const meetingData: MeetingData = {
              name: watchedData.name,
              participants: validParticipants,
              type: watchedData.type
            };
            setMeetingData(meetingData);
          }
        }
      } catch (error) {
        console.error('Error auto-saving to store:', error);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [isValid, watchedData, setMeetingData]);

  // Add participant field
  const addParticipant = () => {
    append('');
  };

  // Remove participant field
  const removeParticipant = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Form submission handler
  const onSubmit = (data: MeetingFormInput) => {
    const validParticipants = data.participants.filter(p => p.trim().length > 0);
    
    const meetingData: MeetingData = {
      name: data.name,
      participants: validParticipants,
      type: data.type
    };
    
    setMeetingData(meetingData);
    // Clear saved draft after successful submission
    setSavedFormData(defaultMeetingForm);
  };

  // Ensure we have at least one participant field
  useEffect(() => {
    try {
      if (fields.length === 0) {
        append('');
      }
    } catch (error) {
      console.error('Error ensuring participant field:', error);
    }
  }, [fields.length, append]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date and Time Display */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-purple-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </div>
          <div className="flex items-center text-purple-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Meeting Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-purple-300">
          Nombre de la Reunión
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Ej: Daily Standup - Equipo Frontend"
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Participants Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-purple-300">
            Participantes
          </label>
          <button
            type="button"
            onClick={addParticipant}
            className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar participante
          </button>
        </div>
        
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`participants.${index}`)}
                type="text"
                className={`flex-1 px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.participants?.[index] ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder={`Participante ${index + 1}`}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Remover participante"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        {errors.participants && (
          <p className="text-sm text-red-400">
            {errors.participants.message || errors.participants.root?.message}
          </p>
        )}
      </div>

      {/* Meeting Type Field */}
      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-medium text-purple-300">
          Tipo de Reunión
        </label>
        <select
          {...register('type')}
          id="type"
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.type ? 'border-red-500' : 'border-gray-600'
          }`}
        >
          <option value="daily">Daily Standup</option>
          <option value="planning">Planning / Sprint</option>
          <option value="retrospective">Retrospectiva</option>
        </select>
        {errors.type && (
          <p className="text-sm text-red-400">{errors.type.message}</p>
        )}
      </div>

      {/* Form Status Indicator */}
      <div className="pt-2">
        {isValid && watchedData.participants.some(p => p.trim().length > 0) ? (
          <div className="flex items-center text-sm text-green-400">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Datos guardados automáticamente
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completa todos los campos
          </div>
        )}
      </div>

      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
          <details>
            <summary>Debug Info (solo desarrollo)</summary>
            <pre className="mt-2 text-xs">
              {JSON.stringify({ isValid, errors, watchedData }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </form>
  );
};

export default MeetingForm;
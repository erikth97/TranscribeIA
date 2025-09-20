import React, { useState } from 'react';
import type { MeetingData } from '../types';
import { useMeetingStore } from '../store/meetingStore';

const MeetingForm: React.FC = () => {
  const { setMeetingData } = useMeetingStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'daily' as const
  });
  const [participants, setParticipants] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la reunión es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    const validParticipants = participants.filter(p => p.trim().length > 0);
    if (validParticipants.length === 0) {
      newErrors.participants = 'Debe haber al menos un participante';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    autoSaveData(newFormData, participants);
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
    autoSaveData(formData, newParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
      autoSaveData(formData, newParticipants);
    }
  };

  const autoSaveData = (currentFormData: typeof formData, currentParticipants: string[]) => {
    const validParticipants = currentParticipants.filter(p => p.trim().length > 0);
    
    if (currentFormData.name.length >= 3 && validParticipants.length > 0 && currentFormData.type) {
      const meetingData: MeetingData = {
        name: currentFormData.name,
        participants: validParticipants,
        type: currentFormData.type
      };
      
      setMeetingData(meetingData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const validParticipants = participants.filter(p => p.trim().length > 0);
      
      const meetingData: MeetingData = {
        name: formData.name,
        participants: validParticipants,
        type: formData.type
      };
      
      setMeetingData(meetingData);
    }
  };

  const validParticipants = participants.filter(p => p.trim().length > 0);
  const isFormComplete = formData.name.length >= 3 && validParticipants.length > 0 && formData.type;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Ej: Daily Standup - Equipo Frontend"
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name}</p>
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
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={participant}
                onChange={(e) => handleParticipantChange(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={`Participante ${index + 1}`}
              />
              {participants.length > 1 && (
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
          <p className="text-sm text-red-400">{errors.participants}</p>
        )}
      </div>

      {/* Meeting Type Field */}
      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-medium text-purple-300">
          Tipo de Reunión
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="daily">Daily Standup</option>
          <option value="planning">Planning / Sprint</option>
          <option value="retrospective">Retrospectiva</option>
        </select>
      </div>

      {/* Form Status Indicator */}
      <div className="pt-2">
        {isFormComplete ? (
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
    </form>
  );
};

export default MeetingForm;
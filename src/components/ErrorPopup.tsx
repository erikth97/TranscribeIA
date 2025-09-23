import { useEffect } from 'react';
import type { FC } from 'react';

interface ErrorPopupProps {
  error: string | null;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const ErrorPopup: FC<ErrorPopupProps> = ({ 
  error, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}) => {
  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [error, autoClose, autoCloseDelay, onClose]);

  if (!error) return null;

  const getErrorInfo = (errorType: string) => {
    const lowerError = errorType.toLowerCase();
    
    if (lowerError.includes('no-speech')) {
      return {
        title: 'No se detectó audio',
        message: 'No se detectó voz durante 8 segundos. La API del navegador requiere audio constante para mantener la grabación activa.',
        icon: '🎤',
        suggestion: 'Habla más cerca del micrófono o en un ambiente más silencioso.',
        isApiLimitation: true
      };
    }
    
    if (lowerError.includes('audio-capture')) {
      return {
        title: 'Problema con el micrófono',
        message: 'No se pudo capturar audio del micrófono. Verifica que esté conectado y funcionando.',
        icon: '🔇',
        suggestion: 'Revisa los permisos del micrófono y que no esté siendo usado por otra aplicación.',
        isApiLimitation: false
      };
    }
    
    if (lowerError.includes('not-allowed')) {
      return {
        title: 'Permisos denegados',
        message: 'Se denegaron los permisos de micrófono. La aplicación necesita acceso al micrófono para funcionar.',
        icon: '🚫',
        suggestion: 'Permite el acceso al micrófono en la configuración del navegador.',
        isApiLimitation: false
      };
    }
    
    if (lowerError.includes('network')) {
      return {
        title: 'Error de conexión',
        message: 'Problema de conexión con el servicio de reconocimiento de voz.',
        icon: '🌐',
        suggestion: 'Verifica tu conexión a internet y vuelve a intentar.',
        isApiLimitation: true
      };
    }
    
    // Error genérico
    return {
      title: 'Error de reconocimiento',
      message: `Error en el sistema de reconocimiento de voz: ${errorType}`,
      icon: '⚠️',
      suggestion: 'Intenta nuevamente. Si el problema persiste, recarga la página.',
      isApiLimitation: true
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-600 max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{errorInfo.icon}</span>
            <h3 className="text-lg font-semibold text-white">
              {errorInfo.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {errorInfo.message}
          </p>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">Sugerencia:</p>
                <p className="text-blue-200 text-sm">
                  {errorInfo.suggestion}
                </p>
              </div>
            </div>
          </div>

          {errorInfo.isApiLimitation && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-0.5">ℹ️</span>
                <div>
                  <p className="text-yellow-300 text-sm font-medium mb-1">Nota técnica:</p>
                  <p className="text-yellow-200 text-sm">
                    Esta es una limitación de la API de reconocimiento de voz del navegador, no de TranscribeIA.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Entendido
          </button>
        </div>

        {/* Auto-close indicator */}
        {autoClose && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-3 h-3 border border-gray-500 rounded-full animate-spin border-t-transparent"></div>
              <span>Se cerrará automáticamente en {autoCloseDelay / 1000}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPopup;
import { Component } from 'react';
import type { ReactNode } from 'react';
import MeetingForm from './components/MeetingForm';
import RecordButton from './components/RecordButton';
import TranscriptPanel from './components/TranscriptPanel';
import SummaryPanel from './components/SummaryPanel';
import ErrorPopup from './components/ErrorPopup';
import { useWebSpeech } from './hooks/useWebSpeech';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error en la aplicación</h1>
            <p className="text-gray-300 mb-4">Ha ocurrido un error inesperado. Recarga la página.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

function App() {
  const {
    status,
    wordCount,
    duration,
    error,
    showErrorPopup,
    startRecording,
    stopRecording,
    resetRecording,
    recoverFromError,
    closeErrorPopup
  } = useWebSpeech();

  const handleToggleRecording = () => {
    switch (status) {
      case 'idle':
        startRecording();
        break;
      case 'recording':
        stopRecording();
        break;
      case 'completed':
        resetRecording();
        break;
      case 'error':
        recoverFromError();
        break;
      default:
        break;
    }
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-white">
              🎙️ TranscribeIA
            </h1>
            <p className="text-purple-200 mt-2">
              Transcripción inteligente de reuniones
            </p>
          </div>
        </header>

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Meeting Form & Controls */}
            <div className="space-y-6">
              {/* Meeting Form Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">
                  📋 Datos de la Reunión
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                      Error en el formulario. Recarga la página.
                    </div>
                  }
                >
                  <MeetingForm />
                </ErrorBoundary>
              </div>

              {/* Controls Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">
                  🎛️ Controles de Grabación
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                      Error en los controles. Recarga la página.
                    </div>
                  }
                >
                  <RecordButton
                    status={status}
                    onToggle={handleToggleRecording}
                    duration={duration}
                    wordCount={wordCount}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Right Column - Transcript & Summary */}
            <div className="space-y-6">
              {/* Transcript Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">
                  📝 Transcripción en Tiempo Real
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                      Error en la transcripción. Recarga la página.
                    </div>
                  }
                >
                  <TranscriptPanel />
                </ErrorBoundary>
              </div>

              {/* Summary Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">
                  📊 Resumen Ejecutivo
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                      Error en el resumen. Recarga la página.
                    </div>
                  }
                >
                  <SummaryPanel />
                </ErrorBoundary>
              </div>
            </div>

          </div>
        </main>

        {/* Error Popup */}
        {showErrorPopup && (
          <ErrorPopup 
            error={error || null}
            onClose={closeErrorPopup}
            autoClose={true}
            autoCloseDelay={6000}
          />
        )}
      </div>
    </AppErrorBoundary>
  )
}

export default App

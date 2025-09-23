import { useState, useEffect } from 'react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMeetingStore } from '../store/meetingStore';
import { generateSummary } from '../services/aiService';
import { exportToPDF } from '../utils/exportPDF';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SummaryPanelProps {
  className?: string;
}

const SummaryPanel: FC<SummaryPanelProps> = ({ className = '' }) => {
  const { 
    summaryData, 
    setSummaryData, 
    meetingData, 
    transcriptData,
    getIsFormComplete 
  } = useMeetingStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);
  
  // Save summaries to localStorage for backup/history
  const [, setSummaryHistory] = useLocalStorage<any[]>('summary-history', []);
  const [, setLastSummary] = useLocalStorage<string>('last-summary', '');

  const canGenerateSummary = getIsFormComplete() && 
    transcriptData.text.trim().length > 0 && 
    transcriptData.wordCount >= 10;

  const handleGenerateSummary = async () => {
    if (!canGenerateSummary || isGenerating) return;

    setIsGenerating(true);
    setSummaryData({ isLoading: true, error: undefined });

    try {
      const result = await generateSummary(transcriptData.text, meetingData);
      
      if (result.success) {
        setSummaryData({
          content: result.summary,
          isLoading: false,
          error: undefined
        });
        setLastGeneratedAt(new Date());
        
        // Save to localStorage history
        const historyEntry = {
          id: Date.now(),
          content: result.summary,
          meetingName: meetingData.name,
          meetingType: meetingData.type,
          wordCount: transcriptData.wordCount,
          duration: transcriptData.duration,
          timestamp: new Date().toISOString(),
          preview: result.summary.substring(0, 150) + (result.summary.length > 150 ? '...' : '')
        };
        
        setSummaryHistory((prev: any[]) => {
          const newHistory = [historyEntry, ...prev];
          return newHistory.slice(0, 5); // Keep only last 5 summaries
        });
        
        setLastSummary(result.summary);
      } else {
        setSummaryData({
          content: '',
          isLoading: false,
          error: result.error || 'Error generando resumen'
        });
      }
    } catch (error) {
      setSummaryData({
        content: '',
        isLoading: false,
        error: 'Error conectando con el servicio de IA'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!summaryData.content) return;

    try {
      await exportToPDF(
        summaryData,
        meetingData,
        transcriptData.wordCount,
        transcriptData.duration
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Could show a toast notification here
    }
  };

  const formatLastGenerated = () => {
    if (!lastGeneratedAt) return '';
    return lastGeneratedAt.toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Auto-generate summary when transcript is completed
  useEffect(() => {
    if (transcriptData.isRecording === false && 
        transcriptData.wordCount >= 50 && 
        !summaryData.content && 
        canGenerateSummary &&
        !isGenerating) {
      // Auto-generate after a short delay
      const timer = setTimeout(() => {
        handleGenerateSummary();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [transcriptData.isRecording, transcriptData.wordCount, summaryData.content, canGenerateSummary, isGenerating]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-purple-300">
            Resumen Ejecutivo
          </span>
          {lastGeneratedAt && (
            <span className="text-xs text-gray-500">
              • Generado a las {formatLastGenerated()}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {summaryData.content && (
            <button
              onClick={handleExportPDF}
              className="flex items-center px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
              title="Exportar a PDF"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          )}
          
          <button
            onClick={handleGenerateSummary}
            disabled={!canGenerateSummary || isGenerating}
            className="flex items-center px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            title={!canGenerateSummary ? 'Completa el formulario y graba audio primero' : 'Generar resumen'}
          >
            {isGenerating ? (
              <>
                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Requirements Notice */}
      {!canGenerateSummary && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-start text-yellow-400 text-sm">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium mb-1">Para generar el resumen necesitas:</p>
              <ul className="text-xs space-y-1 ml-2">
                <li>• Completar los datos de la reunión</li>
                <li>• Grabar al menos 10 palabras de audio</li>
                <li>• Finalizar la grabación</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {summaryData.error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center text-red-400 text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {summaryData.error}
          </div>
        </div>
      )}

      {/* Summary Content */}
      <div className="bg-gray-700 rounded-lg min-h-32 max-h-96 overflow-y-auto">
        {summaryData.isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm">Generando resumen con IA...</p>
            </div>
          </div>
        ) : summaryData.content ? (
          <div className="p-4">
            <div className="text-white text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  // Customize markdown components for better styling
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-purple-300 mb-3 border-b border-purple-500/30 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-purple-300 mb-2 mt-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-purple-300 mb-2 mt-3">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 ml-2 text-gray-200">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-200">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-gray-200">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-gray-200 mb-2 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-300">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-800 text-purple-300 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 bg-gray-800/50 py-2 rounded-r">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {summaryData.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">
                El resumen generado aparecerá aquí...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Actions */}
      {summaryData.content && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Generado con IA • {summaryData.content.length} caracteres
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(summaryData.content)}
              className="flex items-center px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              title="Copiar resumen"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
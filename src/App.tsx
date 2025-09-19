function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg">
        <div className="w-full px-6 py-6">
          <h1 className="text-3xl font-bold text-white">
            🎙️ TranscribeIA
          </h1>
          <p className="text-purple-200 mt-2">
            Transcripción inteligente de reuniones
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Meeting Form & Controls */}
          <div className="space-y-6">
            {/* Meeting Form Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                📋 Datos de la Reunión
              </h2>
              <div className="bg-gray-700 rounded p-4 text-center text-gray-400">
                Formulario de metadatos aquí
              </div>
            </div>

            {/* Controls Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                🎛️ Controles de Grabación
              </h2>
              <div className="bg-gray-700 rounded p-4 text-center text-gray-400">
                Botón de grabación aquí
              </div>
            </div>
          </div>

          {/* Right Column - Transcript & Summary */}
          <div className="space-y-6">
            {/* Transcript Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                📝 Transcripción en Tiempo Real
              </h2>
              <div className="bg-gray-700 rounded p-4 min-h-64 text-center text-gray-400">
                El texto de la conversación aparecerá aquí...
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                📊 Resumen Ejecutivo
              </h2>
              <div className="bg-gray-700 rounded p-4 min-h-32 text-center text-gray-400">
                El resumen generado aparecerá aquí...
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default App

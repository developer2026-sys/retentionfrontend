import React, { useEffect, useState } from 'react';
import { BASE_URL } from './baseurl';

const ProgressOverlay = ({ isVisible, userId }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isVisible || !userId) {
      console.log('ProgressOverlay not visible or no userId:', { isVisible, userId });
      return;
    }

    console.log('Connecting to SSE endpoint:', `${BASE_URL}/api/progress/${userId}`);

    // Connect to SSE endpoint
    const eventSource = new EventSource(`${BASE_URL}/api/progress/${userId}`);

    eventSource.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStage(data.stage);
      setMessage(data.message);
      setError('');
    });

    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      setProgress(100);
      setMessage(data.message);
      setStage('complete');
      
      // Auto close after 1 second
      setTimeout(() => {
        eventSource.close();
      }, 1000);
    });

    eventSource.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      setError(data.message);
      setStage('error');
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [isVisible, userId]);

  if (!isVisible) return null;

  const stageLabels = {
    validation: '📋 Validating',
    credits: '💳 Deducting Credits',
    reading: '📖 Reading File',
    processing: '⚙️ Processing Records',
    finalizing: '✨ Finalizing',
    complete: '✅ Complete',
    error: '❌ Error'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Stage icon & label */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            {stage === 'validation' && '📋'}
            {stage === 'credits' && '💳'}
            {stage === 'reading' && '📖'}
            {stage === 'processing' && '⚙️'}
            {stage === 'finalizing' && '✨'}
            {stage === 'complete' && '✅'}
            {stage === 'error' && '❌'}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {stageLabels[stage] || 'Processing'}
          </h3>
        </div>

        {/* Progress bar */}
        {stage !== 'error' && (
          <div className="mb-6">
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{progress}% complete</p>
          </div>
        )}

        {/* Message */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Spinner */}
        {stage !== 'complete' && stage !== 'error' && (
          <div className="flex justify-center mt-6">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProgressOverlay;
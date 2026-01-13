import { useState } from 'react';
import { Mic, AlertCircle, Check, X } from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export const MicrophonePermissionModal = ({
  isOpen,
  onClose,
  onPermissionGranted,
}: MicrophonePermissionModalProps) => {
  const [permissionState, setPermissionState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setPermissionState('requesting');
    setError(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      
      // Wait a moment to show success, then proceed
      setTimeout(() => {
        onPermissionGranted();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('[Microphone] Permission denied:', err);
      setPermissionState('denied');
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone access was denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Unable to access microphone. Please check your browser settings.');
        }
      }
    }
  };

  const openBrowserSettings = () => {
    alert(
      'To enable microphone access:\n\n' +
      '1. Click the lock icon (🔒) or info icon (ⓘ) in your browser\'s address bar\n' +
      '2. Find "Microphone" permissions\n' +
      '3. Change it to "Allow"\n' +
      '4. Refresh the page and try again'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`relative p-4 rounded-full ${
              permissionState === 'granted'
                ? 'bg-emerald-500/20'
                : permissionState === 'denied'
                ? 'bg-red-500/20'
                : 'bg-cyan-500/20'
            }`}
          >
            {permissionState === 'granted' ? (
              <Check className="h-8 w-8 text-emerald-400" />
            ) : permissionState === 'denied' ? (
              <AlertCircle className="h-8 w-8 text-red-400" />
            ) : (
              <Mic className="h-8 w-8 text-cyan-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          {permissionState === 'granted'
            ? 'Access Granted!'
            : permissionState === 'denied'
            ? 'Access Denied'
            : 'Enable Microphone Access'}
        </h2>

        {/* Description */}
        <p className="text-sm text-white/70 text-center mb-6">
          {permissionState === 'granted'
            ? 'You can now use voice chat to interact with Vasthu.'
            : permissionState === 'denied'
            ? error || 'Microphone access is required for voice chat.'
            : 'Vasthu needs access to your microphone to enable voice conversations. Your audio is processed securely and never stored without your permission.'}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {permissionState === 'idle' && (
            <>
              <button
                onClick={requestPermission}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Mic className="h-4 w-4" />
                Allow Microphone Access
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-white/5 text-white/80 font-medium rounded-xl hover:bg-white/10 transition"
              >
                Maybe Later
              </button>
            </>
          )}

          {permissionState === 'requesting' && (
            <div className="flex items-center justify-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent" />
              <span className="ml-3 text-sm text-white/70">Requesting permission...</span>
            </div>
          )}

          {permissionState === 'denied' && (
            <>
              <button
                onClick={openBrowserSettings}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all"
              >
                <AlertCircle className="h-4 w-4" />
                How to Enable
              </button>
              <button
                onClick={requestPermission}
                className="w-full px-4 py-3 bg-white/5 text-white/80 font-medium rounded-xl hover:bg-white/10 transition"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-white/60 text-sm hover:text-white/80 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Privacy note */}
        {permissionState === 'idle' && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 text-center">
              🔒 Your privacy is important. Audio is transmitted securely and only used for transcription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


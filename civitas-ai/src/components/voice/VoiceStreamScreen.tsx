import { useEffect, useRef, useState, useCallback } from 'react';
import { VoiceStreamClient, type VoiceStreamMessage } from '@/services/voiceStreamApi';
import { X, Mic, Square, Camera } from 'lucide-react';

interface VoiceStreamScreenProps {
  persona?: string;
  language?: string;
  voice?: string;
  threadId?: string;
  userId?: string;
  onClose: () => void;
}

export function VoiceStreamScreen({
  persona = 'friendly',
  language = 'en',
  voice,
  threadId,
  userId,
  onClose,
}: VoiceStreamScreenProps) {
  const [userPartial, setUserPartial] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<VoiceStreamClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(persona);
  const [selectedLang, setSelectedLang] = useState(language);
  const [heroText, setHeroText] = useState('Connecting…');
  // Transcript history (used for UI display)
  const [_aiLines, setAiLines] = useState<string[]>([]);
  const [_userLines, setUserLines] = useState<string[]>([]);
  const [wsReady, setWsReady] = useState(false);
  const [greetingPlayed, setGreetingPlayed] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  // Forward declaration for startRecording (will be defined later)
  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);

  // Continuous Camera Scan Mode
  const startCameraScan = useCallback(async () => {
    if (!wsReady || !clientRef.current) {
      setError('Voice session not ready. Please wait...');
      return;
    }

    try {
      console.log('[VoiceStream] Starting continuous camera scan');

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera on mobile
        audio: false
      });

      // Setup video element
      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsCameraScanning(true);
      setHeroText('Scanning... tell me what you see');

      // Create canvas for frame capture
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      // Capture and analyze frames every 2.5 seconds
      let lastFrameHash = '';

      const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || !clientRef.current || !isCameraScanning) {
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);

          // Convert to base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality for speed

          // Simple frame deduplication (check if frame changed significantly)
          const frameHash = dataUrl.slice(0, 100); // Quick hash
          if (frameHash !== lastFrameHash) {
            lastFrameHash = frameHash;

            console.log('[VoiceStream] Sending frame for analysis');

            // Send frame via WebSocket
            if (clientRef.current.isConnected()) {
              clientRef.current.sendRaw(JSON.stringify({
                type: 'photo',
                photo: dataUrl,
                timestamp: Date.now(),
                is_scan: true // Mark as continuous scan
              }));
            }
          }
        }
      };

      // Start periodic capture
      scanIntervalRef.current = setInterval(captureAndAnalyze, 2500); // Every 2.5 seconds

      console.log('[VoiceStream] Camera scan started');

    } catch (err) {
      console.error('[VoiceStream] Failed to start camera scan:', err);
      setError('Camera access failed. Please allow camera access.');
    }
  }, [wsReady, isCameraScanning]);

  const stopCameraScan = useCallback(() => {
    console.log('[VoiceStream] Stopping camera scan');

    // Stop capture interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraScanning(false);
    setHeroText('Scan stopped');

    console.log('[VoiceStream] Camera scan stopped');
  }, []);

  // Camera/Photo capture handler (single capture mode)
  const handleCameraCapture = useCallback(() => {
    if (!wsReady || !clientRef.current) {
      setError('Voice session not ready. Please wait...');
      return;
    }

    // Trigger file input click
    fileInputRef.current?.click();
  }, [wsReady]);

  const handlePhotoSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !clientRef.current) return;

    console.log('[VoiceStream] Photo selected:', file.name, file.type, file.size);

    try {
      setAnalyzingPhoto(true);
      setHeroText('Analyzing photo...');

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        console.log('[VoiceStream] Photo converted to base64, length:', base64.length);

        // Send photo via WebSocket
        const client = clientRef.current;
        if (client && client.isConnected()) {
          console.log('[VoiceStream] Sending photo to backend...');
          client.sendRaw(JSON.stringify({
            type: 'photo',
            photo: base64,
            timestamp: Date.now()
          }));
          console.log('[VoiceStream] Photo sent successfully');
        } else {
          console.error('[VoiceStream] WebSocket not ready to send photo');
          setError('Connection lost. Please try again.');
          setAnalyzingPhoto(false);
        }
      };

      reader.onerror = () => {
        console.error('[VoiceStream] Failed to read photo file');
        setError('Failed to read photo. Please try again.');
        setAnalyzingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('[VoiceStream] Photo handling error:', err);
      setError('Failed to process photo. Please try again.');
      setAnalyzingPhoto(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const playAudio = useCallback((url: string, isGreeting: boolean = false) => {
    console.log('[VoiceStream] ===========================================');
    console.log('[VoiceStream] Attempting to play audio');
    console.log('[VoiceStream] - URL:', url);
    console.log('[VoiceStream] - URL type:', url.startsWith('data:') ? 'Data URI' : 'Remote URL');
    console.log('[VoiceStream] - URL length:', url.length);
    console.log('[VoiceStream] - Is greeting:', isGreeting);
    console.log('[VoiceStream] ===========================================');

    if (!audioRef.current) {
      audioRef.current = new Audio();
      console.log('[VoiceStream] Created new Audio element');
    }

    const audio = audioRef.current;

    // Stop any currently playing audio
    audio.pause();
    audio.currentTime = 0;

    // Set up new audio
    audio.src = url;
    audio.muted = false;
    audio.volume = 1.0;

    console.log('[VoiceStream] Audio element configured:', {
      muted: audio.muted,
      volume: audio.volume,
      readyState: audio.readyState,
      paused: audio.paused
    });

    // Set up event handlers
    audio.onloadeddata = () => {
      console.log('[VoiceStream] Audio loaded, duration:', audio.duration);
    };

    audio.onplay = () => {
      console.log('[VoiceStream] Audio playback started');
      setAiSpeaking(true);
    };

    audio.onended = () => {
      console.log('[VoiceStream] Audio playback ended');
      setAiSpeaking(false);

      // If this was the greeting, mark it as played and start recording
      if (isGreeting) {
        console.log('[VoiceStream] Greeting finished, starting continuous recording');
        setGreetingPlayed(true);
        setTimeout(() => {
          startRecordingRef.current?.();
        }, 500);
      } else {
        // For regular responses, auto-restart recording for hands-free mode
        console.log('[VoiceStream] AI response finished, restarting recording for next input');
        setTimeout(() => {
          if (greetingPlayed && wsReady) {
            startRecordingRef.current?.();
          }
        }, 500);
      }
    };

    audio.onpause = () => {
      console.log('[VoiceStream] Audio paused');
      setAiSpeaking(false);
    };

    audio.onerror = (e) => {
      console.error('[VoiceStream] Audio error:', e, audio.error);
      setAiSpeaking(false);
      setError('Audio playback failed');

      // If greeting failed, still start recording
      if (isGreeting) {
        console.log('[VoiceStream] Greeting audio failed, starting recording anyway');
        setGreetingPlayed(true);
        setTimeout(() => {
          startRecordingRef.current?.();
        }, 500);
      }
    };

    // Attempt to play
    const playPromise = audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          console.log('[VoiceStream] Audio play promise resolved');
        })
        .catch((err) => {
          console.error('[VoiceStream] Audio play failed:', err);
          setError(`Audio playback failed: ${err.message}`);
          setAiSpeaking(false);

          // If greeting failed, still start recording
          if (isGreeting) {
            console.log('[VoiceStream] Greeting play failed, starting recording anyway');
            setGreetingPlayed(true);
            setTimeout(() => {
              startRecordingRef.current?.();
            }, 500);
          }
        });
    }
  }, []);

  const handleMessage = useCallback((msg: VoiceStreamMessage) => {
    console.log('[VoiceStream] Received message:', msg.type, msg);

    if (msg.type === 'partial') {
      setUserPartial(msg.partial);
      console.log('[VoiceStream] Partial transcript:', msg.partial);
    }
    if (msg.type === 'transcript') {
      setUserTranscript(msg.transcript);
      setUserPartial('');
      setUserLines((prev) => [...prev.slice(-4), msg.transcript]);
      console.log('[VoiceStream] Final transcript:', msg.transcript);
    }
    if (msg.type === 'response_start') {
      setAiText('');
      setHeroText('Thinking…');
      setAnalyzingPhoto(false); // Reset photo analyzing state
      console.log('[VoiceStream] AI response starting');
    }
    if (msg.type === 'response_text') {
      setAiText(msg.text);
      setHeroText(msg.text || 'Working…');
      console.log('[VoiceStream] AI text:', msg.text);
      if ((msg as any).is_complete) {
        setAiLines((prev) => [...prev.slice(-4), msg.text]);
      }
    }
    if (msg.type === 'response_audio') {
      setGreetingPlayed((prevPlayed) => {
        console.log('[VoiceStream] Received audio URL, greetingPlayed:', prevPlayed);
        // First audio message is the greeting
        const isGreeting = !prevPlayed;
        playAudio(msg.audio_url, isGreeting);
        return prevPlayed; // Don't update here, let playAudio handle it
      });
    }
    // Handle command messages via type assertion (command type is extended at runtime)
    const msgAny = msg as any;
    if (msgAny.type === 'command') {
      const command = msgAny.command;
      console.log('[VoiceStream] Received command:', command);

      if (command === 'start_scan') {
        startCameraScan();
      } else if (command === 'stop_scan') {
        stopCameraScan();
      }
    }
    if (msg.type === 'error') {
      console.error('[VoiceStream] Error from server:', msg.message);
      setError(msg.message);
    }
  }, [playAudio, startCameraScan, stopCameraScan]);

  const stopRecording = useCallback(() => {
    console.log('[VoiceStream] Stopping recording');

    // Stop media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Clean up VAD
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    lastSpeechTimeRef.current = 0;

    setRecording(false);
  }, []);

  const Waveform = ({ active }: { active: boolean }) => (
    <div className="flex items-end gap-1 h-12 mt-2">
      {[...Array(16)].map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-emerald-400/70"
          style={{
            height: active ? `${20 + (i % 5) * 6}px` : '12px',
            animation: active ? `pulse${i % 3} 1.2s ease-in-out ${i * 0.03}s infinite` : undefined,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse0 { 0%{transform:scaleY(0.7);} 50%{transform:scaleY(1.6);} 100%{transform:scaleY(0.7);} }
        @keyframes pulse1 { 0%{transform:scaleY(0.8);} 50%{transform:scaleY(1.4);} 100%{transform:scaleY(0.8);} }
        @keyframes pulse2 { 0%{transform:scaleY(0.9);} 50%{transform:scaleY(1.3);} 100%{transform:scaleY(0.9);} }
      `}</style>
    </div>
  );

  // Voice Activity Detection - Auto-detect when user stops speaking
  const setupVAD = useCallback((stream: MediaStream) => {
    try {
      // Create audio context for VAD
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;

      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const MAX_RECORDING_TIME = 15000; // 15 second max recording
      const recordingStartTime = Date.now();

      const checkAudioLevel = () => {
        if (!analyserRef.current || !recording) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Log audio level occasionally for debugging
        if (Math.random() < 0.02) {  // ~2% of the time
          console.log('[VoiceStream] Audio level:', average.toFixed(1));
        }

        // Speech detected if average > threshold (lowered from 30 to 15)
        if (average > 15) {
          lastSpeechTimeRef.current = Date.now();

          // Clear any pending silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        } else {
          // Silence detected
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;

          // If 1.5 seconds of silence after speech, auto-send
          if (timeSinceLastSpeech > 1500 && lastSpeechTimeRef.current > 0 && !silenceTimeoutRef.current) {
            console.log('[VoiceStream] Silence detected after speech, auto-sending...');
            silenceTimeoutRef.current = setTimeout(() => {
              console.log('[VoiceStream] Auto-sending due to silence');
              stopRecording();
            }, 100);
          }
        }

        // Failsafe: Stop recording after max time
        if (Date.now() - recordingStartTime > MAX_RECORDING_TIME) {
          console.log('[VoiceStream] Max recording time reached, auto-stopping');
          stopRecording();
          return;
        }

        // Continue monitoring
        if (recording) {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      checkAudioLevel();
      console.log('[VoiceStream] Voice Activity Detection (VAD) enabled, threshold: 15, max time: 15s');
    } catch (err) {
      console.error('[VoiceStream] Failed to setup VAD:', err);
    }
  }, [recording]);

  const startRecording = useCallback(async () => {
    if (!wsReady) {
      console.warn('[VoiceStream] WebSocket not ready yet, waiting...');
      setError('Connecting to voice service...');
      return;
    }

    if (recording) {
      console.warn('[VoiceStream] Already recording, skipping');
      return;
    }

    setError(null);
    console.log('[VoiceStream] Starting continuous recording (hands-free mode)');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[VoiceStream] Microphone access granted');

      // Setup Voice Activity Detection
      setupVAD(stream);

      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = rec;

      // Reset speech detection
      lastSpeechTimeRef.current = 0;

      // Note: We don't send 'start' control here - that was already sent to get the greeting
      // We just start the MediaRecorder to capture audio

      rec.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const arrayBuffer = await e.data.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          clientRef.current?.sendAudioBase64(b64);
        }
      };

      rec.onstop = async () => {
        console.log('[VoiceStream] Recording stopped, sending end control');
        clientRef.current?.sendControl('end');
      };

      rec.start(250); // stream chunks every 250ms
      setRecording(true);
      setHeroText('Listening… tell me what you need.');
      console.log('[VoiceStream] Recording started successfully');
    } catch (e) {
      console.error('[VoiceStream] mic start failed:', e);
      setError('Microphone access failed. Please allow microphone access.');
    }
  }, [wsReady, recording]);

  // Set the ref so playAudio can call it
  startRecordingRef.current = startRecording;

  // Store handleMessage in a ref to avoid reconnection loop
  const handleMessageRef = useRef(handleMessage);
  handleMessageRef.current = handleMessage;

  // Setup WebSocket connection and request greeting
  useEffect(() => {
    console.log('[VoiceStream] Setting up WebSocket connection');
    setWsReady(false);
    setGreetingPlayed(false);
    setHeroText('Connecting…');

    const client = new VoiceStreamClient();
    clientRef.current = client;

    client.connect({
      persona: selectedPersona,
      language: selectedLang,
      voice,
      thread_id: threadId,
      user_id: userId
    });

    // Use the ref to get the latest handler without causing reconnection
    client.onMessage((msg) => handleMessageRef.current(msg));

    // Give WebSocket a moment to connect, then request greeting
    const readyTimer = setTimeout(() => {
      console.log('[VoiceStream] WebSocket ready, requesting greeting');
      setWsReady(true);
      setHeroText('Welcome! Vasthu is greeting you…');

      // Send 'start' control to trigger greeting from backend
      // But don't start recording yet - that happens after greeting plays
      client.sendControl('start', {
        persona: selectedPersona,
        language: selectedLang,
        voice,
        thread_id: threadId,
        user_id: userId
      });
    }, 500);

    return () => {
      clearTimeout(readyTimer);
      console.log('[VoiceStream] Cleaning up WebSocket');
      client.close();
      clientRef.current = null;
      setWsReady(false);
      setGreetingPlayed(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPersona, selectedLang, voice, threadId, userId]); // Removed handleMessage!

  // Hide sidebar while active
  useEffect(() => {
    const sidebar = document.querySelector('[data-simple-sidebar]') as HTMLElement | null;
    const prevDisplay = sidebar?.style.display;
    if (sidebar) sidebar.style.display = 'none';
    return () => {
      if (sidebar) sidebar.style.display = prevDisplay || '';
    };
  }, []);

  // Note: Recording is now started automatically AFTER greeting plays
  // (handled in the playAudio function's onended callback)

  // Restart session when persona or language changes
  useEffect(() => {
    if (wsReady && greetingPlayed) {
      console.log('[VoiceStream] Persona or language changed, will reconnect with new settings');
      // WebSocket will reconnect in the main useEffect above
      // Greeting will play again, then recording will start
    }
  }, [selectedPersona, selectedLang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[VoiceStream] Component unmounting, cleaning up resources');

      // Stop camera scan
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      // Clean up VAD
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const status = aiSpeaking ? 'Speaking' : recording ? 'Listening' : !greetingPlayed ? 'Greeting' : 'Thinking';

  return (
    <div className="fixed inset-0 z-[9999] text-white flex flex-col bg-gradient-to-b from-[#0a0e1a] via-[#0d1117] to-[#050810]">
      {/* Camera Preview Overlay (when scanning) */}
      {isCameraScanning && videoRef.current && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-4xl">
            {/* Live camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Scanning indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-300">Scanning in real-time...</span>
              </div>
            </div>
            {/* Close/stop button */}
            <button
              onClick={stopCameraScan}
              className="absolute top-8 right-8 p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 transition"
              title="Stop scanning"
            >
              <Square className="w-5 h-5 text-red-300" />
            </button>
          </div>
        </div>
      )}

      {/* Ambient gradient bloom */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/3 top-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[180px] animate-pulse" />
        <div className="absolute right-1/3 bottom-1/3 w-[500px] h-[500px] rounded-full bg-indigo-400/6 blur-[160px]" />
      </div>

      {/* Minimal header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="inline-flex items-center gap-3 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-white/90">Vasthu Live</span>
        </div>
        <div className="flex items-center gap-3">
          <details className="group relative">
            <summary className="cursor-pointer px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 list-none hover:bg-white/10 transition">
              {selectedPersona} • {selectedLang.toUpperCase()}
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0d1117]/98 backdrop-blur-xl p-4 space-y-4 shadow-2xl">
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-white/40 tracking-wider font-medium">Persona</p>
                <div className="grid grid-cols-2 gap-2">
                  {['friendly', 'professional', 'expert', 'concise'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPersona(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedPersona === p
                        ? 'bg-emerald-400/15 border border-emerald-400/50 text-emerald-300'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-white/40 tracking-wider font-medium">Language</p>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs text-white/85 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400/50"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>
          </details>
          <button
            onClick={handleCameraCapture}
            disabled={!wsReady || analyzingPhoto}
            className={`p-2.5 rounded-full border border-white/10 transition ${analyzingPhoto
              ? 'bg-emerald-400/20 border-emerald-400/50 cursor-wait'
              : 'bg-white/5 hover:bg-white/10'
              }`}
            title="Capture photo for analysis"
          >
            <Camera className={`w-4 h-4 ${analyzingPhoto ? 'animate-pulse text-emerald-300' : ''}`} />
          </button>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden file input for camera/photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />

      {/* Centered voice orb + text */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center">
          {/* Orb */}
          <div
            className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'Speaking'
              ? 'shadow-[0_0_60px_rgba(52,211,153,0.4)] border-2 border-emerald-400/60 bg-emerald-400/5'
              : status === 'Greeting'
                ? 'shadow-[0_0_50px_rgba(168,85,247,0.35)] border-2 border-purple-400/60 bg-purple-400/5 animate-pulse'
                : status === 'Thinking'
                  ? 'shadow-[0_0_40px_rgba(129,140,248,0.3)] border-2 border-indigo-300/50 bg-indigo-400/5 animate-pulse'
                  : 'shadow-[0_0_30px_rgba(255,255,255,0.08)] border-2 border-white/20 bg-white/5'
              }`}
          >
            <div
              className={`absolute inset-2 rounded-full blur-xl transition-all duration-500 ${status === 'Speaking'
                ? 'bg-emerald-400/30 animate-pulse'
                : status === 'Greeting'
                  ? 'bg-purple-400/25 animate-[pulse_1.5s_ease-in-out_infinite]'
                  : status === 'Thinking'
                    ? 'bg-indigo-300/25 animate-[pulse_2s_ease-in-out_infinite]'
                    : 'bg-white/10'
                }`}
            />
            <div className="relative z-10 text-base font-medium text-white/80 capitalize">{status}</div>
          </div>

          {/* Live text */}
          <div className="space-y-4 max-w-xl">
            <h2 className="text-[36px] md:text-[42px] font-semibold leading-tight text-white/95">
              {aiText || heroText || 'Listening…'}
            </h2>
            <p className="text-base text-white/60">
              {userPartial || userTranscript || 'Start speaking anytime'}
            </p>
          </div>

          {/* Waveform when speaking or greeting */}
          {(status === 'Speaking' || status === 'Greeting') && (
            <div className="pt-2">
              <Waveform active={aiSpeaking} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-10">
        <button
          onClick={() => {
            if (recording) {
              stopRecording();
            } else {
              // Force set greetingPlayed if user manually starts recording
              if (!greetingPlayed) setGreetingPlayed(true);
              startRecording();
            }
          }}
          disabled={!wsReady}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${!wsReady
            ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
            : recording
              ? 'bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/20 animate-pulse'
              : 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
        >
          <Mic className="w-4 h-4 inline mr-2" />
          {!wsReady ? 'Connecting...' : recording ? '🔴 Listening...' : '🎤 Start Speaking'}
        </button>
        <button
          onClick={() => {
            stopRecording();
            onClose();
          }}
          className="px-6 py-3 rounded-full bg-white/8 border border-white/15 text-sm text-white/80 hover:bg-white/12 transition-all"
        >
          <Square className="w-4 h-4 inline mr-2" />
          End
        </button>
      </div>

      {/* Status/Error messages */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-300 text-center backdrop-blur-sm">
            {error}
          </div>
        )}
        {!wsReady && !error && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 text-center backdrop-blur-sm">
            Connecting to voice service...
          </div>
        )}
        {wsReady && !greetingPlayed && !error && (
          <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl px-4 py-3 text-sm text-indigo-300 text-center backdrop-blur-sm animate-pulse">
            🎙️ Playing greeting... please wait
          </div>
        )}
        {wsReady && greetingPlayed && recording && !error && (
          <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-3 text-sm text-emerald-300 text-center backdrop-blur-sm">
            🎤 Listening... speak now!
          </div>
        )}
        {wsReady && greetingPlayed && !recording && !error && (
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/70 text-center backdrop-blur-sm">
            Click Unmute to start speaking
          </div>
        )}
      </div>
    </div>
  );
}


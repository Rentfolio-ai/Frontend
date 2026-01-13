export type VoiceStreamMessage =
  | { type: 'partial'; partial: string }
  | { type: 'transcript'; transcript: string }
  | { type: 'response_start' }
  | { type: 'response_text'; text: string; is_complete: boolean }
  | { type: 'response_audio'; audio_url: string }
  | { type: 'error'; message: string };

export interface VoiceStreamConfig {
  persona?: string;
  language?: string;
  voice?: string;
  thread_id?: string;
  user_id?: string;
  api_key?: string;
}

export class VoiceStreamClient {
  private ws?: WebSocket;
  private listeners: Array<(msg: VoiceStreamMessage) => void> = [];
  private baseUrl: string;

  constructor(baseUrl = '/api/voice/stream') {
    this.baseUrl = baseUrl;
    console.log('[VoiceStreamClient] Using base URL:', this.baseUrl);
  }

  connect(config: VoiceStreamConfig) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const proto = origin.startsWith('https') ? 'wss' : 'ws';
    const base =
      this.baseUrl.startsWith('http') || this.baseUrl.startsWith('ws')
        ? this.baseUrl
        : `${origin}${this.baseUrl}`;

    const params = new URLSearchParams();
    if (config.persona) params.append('persona', config.persona);
    if (config.language) params.append('language', config.language);
    if (config.voice) params.append('voice', config.voice);
    if (config.thread_id) params.append('thread_id', config.thread_id);
    if (config.user_id) params.append('user_id', config.user_id);
    if (config.api_key) params.append('api_key', config.api_key);

    const url = `${base}?${params.toString()}`;
    const wsUrl = url.replace(/^http(s)?:\/\//, `${proto}://`);

    console.log('[VoiceStreamClient] Connecting to WebSocket:', wsUrl);
    console.log('[VoiceStreamClient] Config:', config);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[VoiceStreamClient] WebSocket connection opened successfully');
    };

    this.ws.onmessage = (event) => {
      console.log('[VoiceStreamClient] Received message:', event.data);
      try {
        const data = JSON.parse(event.data) as VoiceStreamMessage;
        console.log('[VoiceStreamClient] Parsed message:', data);
        this.listeners.forEach((l) => l(data));
      } catch (e) {
        console.error('[VoiceStreamClient] Parse error:', e, 'Raw data:', event.data);
      }
    };

    this.ws.onerror = (e) => {
      console.error('[VoiceStreamClient] WebSocket error:', e);
    };

    this.ws.onclose = (e) => {
      console.log('[VoiceStreamClient] WebSocket closed:', e.code, e.reason);
    };
  }

  sendAudioBase64(b64: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    // server expects binary; decode base64 to Uint8Array
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    this.ws.send(raw);
  }

  sendControl(type: 'start' | 'end', config?: VoiceStreamConfig) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload: any = { type };
    if (config?.persona) payload.persona = config.persona;
    if (config?.language) payload.language = config.language;
    if (config?.voice) payload.voice = config.voice;
    if (config?.thread_id) payload.thread_id = config.thread_id;
    if (config?.user_id) payload.user_id = config.user_id;
    this.ws.send(JSON.stringify(payload));
  }

  onMessage(cb: (msg: VoiceStreamMessage) => void) {
    this.listeners.push(cb);
  }

  /** Check if WebSocket is connected and ready */
  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /** Send raw string data through WebSocket */
  sendRaw(data: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(data);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}


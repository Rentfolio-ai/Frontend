const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const jsonHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

interface ConfigVersionResponse {
    version: string;
    mode: 'standard' | 'thinking' | 'deep-reasoning';
    model: string;
    provider: string;
}

export const getConfigVersion = async (): Promise<ConfigVersionResponse> => {
    const endpoint = `${API_BASE}/api/config/version`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: jsonHeaders,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch config version:', error);
        // Fallback default
        return {
            version: 'ProphetAtlas Deep Reasoning v1',
            mode: 'deep-reasoning',
            model: 'gemini-2.0-flash-thinking-exp',
            provider: 'google'
        };
    }
};

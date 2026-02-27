import type { ModelInfo } from '../types/chat';

/**
 * Static model catalog — mirrors backend MODEL_REGISTRY.
 * Used for immediate rendering without waiting for an API call.
 */
export const AVAILABLE_MODELS: ModelInfo[] = [
  // Auto — server-side smart selection
  { id: 'auto', name: 'Auto', provider: 'auto', tier: 'free', description: 'Automatically picks the best model for your query.', context_window: 0, accessible: true },

  // Google Gemini
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', tier: 'free', description: 'Fast and capable. Great for most tasks.', context_window: 1_048_576, accessible: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', tier: 'pro', description: 'Advanced reasoning, math, and code.', context_window: 1_048_576, accessible: false },

  // OpenAI
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', tier: 'pro', description: 'Latest OpenAI flagship. Strong coding and instruction following.', context_window: 128_000, accessible: false },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', tier: 'free', description: 'Lightweight and fast. Good for routine tasks.', context_window: 128_000, accessible: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'pro', description: 'Multimodal flagship. Text, image, and audio.', context_window: 128_000, accessible: false },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', tier: 'free', description: 'Fast and affordable multimodal model.', context_window: 128_000, accessible: true },

  // Anthropic
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', tier: 'pro', description: 'Strong balance of speed and intelligence.', context_window: 200_000, accessible: false },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic', tier: 'free', description: 'Fastest Claude. Near-frontier intelligence.', context_window: 200_000, accessible: true },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'anthropic', tier: 'pro', description: 'Latest Sonnet. Best balance of quality and speed.', context_window: 200_000, accessible: false },
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'anthropic', tier: 'pro', description: 'Most intelligent Claude. Premium reasoning.', context_window: 200_000, accessible: false },

  // xAI Grok
  { id: 'grok-4-1-fast', name: 'Grok 4.1 Fast', provider: 'xai', tier: 'pro', description: '2M context with reasoning. Best value Grok.', context_window: 2_000_000, accessible: false },
  { id: 'grok-4', name: 'Grok 4', provider: 'xai', tier: 'pro', description: 'Flagship Grok. Premium intelligence.', context_window: 256_000, accessible: false },
];

export const DEFAULT_MODEL_ID = 'auto';

const THINKING_PROVIDERS = new Set(['google', 'anthropic']);

export function modelSupportsThinking(modelId: string): boolean {
  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  return model ? THINKING_PROVIDERS.has(model.provider) : false;
}

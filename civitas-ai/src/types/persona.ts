/**
 * Persona types for Vasthu Live voice assistant
 */

export interface Persona {
    id: string;
    name: string;
    description: string;
    icon: string;
    voiceId: string;
    systemPromptKey: string;
    gradient: string;
}

export const PERSONAS: Persona[] = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Formal, business-focused real estate advisor with precise data-driven insights',
        icon: '👔',
        voiceId: 'neutral-m',
        systemPromptKey: 'voice_persona_professional',
        gradient: 'from-slate-600 to-slate-800',
    },
    {
        id: 'friendly',
        name: 'Friendly',
        description: 'Warm and approachable guide who makes complex topics easy to understand',
        icon: '😊',
        voiceId: 'warm-m',
        systemPromptKey: 'voice_persona_friendly',
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        id: 'expert',
        name: 'Expert',
        description: 'Technical analyst with deep market knowledge and detailed explanations',
        icon: '🎓',
        voiceId: 'clarity-f',
        systemPromptKey: 'voice_persona_expert',
        gradient: 'from-blue-600 to-indigo-700',
    },
    {
        id: 'concise',
        name: 'Concise',
        description: 'Brief and to-the-point responses for quick information',
        icon: '⚡',
        voiceId: 'bright-f',
        systemPromptKey: 'voice_persona_concise',
        gradient: 'from-emerald-500 to-teal-600',
    },
];

export const DEFAULT_PERSONA = PERSONAS[1]; // Friendly by default

export function getPersonaById(id: string): Persona | undefined {
    return PERSONAS.find(p => p.id === id);
}

export function getPersonaGreeting(persona: Persona): string {
    switch (persona.id) {
        case 'professional':
            return "Good day. I'm Vasthu, your professional real estate advisor. How may I assist you with your investment decisions today?";
        case 'friendly':
            return "Hey there! I'm Vasthu, your friendly real estate guide. I'm here to help you find your perfect property. What can I help you with today?";
        case 'expert':
            return "Hello. I'm Vasthu, your real estate market expert. I'm ready to provide detailed analysis and insights. What would you like to explore?";
        case 'concise':
            return "Hi, I'm Vasthu. How can I help?";
        default:
            return "Hello! I'm Vasthu, your real estate assistant. What can I help you with?";
    }
}

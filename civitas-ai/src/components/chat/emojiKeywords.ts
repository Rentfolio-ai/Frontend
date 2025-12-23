// FILE: src/components/chat/emojiKeywords.ts

/**
 * Emoji keyword mappings for search functionality
 * Maps emojis to commonly searched terms
 */
export const EMOJI_KEYWORDS: Record<string, string[]> = {
    // Greetings & Common
    '👋': ['wave', 'hello', 'hi', 'bye', 'goodbye', 'waving', 'hand'],
    '🙏': ['pray', 'thanks', 'please', 'hands', 'thank you', 'namaste'],

    // Emotions
    '😀': ['smile', 'happy', 'grin', 'face'],
    '😃': ['smile', 'happy', 'joy', 'smiley'],
    '😊': ['smile', 'happy', 'blush', 'pleased'],
    '😍': ['love', 'heart', 'eyes', 'infatuated'],
    '🥰': ['love', 'hearts', 'smile', 'adore'],
    '😂': ['laugh', 'funny', 'lol', 'tears', 'haha'],
    '🤣': ['laugh', 'lol', 'rofl', 'rolling'],
    '😭': ['cry', 'tears', 'sad', 'sobbing'],
    '😢': ['cry', 'tear', 'sad'],
    '😎': ['cool', 'sunglasses', 'awesome'],
    '🤔': ['thinking', 'hmm', 'wonder'],
    '😱': ['scream', 'shock', 'scared'],

    // Love & Hearts
    '❤️': ['love', 'heart', 'red'],
    '💙': ['love', 'heart', 'blue'],
    '💚': ['love', 'heart', 'green'],
    '💛': ['love', 'heart', 'yellow'],
    '💜': ['love', 'heart', 'purple'],
    '🧡': ['love', 'heart', 'orange'],
    '💕': ['love', 'hearts', 'two'],
    '💓': ['love', 'heartbeat', 'beating'],

    // Approval & Success
    '👍': ['thumbs', 'up', 'yes', 'approve', 'like', 'good', 'ok'],
    '👎': ['thumbs', 'down', 'no', 'disapprove', 'dislike', 'bad'],
    '✅': ['check', 'yes', 'done', 'complete', 'tick', 'checkmark'],
    '❌': ['x', 'no', 'cross', 'wrong', 'error', 'delete'],
    '💯': ['hundred', '100', 'perfect', 'score', 'full'],
    '💪': ['muscle', 'strong', 'bicep', 'flex', 'strength', 'power'],
    '🏆': ['trophy', 'win', 'award', 'champion', 'winner'],
    '🥇': ['medal', 'gold', 'first', 'winner'],

    // Real Estate & Property
    '🏠': ['home', 'house', 'property', 'building', 'residential'],
    '🏡': ['home', 'house', 'property', 'residential', 'garden'],
    '🏢': ['office', 'building', 'work', 'business', 'commercial'],
    '🏘️': ['houses', 'neighborhood', 'community', 'residential'],
    '🏗️': ['construction', 'building', 'development', 'crane'],
    '🏭': ['factory', 'industrial', 'building'],
    '🔑': ['key', 'lock', 'unlock', 'access', 'property'],
    '📍': ['pin', 'location', 'place', 'marker', 'map'],

    // Money & Finance
    '💰': ['money', 'cash', 'dollar', 'wealth', 'bag'],
    '💵': ['money', 'cash', 'dollar', 'bill'],
    '💸': ['money', 'cash', 'flying', 'spend', 'payment'],
    '💳': ['card', 'credit', 'payment'],
    '💎': ['diamond', 'gem', 'jewel', 'precious', 'valuable'],

    // Charts & Data
    '📈': ['chart', 'graph', 'up', 'increase', 'growth', 'trending', 'rise'],
    '📉': ['chart', 'graph', 'down', 'decrease', 'decline', 'fall'],
    '📊': ['chart', 'graph', 'bar', 'data', 'stats', 'analytics'],

    // Alert & Warning
    '⚠️': ['warning', 'caution', 'alert', 'attention'],
    '🚨': ['alert', 'siren', 'emergency', 'police'],
    '🔥': ['fire', 'hot', 'burn', 'flame', 'lit', 'trending'],
    '⚡': ['lightning', 'zap', 'electric', 'fast', 'bolt', 'power'],

    // Celebration
    '🎉': ['party', 'celebrate', 'celebration', 'tada', 'confetti'],
    '🎊': ['party', 'celebrate', 'confetti', 'ball'],
    '🎈': ['balloon', 'party', 'celebrate'],
    '🎁': ['gift', 'present', 'wrapped', 'box'],

    // Tools & Objects
    '🔍': ['search', 'find', 'magnify', 'look', 'zoom'],
    '📱': ['phone', 'mobile', 'cell', 'iphone', 'smartphone'],
    '💻': ['computer', 'laptop', 'pc', 'mac'],
    '📧': ['email', 'mail', 'message'],
    '📝': ['note', 'memo', 'write', 'document'],
    '📅': ['calendar', 'date', 'schedule'],
    '⏰': ['clock', 'alarm', 'time'],
    '🔔': ['bell', 'notification', 'alert', 'ring'],

    // Time
    '🕐': ['clock', 'time', 'one', 'hour'],
    '☀️': ['sun', 'sunny', 'bright', 'day'],
    '🌙': ['moon', 'night', 'crescent'],
    '⭐': ['star', 'favorite', 'bookmark'],
    '🌟': ['star', 'sparkle', 'shiny', 'glitter'],
    '✨': ['sparkle', 'shine', 'glitter', 'stars', 'magic'],

    // Transportation
    '🚀': ['rocket', 'launch', 'space', 'fast', 'startup'],
    '✈️': ['plane', 'airplane', 'flight', 'travel'],
    '🚗': ['car', 'auto', 'vehicle'],
    '🚕': ['taxi', 'cab'],

    // Food & Drink
    '🍕': ['pizza', 'food', 'slice'],
    '🍔': ['burger', 'hamburger', 'food'],
    '🍟': ['fries', 'french', 'food'],
    '☕': ['coffee', 'cafe', 'espresso', 'drink'],
    '🍺': ['beer', 'drink', 'alcohol'],

    // Nature
    '🌍': ['earth', 'world', 'globe', 'planet'],
    '🌏': ['earth', 'asia', 'world', 'globe'],
    '🌎': ['earth', 'americas', 'world', 'globe'],
    '🗺️': ['map', 'world', 'geography'],
    '🧭': ['compass', 'direction', 'navigation'],
    '🌈': ['rainbow', 'colors', 'pride'],
    '🌸': ['flower', 'blossom', 'cherry'],
    '🌹': ['rose', 'flower', 'red'],
    '🌻': ['sunflower', 'flower'],
    '🌊': ['wave', 'ocean', 'sea', 'water'],

    // Animals
    '🐶': ['dog', 'puppy', 'pet'],
    '🐱': ['cat', 'kitty', 'pet'],
    '🐭': ['mouse', 'rat'],
    '🐹': ['hamster', 'pet'],
    '🐰': ['rabbit', 'bunny'],
    '🦊': ['fox'],
    '🐻': ['bear'],
    '🐼': ['panda', 'bear'],
    '🦁': ['lion', 'king'],
    '🦄': ['unicorn', 'magic'],
    '🐝': ['bee', 'honey'],
    '🦋': ['butterfly'],

    // Sports & Activity
    '⚽': ['soccer', 'football', 'ball', 'sport'],
    '🏀': ['basketball', 'ball', 'sport'],
    '🎾': ['tennis', 'ball', 'sport'],
    '🎯': ['target', 'goal', 'aim', 'bullseye'],
    '🎮': ['game', 'gaming', 'controller', 'video game'],
    '🎵': ['music', 'note', 'song'],
    '🎸': ['guitar', 'music', 'rock'],
    '🎬': ['movie', 'film', 'cinema'],
    '📷': ['camera', 'photo', 'picture'],

    // Education
    '🎓': ['graduation', 'cap', 'education', 'school'],
    '📚': ['books', 'library', 'study', 'read'],
    '📖': ['book', 'read', 'open'],
};

/**
 * Search for emojis by keyword with intelligent matching
 * Uses exact word matching and relevance scoring
 */
export function searchEmojisByKeyword(query: string, allEmojis: string[]): string[] {
    if (!query.trim()) return allEmojis;

    const lowerQuery = query.toLowerCase().trim();
    const results: Array<{ emoji: string; score: number }> = [];

    // Search through keywords
    Object.entries(EMOJI_KEYWORDS).forEach(([emoji, keywords]) => {
        if (!allEmojis.includes(emoji)) return;

        let score = 0;

        keywords.forEach(keyword => {
            // Exact match - highest priority
            if (keyword === lowerQuery) {
                score += 100;
            }
            // Starts with query - high priority
            else if (keyword.startsWith(lowerQuery)) {
                score += 50;
            }
            // Query starts with keyword - medium priority (for multi-word searches)
            else if (lowerQuery.startsWith(keyword)) {
                score += 25;
            }
        });

        if (score > 0) {
            results.push({ emoji, score });
        }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results.map(r => r.emoji);
}


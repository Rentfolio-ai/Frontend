const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
let baseUrl = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
}
if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
}
const API_BASE = baseUrl;
const API_KEY = import.meta.env.VITE_CIVITAS_API_KEY || '';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
});

/**
 * Submits user feedback (thumbs up/down) for a specific message.
 * @param threadId The conversation thread ID
 * @param messageId The message ID being rated
 * @param score 1 for upvote, -1 for downvote
 * @param comment Optional text comment
 */
export const submitFeedback = async (
    threadId: string,
    messageId: string,
    score: number,
    comment?: string
): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                thread_id: threadId,
                message_id: messageId,
                score,
                comment
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit feedback: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        // Be silent about errors to not disrupt user experience, but log to console
    }
};

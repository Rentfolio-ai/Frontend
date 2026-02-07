import { API_BASE_URL, jsonHeaders } from './apiConfig';

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
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: jsonHeaders(),
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

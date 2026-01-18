/**
 * Production-grade SSE (Server-Sent Events) parser.
 * 
 * Features:
 * - Handles partial frames across chunk boundaries
 * - Parses id, event, and data fields
 * - Supports multi-line data
 * - Robust error handling
 * - Comment filtering (heartbeats)
 */

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  raw: string;
}

export class SSEParser {
  private buffer: string = '';
  
  /**
   * Parse a chunk of SSE data.
   * Handles partial frames and yields complete messages.
   * 
   * @param chunk - Raw text chunk from stream
   * @returns Array of complete SSE messages
   */
  parse(chunk: string): SSEMessage[] {
    this.buffer += chunk;
    const messages: SSEMessage[] = [];
    
    // Split by double newline (message separator)
    const parts = this.buffer.split('\n\n');
    
    // Keep last part in buffer (might be incomplete)
    this.buffer = parts.pop() || '';
    
    // Process complete messages
    for (const part of parts) {
      if (!part.trim()) continue;
      
      const message = this.parseMessage(part);
      if (message) {
        messages.push(message);
      }
    }
    
    return messages;
  }
  
  /**
   * Parse a single SSE message.
   * 
   * @param raw - Raw message text
   * @returns Parsed SSE message or null
   */
  private parseMessage(raw: string): SSEMessage | null {
    const lines = raw.split('\n');
    const message: Partial<SSEMessage> = { raw };
    const dataLines: string[] = [];
    
    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;
      
      // Skip comments (heartbeats)
      if (line.startsWith(':')) continue;
      
      // Parse field
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const field = line.substring(0, colonIndex);
      let value = line.substring(colonIndex + 1);
      
      // Remove leading space from value (SSE spec)
      if (value.startsWith(' ')) {
        value = value.substring(1);
      }
      
      switch (field) {
        case 'id':
          message.id = value;
          break;
        case 'event':
          message.event = value;
          break;
        case 'data':
          dataLines.push(value);
          break;
      }
    }
    
    // Combine multi-line data
    if (dataLines.length > 0) {
      message.data = dataLines.join('\n');
      return message as SSEMessage;
    }
    
    return null;
  }
  
  /**
   * Flush any remaining buffered data.
   * Call this when stream ends.
   * 
   * @returns Final message if buffer contains one
   */
  flush(): SSEMessage | null {
    if (!this.buffer.trim()) return null;
    
    const message = this.parseMessage(this.buffer);
    this.buffer = '';
    return message;
  }
  
  /**
   * Reset parser state.
   */
  reset(): void {
    this.buffer = '';
  }
}

/**
 * Parse SSE data field as JSON.
 * 
 * @param data - SSE data string
 * @returns Parsed JSON object or null
 */
export function parseSSEData<T = any>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn('[SSE] Failed to parse data as JSON:', data);
    return null;
  }
}

/**
 * Create an SSE event stream from a fetch Response.
 * Handles chunked reading and parsing.
 * 
 * @param response - Fetch Response object
 * @param onMessage - Callback for each parsed message
 * @param onError - Error callback
 * @returns Cleanup function
 */
export async function createSSEStream(
  response: Response,
  onMessage: (message: SSEMessage) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const parser = new SSEParser();
  
  if (!reader) {
    throw new Error('Response body is not readable');
  }
  
  let cancelled = false;
  
  // Start reading
  (async () => {
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Flush any remaining data
          const finalMessage = parser.flush();
          if (finalMessage) {
            onMessage(finalMessage);
          }
          break;
        }
        
        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse messages
        const messages = parser.parse(chunk);
        
        // Emit messages
        for (const message of messages) {
          onMessage(message);
        }
      }
    } catch (error) {
      if (!cancelled) {
        onError?.(error as Error);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  
  // Return cleanup function
  return () => {
    cancelled = true;
    reader.cancel();
  };
}

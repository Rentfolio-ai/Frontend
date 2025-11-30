/**
 * Strip markdown formatting symbols from text
 * Returns clean plain text that looks human-like and natural
 * Preserves line breaks and spacing for readability
 */
export function stripMarkdown(text: string): string {
  if (!text) return text;

  // Remove code blocks first (```text```) - replace with just the content
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    // Extract content between ```
    const content = match.replace(/```/g, '').trim();
    return content;
  });

  // Remove inline code (`text`) - keep the text
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove links - convert [text](url) to just "text"
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove image syntax ![alt](url) - keep alt text if present
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove bold markers (**text** or __text__)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');

  // Remove italic markers (*text* or _text_) - careful with bold overlap
  text = text.replace(/(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)/g, '$1');
  text = text.replace(/(?<!_)_(?!_)([^_\n]+?)_(?!_)/g, '$1');

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove header markers (# ## ### etc.) - keep the text, just remove #
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // Remove blockquotes (> text) - convert to regular text
  text = text.replace(/^>\s+(.+)$/gm, '$1');

  // Clean up list markers (-, *, +, 1.) - convert to natural text
  // For unordered lists, remove the marker but keep indentation
  text = text.replace(/^[\s]*[-*+]\s+(.+)$/gm, '$1');
  // For ordered lists, remove the number but keep the text
  text = text.replace(/^[\s]*\d+\.\s+(.+)$/gm, '$1');

  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[-*_]{3,}$/gm, '');

  // Clean up excessive blank lines (more than 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim each line to remove trailing spaces
  text = text.split('\n').map(line => line.trimEnd()).join('\n');

  // Remove leading/trailing whitespace
  text = text.trim();

  return text;
}

/**
 * Strip markdown formatting symbols from text
 * Returns clean plain text with only emojis and line breaks
 */
export function stripMarkdown(text: string): string {
  if (!text) return text;

  // Remove bold markers (**text** or __text__)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');

  // Remove italic markers (*text* or _text_)
  // Use negative lookahead/lookbehind to avoid matching ** from bold
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1');
  text = text.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '$1');

  // Remove header markers (# ## ### etc.)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove code blocks (```text```)
  text = text.replace(/```[^`]*```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');

  return text;
}

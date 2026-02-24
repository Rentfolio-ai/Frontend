/**
 * Extracts <!--draft_email:{...}--> and <!--draft_text:{...}--> blocks
 * from AI response text, returning clean content and ToolCard objects.
 *
 * Includes a fallback heuristic: if no structured blocks are found but the
 * text contains a "Subject:" line and letter-style body, it wraps the
 * content into a draft email card automatically.
 */

import type { ToolCard } from '../types/chat';

const DRAFT_PATTERN = /<!--draft_(email|text):([\s\S]*?)-->/g;

const SUBJECT_RE = /(?:^|\n)\s*\*{0,2}Subject\*{0,2}\s*:\s*(.+)/i;
const GREETING_RE = /(?:^|\n)((?:Dear|Hi|Hello|Hey)\s+[^\n,]+)/i;

interface ParseResult {
  cleanContent: string;
  draftTools: ToolCard[];
}

export function parseDraftBlocks(content: string): ParseResult {
  const draftTools: ToolCard[] = [];
  const seen = new Set<string>();

  DRAFT_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DRAFT_PATTERN.exec(content)) !== null) {
    const type = match[1];
    const jsonStr = match[2].trim();

    try {
      const data = JSON.parse(jsonStr);
      const kind = type === 'email' ? 'send_email' : 'send_text';
      const key = `${kind}:${data.professional_id || 'manual'}:${data.to_email || data.to_phone || ''}`;

      if (seen.has(key)) continue;
      seen.add(key);

      draftTools.push({
        id: `draft-${kind}-${Date.now()}-${draftTools.length}`,
        title: type === 'email'
          ? `Email to ${data.professional_name || 'Recipient'}`
          : `Text to ${data.professional_name || 'Recipient'}`,
        description: type === 'email' ? data.subject || '' : (data.body || '').slice(0, 80),
        status: 'completed',
        kind: kind as ToolCard['kind'],
        data: { ...data, tool_type: kind },
      });
    } catch {
      // Malformed JSON — skip
    }
  }

  if (draftTools.length > 0) {
    const cleanContent = content.replace(DRAFT_PATTERN, '').trim();
    return { cleanContent, draftTools };
  }

  // Fallback: detect plain-text emails the LLM wrote without structured blocks
  const subjectMatch = SUBJECT_RE.exec(content);
  if (subjectMatch) {
    const subject = subjectMatch[1].trim().replace(/\*+/g, '');
    const bodyStart = (subjectMatch.index ?? 0) + subjectMatch[0].length;
    let bodyText = content.slice(bodyStart).trim();

    // Strip markdown horizontal rules
    bodyText = bodyText.replace(/^[\-*]{3,}\s*$/gm, '').trim();
    // Strip bold/italic markers
    bodyText = bodyText.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');

    if (bodyText.length >= 20) {
      let recipientName = 'Recipient';
      const greetingMatch = GREETING_RE.exec(bodyText);
      if (greetingMatch) {
        const raw = greetingMatch[1].trim().replace(/^(Dear|Hi|Hello|Hey)\s+/i, '').replace(/,\s*$/, '');
        if (raw.length > 0 && raw.length < 60 && !raw.startsWith('[')) {
          recipientName = raw;
        }
      }

      draftTools.push({
        id: `draft-send_email-${Date.now()}-0`,
        title: `Email to ${recipientName}`,
        description: subject,
        status: 'completed',
        kind: 'send_email' as ToolCard['kind'],
        data: {
          professional_name: recipientName,
          professional_id: 'manual',
          to_email: '',
          subject,
          subject_variants: [],
          body: bodyText,
          tone: 'warm_professional',
          length: 'short',
          tool_type: 'send_email',
        },
      });

      const prefix = content.slice(0, subjectMatch.index ?? 0).trim();
      const cleanContent = prefix
        ? `${prefix}\n\nHere's your email draft — you can edit any field before sending.`
        : "Here's your email draft — you can edit any field before sending.";
      return { cleanContent, draftTools };
    }
  }

  return { cleanContent: content, draftTools: [] };
}

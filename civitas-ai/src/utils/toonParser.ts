/**
 * Utility for parsing TOON (Token-Oriented Object Notation) on the frontend.
 * Optimized for partial parsing during streaming and converting indentation to nested objects.
 */

export function parseToon(text: string): Record<string, any> {
    const lines = text.split('\n');
    const result: Record<string, any> = {};
    const stack: { indent: number; obj: Record<string, any> }[] = [{ indent: -1, obj: result }];

    for (let line of lines) {
        if (!line.trim()) continue;

        const indent = line.search(/\S/);
        const content = line.trim();

        // Handle indentation levels
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        const currentObj = stack[stack.length - 1].obj;

        if (content.includes(':')) {
            const firstColon = content.indexOf(':');
            const key = content.slice(0, firstColon).trim();
            let value: any = content.slice(firstColon + 1).trim();

            // Basic type conversion
            if (value.toLowerCase() === 'true') value = true;
            else if (value.toLowerCase() === 'false') value = false;
            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            else if (value === '') {
                // Nested object start
                const newObj = {};
                currentObj[key] = newObj;
                stack.push({ indent, obj: newObj });
                continue;
            }

            // Handle simple lists if they look like strings with dashes (very basic)
            if (typeof value === 'string' && value.startsWith('- ')) {
                if (!Array.isArray(currentObj[key])) {
                    currentObj[key] = [];
                }
                currentObj[key].push(value.slice(2).trim());
            } else {
                currentObj[key] = value;
            }
        } else if (content.startsWith('- ')) {
            // Handle array items if they don't have colons
            const lastKey = Object.keys(currentObj).pop();
            if (lastKey) {
                if (!Array.isArray(currentObj[lastKey])) {
                    currentObj[lastKey] = [];
                }
                currentObj[lastKey].push(content.slice(2).trim());
            }
        }
    }

    return result;
}

/**
 * Cleanly extracts TOON blocks from markdown content
 */
export function extractToonBlocks(text: string): { cleanContent: string; toonData: Record<string, any> } {
    const toonRegex = /```toon\s*([\s\S]*?)```/g;
    let cleanContent = text;
    let toonData: Record<string, any> = {};

    let match;
    while ((match = toonRegex.exec(text)) !== null) {
        const rawToon = match[1];
        const parsed = parseToon(rawToon);
        toonData = { ...toonData, ...parsed };
        // Remove the block from the content shown to user
        cleanContent = cleanContent.replace(match[0], '');
    }

    return { cleanContent: cleanContent.trim(), toonData };
}

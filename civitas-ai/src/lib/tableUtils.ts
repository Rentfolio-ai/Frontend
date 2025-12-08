/**
 * Utility functions for handling Markdown tables and CSV export
 */

/**
 * Parses markdown text and extracts the first table found.
 * Returns the markdown table string or null if no table is found.
 */
export const extractFirstTable = (markdown: string): string | null => {
    // Regex to match a markdown table
    // Looks for lines starting with | and containing |
    // Must have a header separator row like |---|---|
    const lines = markdown.split('\n');
    let tableLines: string[] = [];
    let insideTable = false;
    let separatorFound = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('|') && line.endsWith('|')) {
            // Potential table line
            if (!insideTable) {
                // Check if next line is a separator to confirm start of table
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.startsWith('|') && nextLine.includes('---')) {
                        insideTable = true;
                        tableLines.push(line);
                        continue;
                    }
                }
            }

            if (insideTable) {
                tableLines.push(line);
                if (line.includes('---')) separatorFound = true;
            }
        } else if (insideTable) {
            // End of table
            break;
        }
    }

    if (tableLines.length > 2 && separatorFound) {
        return tableLines.join('\n');
    }

    return null;
};

/**
 * Converts a markdown table string to CSV format.
 */
export const markdownTableToCsv = (tableMarkdown: string): string => {
    const lines = tableMarkdown.trim().split('\n');

    // Filter out separator line (containing ---)
    const dataLines = lines.filter(line => !line.includes('---')); // Simple check, could be more robust

    const csvRows = dataLines.map(line => {
        // Remove leading/trailing pipes
        const rawContent = line.replace(/^\||\|$/g, '');

        // Split by pipe
        const cells = rawContent.split('|').map(cell => {
            const trimmed = cell.trim();
            // Escape quotes by doubling them
            const escaped = trimmed.replace(/"/g, '""');
            // Wrap in quotes if it contains comma, quote, or newline
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
                return `"${escaped}"`;
            }
            return escaped;
        });

        return cells.join(',');
    });

    return csvRows.join('\n');
};

/**
 * Triggers a download of string content as a CSV file.
 */
export const downloadCsv = (content: string, filename: string = 'export.csv') => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if ((navigator as any).msSaveBlob) { // IE 10+
        (navigator as any).msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Command Palette Types
 */

export type CommandCategory = 'action' | 'navigation' | 'preference' | 'help';

export interface Command {
    id: string;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    category: CommandCategory;
    keywords: string[];
    shortcut?: string;
    action: () => void | Promise<void>;
}

export interface CommandGroup {
    category: CommandCategory;
    label: string;
    commands: Command[];
}

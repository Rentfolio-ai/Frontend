// FILE: src/components/chat/EmojiPicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Smile, Search, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { searchEmojisByKeyword } from './emojiKeywords';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

// Organized emoji categories like iMessage
const EMOJI_CATEGORIES = {
    'Smileys & People': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
        '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
        '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶',
        '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
        '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳',
        '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
        '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
        '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
        '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
        '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾', '🦿', '🦵', '🦶',
    ],
    'Animals & Nature': [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
        '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
        '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
        '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖',
        '🌸', '💐', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴',
        '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌙', '⭐', '🌟', '✨',
    ],
    'Food & Drink': [
        '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭',
        '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕',
        '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳',
        '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
        '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣',
        '☕', '🧃', '🥤', '🧋', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻',
    ],
    'Activities': [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓',
        '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
        '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂',
        '🎯', '🎲', '🎰', '🎮', '🎳', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼',
    ],
    'Travel & Places': [
        '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬',
        '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩', '🕋',
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛',
        '🚜', '🛻', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔',
        '✈️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰', '🚀', '🛸',
    ],
    'Objects': [
        '⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽',
        '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️',
        '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏰', '⏱', '⏲', '⏳',
        '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰',
        '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩',
    ],
    'Symbols': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
        '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
        '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
        '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
        '✅', '☑️', '✔️', '✖️', '❌', '❎', '➕', '➖', '➗', '➰', '➿', '〽️',
        '✳️', '✴️', '❇️', '©️', '®️', '™️', '🔟', '💯', '🔠', '🔡', '🔢', '🔣',
    ],
};

const FREQUENT_EMOJIS_KEY = 'emoji_picker_recent';

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Smileys & People');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Load recent emojis from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(FREQUENT_EMOJIS_KEY);
        if (stored) {
            try {
                setRecentEmojis(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse recent emojis', e);
            }
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);

        // Update recent emojis
        const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 30);
        setRecentEmojis(updated);
        localStorage.setItem(FREQUENT_EMOJIS_KEY, JSON.stringify(updated));
    };

    const getFilteredEmojis = () => {
        if (searchQuery) {
            // Use keyword search for intelligent filtering
            const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
            return searchEmojisByKeyword(searchQuery, allEmojis);
        }

        if (selectedCategory === 'Recent' && recentEmojis.length > 0) {
            return recentEmojis;
        }

        return EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];
    };

    const categories = recentEmojis.length > 0
        ? ['Recent', ...Object.keys(EMOJI_CATEGORIES)]
        : Object.keys(EMOJI_CATEGORIES);

    const categoryIcons: Record<string, string> = {
        'Recent': '🕐',
        'Smileys & People': '😀',
        'Animals & Nature': '🐶',
        'Food & Drink': '🍎',
        'Activities': '⚽',
        'Travel & Places': '✈️',
        'Objects': '💡',
        'Symbols': '❤️',
    };

    if (!isOpen) return null;

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 left-0 w-[340px] h-[380px] bg-[#1A1D24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            {/* Search Bar */}
            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search emoji..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto custom-scrollbar">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setSelectedCategory(category);
                            setSearchQuery('');
                        }}
                        className={cn(
                            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-white/10",
                            selectedCategory === category
                                ? "bg-blue-500/20 ring-2 ring-blue-500/50"
                                : "bg-white/5"
                        )}
                        title={category}
                    >
                        {categoryIcons[category] || '📌'}
                    </button>
                ))}
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-8 gap-1">
                    {getFilteredEmojis().map((emoji, index) => (
                        <button
                            key={`${emoji}-${index}`}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                {getFilteredEmojis().length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
                        <Smile className="w-8 h-8 mb-2 opacity-50" />
                        <p>No emojis found</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Recently used</span>
                </div>
                <span>{getFilteredEmojis().length} emojis</span>
            </div>
        </div>
    );
};

// FILE: src/components/desktop-shell/DesktopSidebarMenu.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import type { ChatSession, TabType } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';
import { formatChatDateCompact } from '../../utils/dateFormatters';
import type { BookmarkedProperty } from '../../types/bookmarks';

interface DesktopSidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  activeChatId: string;
  activeTab: TabType;
  currentTheme: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  menuItems: Array<{ id: TabType; label: string; icon: string }>;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onTabChange: (tab: TabType) => void;
  bookmarks?: BookmarkedProperty[];
  onRemoveBookmark?: (bookmarkId: string) => void;
  onBookmarkClick?: (bookmark: BookmarkedProperty) => void;
  onPinChat?: (chatId: string, e: React.MouseEvent) => void;
  onArchiveChat?: (chatId: string, e: React.MouseEvent) => void;
}

export const DesktopSidebarMenu: React.FC<DesktopSidebarMenuProps> = ({
  isOpen,
  onClose,
  chatHistory,
  activeChatId,
  activeTab,
  menuItems,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onTabChange,
  bookmarks = [],
  onRemoveBookmark,
  onBookmarkClick,
  onPinChat,
  onArchiveChat,
}) => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllChats, setShowAllChats] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Filter chat history based on search query
  const filteredChatHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return chatHistory;
    }
    const query = searchQuery.toLowerCase().trim();
    if (!query) return chatHistory;

    return chatHistory.filter(chat => {
      // Search in title
      if (chat.title?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in chat ID (sometimes useful)
      if (chat.id?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in messages
      if (chat.messages && Array.isArray(chat.messages)) {
        return chat.messages.some(msg => {
          if (!msg) return false;

          // Handle different message formats
          let content = '';
          if (typeof msg === 'string') {
            content = msg;
          } else if (typeof msg === 'object') {
            // Handle Message type - only use 'content' property which exists on Message type
            content = (msg as any).content || '';
          }

          return typeof content === 'string' && content.toLowerCase().includes(query);
        });
      }

      return false;
    });
  }, [chatHistory, searchQuery]);

  // Auto-expand chats section when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredChatHistory.length > 0) {
      setShowAllChats(true);
    }
  }, [searchQuery, filteredChatHistory.length]);

  // Display chats (limited or all based on showAllChats)
  // Categorize chats
  const { pinnedChats, recentChats, archivedChats } = useMemo(() => {
    const pinned: ChatSession[] = [];
    const recent: ChatSession[] = [];
    const archived: ChatSession[] = [];

    filteredChatHistory.forEach(chat => {
      if (chat.isArchived) {
        archived.push(chat);
      } else if (chat.isPinned) {
        pinned.push(chat);
      } else {
        recent.push(chat);
      }
    });

    return { pinnedChats: pinned, recentChats: recent, archivedChats: archived };
  }, [filteredChatHistory]);

  // Display chats (limited or all based on showAllChats)
  // Logic: filteredChatHistory contains ALL, but we want to display categorized.
  // "Your Chats" usually implies active (pinned + recent).
  // "Archived Code" usually implies archived.

  // When searching, we ignore categories and show all matches.
  const isSearching = !!searchQuery.trim();

  const displayedRecentChats = showAllChats ? recentChats : recentChats.slice(0, 8);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 z-50 flex flex-col bg-surface border-r border-white/[0.06]"
          >
            {/* Header with Logo and Minimize */}
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-to flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">ProphetAtlas</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  aria-label="Close sidebar"
                >
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* New Chat Button */}
              <button
                onClick={() => {
                  onNewChat();
                  onTabChange('chat');
                  onClose();
                }}
                className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Search Chats */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Allow Escape to clear search
                      if (e.key === 'Escape') {
                        setSearchQuery('');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Main Navigation */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.02 }}
                      onClick={() => {
                        onTabChange(item.id);
                        onClose();
                      }}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-all duration-200 ${activeTab === item.id
                        ? 'bg-white/[0.08]'
                        : 'hover:bg-white/[0.04]'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className={`text-sm font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70'
                        }`}>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bookmarks Section */}
              {bookmarks.length > 0 && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <button
                    onClick={() => setShowBookmarks(!showBookmarks)}
                    className="w-full flex items-center justify-between px-1 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        Bookmarks
                      </h3>
                    </div>
                    <svg
                      className={`w-4 h-4 text-white/40 transition-transform ${showBookmarks ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showBookmarks && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-1 max-h-96 overflow-y-auto chat-scroll"
                      >
                        {bookmarks.map((bookmark, index) => (
                          <motion.button
                            key={bookmark.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => {
                              if (onBookmarkClick) {
                                onBookmarkClick(bookmark);
                                onTabChange('chat');
                                onClose();
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-all duration-200 group hover:bg-white/[0.04] border border-transparent"
                          >
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium truncate text-white/80">
                                {bookmark.displayName || bookmark.property.address}
                              </p>
                              {bookmark.property.price && (
                                <p className="text-[11px] text-white/40 truncate">
                                  ${bookmark.property.price.toLocaleString()}
                                  {bookmark.property.city && ` • ${bookmark.property.city}`}
                                </p>
                              )}
                            </div>
                            {onRemoveBookmark && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveBookmark(bookmark.id);
                                }}
                                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.08] transition-all"
                                aria-label="Remove bookmark"
                              >
                                <svg className="w-3.5 h-3.5 text-white/40 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recent Bookmarks (when collapsed) */}
                  {!showBookmarks && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto chat-scroll">
                      {bookmarks.slice(0, 3).map((bookmark, index) => (
                        <motion.button
                          key={bookmark.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => {
                            if (onBookmarkClick) {
                              onBookmarkClick(bookmark);
                              onTabChange('chat');
                              onClose();
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 group hover:bg-white/[0.04] border border-transparent"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate text-white/80">
                              {bookmark.displayName || bookmark.property.address}
                            </p>
                            {bookmark.property.price && (
                              <p className="text-[11px] text-white/40 truncate">
                                ${bookmark.property.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      ))}
                      {bookmarks.length > 3 && (
                        <button
                          onClick={() => setShowBookmarks(true)}
                          className="w-full px-3 py-2 text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          Show {bookmarks.length - 3} more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Pinned Chats Section */}
              {!isSearching && pinnedChats.length > 0 && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
                    Pinned
                  </h3>
                  <div className="space-y-1">
                    {pinnedChats.map((chat, index) => (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          onLoadChat(chat.id);
                          onClose();
                        }}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-all duration-200 group ${activeChatId === chat.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'hover:bg-white/[0.04] border border-transparent'
                          }`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-primary' : 'text-white/80'
                            }`}>
                            {chat.title || 'Untitled Chat'}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">
                            {formatChatDateCompact(chat.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {onPinChat && (
                            <button
                              onClick={(e) => onPinChat(chat.id, e)}
                              className="p-1.5 rounded-md hover:bg-white/[0.08]"
                              title="Unpin chat"
                            >
                              <Pin className="w-3.5 h-3.5 text-primary fill-current" />
                            </button>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Chats Section */}
              {(recentChats.length > 0 || isSearching) && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <button
                    onClick={() => setShowAllChats(!showAllChats)}
                    className="w-full flex items-center justify-between px-1 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      {isSearching ? 'Search Results' : 'Your chats'}
                    </h3>
                    {recentChats.length > 0 && !isSearching && (
                      <svg
                        className={`w-4 h-4 text-white/40 transition-transform ${showAllChats ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  <AnimatePresence>
                    {(showAllChats || isSearching) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-1 max-h-96 overflow-y-auto chat-scroll"
                      >
                        {(isSearching ? filteredChatHistory : displayedRecentChats).length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-sm text-white/40">
                              {isSearching ? 'No chats found' : 'No chats yet'}
                            </p>
                            {isSearching && (
                              <p className="text-xs text-white/30 mt-1">
                                Try a different search term
                              </p>
                            )}
                          </div>
                        ) : (
                          (isSearching ? filteredChatHistory : displayedRecentChats).map((chat, index) => (
                            <motion.button
                              key={chat.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              onClick={() => {
                                onLoadChat(chat.id);
                                onClose();
                              }}
                              className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-all duration-200 group ${activeChatId === chat.id
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-white/[0.04] border border-transparent'
                                }`}
                            >
                              <div className="flex-1 min-w-0 text-left">
                                <p className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-primary' : 'text-white/80'
                                  }`}>
                                  {chat.title || 'Untitled Chat'}
                                </p>
                                <p className="text-[11px] text-white/40 truncate">
                                  {formatChatDateCompact(chat.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onPinChat && !chat.isArchived && (
                                  <button
                                    onClick={(e) => onPinChat(chat.id, e)}
                                    className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                    title="Pin chat"
                                  >
                                    <Pin className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                                  </button>
                                )}
                                {onArchiveChat && (
                                  <button
                                    onClick={(e) => onArchiveChat(chat.id, e)}
                                    className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                    title={chat.isArchived ? "Unarchive" : "Archive"}
                                  >
                                    {chat.isArchived ? (
                                      <ArchiveRestore className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                                    ) : (
                                      <Archive className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => onDeleteChat(chat.id, e)}
                                  className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                  aria-label="Delete chat"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                                </button>
                              </div>
                            </motion.button>
                          ))
                        )}
                        {recentChats.length > 8 && !showAllChats && !isSearching && (
                          <button
                            onClick={() => setShowAllChats(true)}
                            className="w-full px-3 py-2 text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-colors"
                          >
                            Show {recentChats.length - 8} more
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recent Chats (collapsed state) */}
                  {!showAllChats && !isSearching && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto chat-scroll">
                      {displayedRecentChats.length === 0 && (
                        <div className="py-6 text-center">
                          <p className="text-sm text-white/40">No chats yet</p>
                        </div>
                      )}

                      {displayedRecentChats.map((chat, index) => (
                        <motion.button
                          key={chat.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => {
                            onLoadChat(chat.id);
                            onClose();
                          }}
                          className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-all duration-200 group ${activeChatId === chat.id
                            ? 'bg-primary/20 border border-primary/30'
                            : 'hover:bg-white/[0.04] border border-transparent'
                            }`}
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-primary' : 'text-white/80'
                              }`}>
                              {chat.title || 'Untitled Chat'}
                            </p>
                            <p className="text-[11px] text-white/40 truncate">
                              {formatChatDateCompact(chat.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {!chat.isArchived && (
                              <button
                                onClick={(e) => onPinChat?.(chat.id, e)}
                                className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                title="Pin chat"
                              >
                                <Pin className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                              </button>
                            )}
                            <button
                              onClick={(e) => onArchiveChat?.(chat.id, e)}
                              className="p-1.5 rounded-md hover:bg-white/[0.08]"
                              title="Archive"
                            >
                              <Archive className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                            </button>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Archived Chats Section */}
              {!isSearching && archivedChats.length > 0 && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="w-full flex items-center justify-between px-1 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Archived Chats
                    </h3>
                    <svg
                      className={`w-4 h-4 text-white/40 transition-transform ${showArchived ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showArchived && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-1 max-h-96 overflow-y-auto chat-scroll"
                      >
                        {archivedChats.map((chat, index) => (
                          <motion.button
                            key={chat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => {
                              onLoadChat(chat.id);
                              onClose();
                            }}
                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-all duration-200 group ${activeChatId === chat.id
                              ? 'bg-white/[0.08]'
                              : 'hover:bg-white/[0.04] border border-transparent'
                              }`}
                          >
                            <div className="flex-1 min-w-0 text-left opacity-60">
                              <p className="text-sm font-medium truncate text-white/80">
                                {chat.title || 'Untitled Chat'}
                              </p>
                              <p className="text-[11px] text-white/40 truncate">
                                {formatChatDateCompact(chat.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => onArchiveChat?.(chat.id, e)}
                                className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                title="Unarchive"
                              >
                                <ArchiveRestore className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                              </button>
                              <button
                                onClick={(e) => onDeleteChat(chat.id, e)}
                                className="p-1.5 rounded-md hover:bg-white/[0.08]"
                                aria-label="Delete chat"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                              </button>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/[0.06]">
              <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-to flex items-center justify-center font-bold text-white text-sm">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-white/40 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium text-red-400">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

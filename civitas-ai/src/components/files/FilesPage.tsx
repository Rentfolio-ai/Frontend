/**
 * Files Page - Simplified File Management
 * Notion-inspired table view with user control
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
    Search, Upload, MoreVertical, Download, Edit2, Trash2, 
    MessageCircle, FileText, Image as ImageIcon, FileSpreadsheet,
    File, ArrowUp, ArrowDown, X, Loader2
} from 'lucide-react';
import { BiometricGate } from '../auth/BiometricGate';
import { getUserFiles, deleteFile, type UserFile } from '../../services/fileStorage';
import { cn } from '../../lib/utils';

type SortField = 'name' | 'size' | 'date' | 'source';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'pdf' | 'image' | 'spreadsheet' | 'document' | 'from_chat' | 'manual';

// Helper to get file icon
const getFileIcon = (fileName: string, fileType: string) => {
    const lower = fileName.toLowerCase();
    
    if (fileType.includes('pdf') || lower.endsWith('.pdf')) {
        return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/.test(lower)) {
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
    }
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || /\.(xlsx?|csv)$/.test(lower)) {
        return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    }
    if (fileType.includes('document') || fileType.includes('word') || /\.docx?$/.test(lower)) {
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
    
    return <File className="w-5 h-5 text-white/40" />;
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to format date
const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const FilesPage: React.FC = () => {
    const [files, setFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [renamingFile, setRenamingFile] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Fetch files
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const fetched = await getUserFiles();
                setFiles(fetched);
            } catch (err) {
                console.error('Failed to fetch files:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiles();
        
        // Refresh every 30s
        const interval = setInterval(fetchFiles, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter files
    const filteredFiles = files.filter(file => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches = 
                file.fileName.toLowerCase().includes(query) ||
                file.chatTitle?.toLowerCase().includes(query) ||
                file.conversationTopic?.toLowerCase().includes(query);
            if (!matches) return false;
        }
        
        // Type filter
        if (filter !== 'all') {
            const lower = file.fileName.toLowerCase();
            const type = file.fileType.toLowerCase();
            
            if (filter === 'pdf' && !type.includes('pdf') && !lower.endsWith('.pdf')) return false;
            if (filter === 'image' && !type.includes('image')) return false;
            if (filter === 'spreadsheet' && !type.includes('spreadsheet') && !type.includes('excel')) return false;
            if (filter === 'document' && !type.includes('document') && !type.includes('word')) return false;
            if (filter === 'from_chat' && !file.chatId) return false;
            if (filter === 'manual' && file.chatId) return false;
        }
        
        return true;
    });

    // Sort files
    const sortedFiles = [...filteredFiles].sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
            case 'name':
                comparison = a.fileName.localeCompare(b.fileName);
                break;
            case 'size':
                comparison = a.fileSize - b.fileSize;
                break;
            case 'date':
                comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
                break;
            case 'source':
                const aSource = a.chatTitle || 'Manual';
                const bSource = b.chatTitle || 'Manual';
                comparison = aSource.localeCompare(bSource);
                break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Handle delete
    const handleDelete = async (file: UserFile) => {
        try {
            await deleteFile(file.id, file.storagePath);
            setFiles(files.filter(f => f.id !== file.id));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    };

    // Handle download
    const handleDownload = (file: UserFile) => {
        window.open(file.downloadUrl, '_blank');
    };

    // Handle rename (placeholder - would need backend support)
    const handleRename = (file: UserFile) => {
        setRenamingFile(file.id);
        setNewFileName(file.fileName);
    };

    // Handle file upload
    const handleFileUpload = async (uploadedFiles: FileList | null) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return;
        
        setIsUploading(true);
        // TODO: Implement upload logic
        console.log('Upload:', uploadedFiles);
        
        setTimeout(() => {
            setIsUploading(false);
        }, 2000);
    };

    // Drag & drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e.dataTransfer.files);
    };

    // Calculate total size
    const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

    return (
        <BiometricGate>
            <div 
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="h-full bg-background flex flex-col p-6"
            >
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-semibold text-white/95">Your Documents</h1>
                            <p className="text-sm text-white/50 mt-1">All your files in one place</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
                        >
                            <Upload className="w-4 h-4" />
                            Upload File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-10 bg-white/[0.05] border border-white/[0.10] rounded-lg text-sm text-white/90 placeholder-white/40 focus:outline-none focus:border-white/[0.20] focus:ring-2 focus:ring-white/[0.10] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/[0.05] rounded transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        )}
                    </div>
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="h-10 px-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-sm text-white/90 focus:outline-none focus:border-white/[0.20] transition-all cursor-pointer"
                    >
                        <option value="all">All Files</option>
                        <option value="pdf">PDFs</option>
                        <option value="image">Images</option>
                        <option value="spreadsheet">Spreadsheets</option>
                        <option value="document">Documents</option>
                        <option value="from_chat">From Chat</option>
                        <option value="manual">Manual Uploads</option>
                    </select>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    </div>
                ) : sortedFiles.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {searchQuery || filter !== 'all' ? (
                            <>
                                <Search className="w-12 h-12 text-white/20 mb-4" />
                                <p className="text-white/60 mb-2">No files found</p>
                                <p className="text-white/40 text-sm">Try different search terms or filters</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-white/20 mb-4" />
                                <p className="text-white/60 mb-2">No files yet</p>
                                <p className="text-white/40 text-sm mb-4">Upload files or attach them in chat</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.10] transition-colors"
                                >
                                    Upload Your First File
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-white/[0.05]">
                            <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                            >
                                Name
                                {sortField === 'name' && (
                                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                )}
                            </button>
                            <button
                                onClick={() => handleSort('size')}
                                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                            >
                                Size
                                {sortField === 'size' && (
                                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                )}
                            </button>
                            <button
                                onClick={() => handleSort('date')}
                                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                            >
                                Uploaded
                                {sortField === 'date' && (
                                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                )}
                            </button>
                            <button
                                onClick={() => handleSort('source')}
                                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                            >
                                Source
                                {sortField === 'source' && (
                                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                )}
                            </button>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/50 text-right">Actions</span>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 overflow-y-auto">
                            {sortedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={cn(
                                        'grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-white/[0.05] transition-colors',
                                        'hover:bg-white/[0.03]'
                                    )}
                                >
                                    {/* Name */}
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="flex items-center gap-3 text-left min-w-0"
                                    >
                                        {getFileIcon(file.fileName, file.fileType)}
                                        <span className="text-sm text-white/90 truncate hover:text-white transition-colors">
                                            {file.fileName}
                                        </span>
                                    </button>

                                    {/* Size */}
                                    <div className="text-sm text-white/60 flex items-center">
                                        {formatFileSize(file.fileSize)}
                                    </div>

                                    {/* Date */}
                                    <div className="text-sm text-white/60 flex items-center">
                                        {formatDate(file.uploadedAt)}
                                    </div>

                                    {/* Source */}
                                    <div className="text-sm text-white/60 flex items-center truncate">
                                        {file.chatTitle || 'Manual'}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end">
                                        <div className="relative">
                                            <button
                                                onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
                                                className="p-1.5 hover:bg-white/[0.05] rounded transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4 text-white/60" />
                                            </button>

                                            {/* Context Menu */}
                                            {selectedFile === file.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setSelectedFile(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/[0.10] rounded-lg shadow-2xl z-20 overflow-hidden">
                                                        <button
                                                            onClick={() => {
                                                                handleDownload(file);
                                                                setSelectedFile(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleRename(file);
                                                                setSelectedFile(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Rename
                                                        </button>
                                                        {file.chatId && (
                                                            <button
                                                                onClick={() => {
                                                                    // TODO: Navigate to chat
                                                                    console.log('View in chat:', file.chatId);
                                                                    setSelectedFile(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                                View in Chat
                                                            </button>
                                                        )}
                                                        <div className="border-t border-white/[0.05]" />
                                                        <button
                                                            onClick={() => {
                                                                setShowDeleteConfirm(file.id);
                                                                setSelectedFile(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Stats */}
                {!isLoading && sortedFiles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                        <p className="text-sm text-white/50">
                            {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'} • {formatFileSize(totalSize)} total
                        </p>
                    </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#1a1a1a] border border-white/[0.10] rounded-xl p-6 max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-white mb-2">Delete File?</h3>
                            <p className="text-sm text-white/60 mb-6">
                                This action cannot be undone. The file will be permanently deleted.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const file = files.find(f => f.id === showDeleteConfirm);
                                        if (file) handleDelete(file);
                                    }}
                                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BiometricGate>
    );
};


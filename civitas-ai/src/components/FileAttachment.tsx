/**
 * File Attachment Preview
 * Handles file uploads with thumbnail generation for images
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, File, X, Image as ImageIcon, FileSpreadsheet,
    FileCode, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentPreviewProps {
    file: File;
    thumbnail?: string;
    onRemove: () => void;
    onView?: () => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
    file,
    thumbnail,
    onRemove,
    onView,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Get file icon based on type
    const getFileIcon = () => {
        if (file.type.startsWith('image/')) return ImageIcon;
        if (file.type.includes('pdf')) return FileText;
        if (file.type.includes('spreadsheet') || file.type.includes('excel')) return FileSpreadsheet;
        if (file.type.includes('csv')) return FileSpreadsheet;
        if (file.type.includes('json') || file.type.includes('xml')) return FileCode;
        return File;
    };

    const FileIcon = getFileIcon();

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
                'relative group rounded-lg border overflow-hidden transition-all cursor-pointer',
                isHovered
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-black/8 bg-black/[0.02]'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onView}
        >
            {/* Preview */}
            <div className="aspect-square relative">
                {thumbnail ? (
                    // Image thumbnail
                    <img
                        src={thumbnail}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // File icon
                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                        <FileIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                )}

                {/* Hover overlay */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        >
                            <span className="text-xs text-foreground/70">Click to view</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Remove button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-foreground/70 hover:text-foreground hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* File info */}
            <div className="p-2 border-t border-black/8">
                <div className="text-xs text-foreground/70 truncate font-medium">
                    {file.name}
                </div>
                <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {formatFileSize(file.size)}
                </div>
            </div>
        </motion.div>
    );
};

// Generate thumbnail for image files
export const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Not an image file'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 120;

                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = (height * MAX_SIZE) / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = (width * MAX_SIZE) / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

// Drag and Drop Zone
interface DragDropZoneProps {
    onDrop: (files: File[]) => void;
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
    onDrop,
    accept = 'image/*,.pdf,.csv,.xlsx,.doc,.docx',
    maxSize = 10 * 1024 * 1024, // 10MB default
    multiple = false,
    children,
    className,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const validateAndProcessFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const validFiles: File[] = [];

        for (const file of fileArray) {
            // Check file size
            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            onDrop(validFiles);
            setError(null);
        }
    }, [maxSize, onDrop]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        validateAndProcessFiles(e.dataTransfer.files);
    }, [validateAndProcessFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        validateAndProcessFiles(e.target.files);
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [validateAndProcessFiles]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
                'relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all',
                isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-black/12 hover:border-white/30 hover:bg-black/[0.02]',
                className
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
            />

            {children || (
                <div className="text-center">
                    <Upload className={cn(
                        'w-12 h-12 mx-auto mb-3 transition-colors',
                        isDragging ? 'text-blue-400' : 'text-muted-foreground/50'
                    )} />
                    <p className="text-sm text-muted-foreground mb-1">
                        {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                        Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
                    </p>
                </div>
            )}

            {error && (
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
                    {error}
                </div>
            )}
        </div>
    );
};

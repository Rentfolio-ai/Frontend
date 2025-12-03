/**
 * Loading State Component
 * 
 * Shows animated loading indicator
 */

import React from 'react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Thinking..." }) => {
    return (
        <div className="flex items-center gap-2 text-gray-600">
            <div className="flex gap-1">
                <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                />
                <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                />
                <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
            <span className="text-sm">{message}</span>
        </div>
    );
};

/**
 * Property Card Skeleton
 * 
 * Skeleton loader for property cards
 */
export const PropertyCardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    );
};

/**
 * Message Skeleton
 * 
 * Skeleton loader for chat messages
 */
export const MessageSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
    );
};

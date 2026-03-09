import React, { useState } from 'react';
import { Heart, GitCompare, Share2, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ScoutedProperty } from '../../../types/backendTools';
import type { BookmarkedProperty } from '../../../types/bookmarks';
import { useComparisonStore, type ComparisonProperty } from '../../../stores/comparisonStore';

interface PropertyActionButtonsProps {
    property: any; // Can be ScoutedProperty or other property types
    bookmarks?: BookmarkedProperty[];
    onToggleBookmark?: (property: ScoutedProperty) => void;
    onViewDetails?: (property: any) => void;
    className?: string;
    size?: 'sm' | 'md';
}

export const PropertyActionButtons: React.FC<PropertyActionButtonsProps> = ({
    property,
    bookmarks = [],
    onToggleBookmark,
    onViewDetails,
    className,
    size = 'md',
}) => {
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const { isSelected, toggleComparison } = useComparisonStore();

    // Check if property is bookmarked (BookmarkedProperty has nested property field)
    const isBookmarked = bookmarks.some(
        (b) => {
            const bookmarkedProp = b.property;
            return (
                bookmarkedProp.listing_id === property.listing_id ||
                bookmarkedProp.listing_id === property.id ||
                bookmarkedProp.listing_id === property.zpid
            );
        }
    );

    // Check if property is in comparison
    const propertyId = property.listing_id || property.id || property.zpid || '';
    const inComparison = isSelected(propertyId);

    // Handle bookmark toggle
    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleBookmark) {
            onToggleBookmark(property as ScoutedProperty);
        }
    };

    // Handle comparison toggle
    const handleCompare = (e: React.MouseEvent) => {
        e.stopPropagation();

        const comparisonProperty: ComparisonProperty = {
            id: propertyId,
            address: property.address || '',
            price: property.price || 0,
            bedrooms: property.bedrooms || property.beds,
            bathrooms: property.bathrooms || property.baths,
            sqft: property.sqft,
            yearBuilt: property.year_built,
            monthlyRent: property.financial_snapshot?.estimated_rent || property.estimated_rent,
            cashFlow: property.financial_snapshot?.estimated_monthly_cash_flow,
            cocReturn: undefined,
            capRate: undefined,
            thumbnail: property.photos?.[0] || property.image_url,
            city: property.city,
            state: property.state,
        };

        toggleComparison(comparisonProperty);
    };

    // Handle share (copy link to clipboard)
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Create a shareable link (you can customize this URL structure)
        const propertyUrl = `${window.location.origin}/property/${propertyId}`;

        try {
            await navigator.clipboard.writeText(propertyUrl);
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Handle view details
    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onViewDetails) {
            onViewDetails(property);
        }
    };

    const buttonSizeClasses = size === 'sm'
        ? 'p-1.5'
        : 'p-2';

    const iconSizeClasses = size === 'sm'
        ? 'w-3.5 h-3.5'
        : 'w-4 h-4';

    return (
        <div className={cn('relative flex items-center gap-1', className)}>
            {/* Bookmark Button */}
            {onToggleBookmark && (
                <button
                    onClick={handleBookmark}
                    className={cn(
                        buttonSizeClasses,
                        'rounded-lg transition-all duration-200',
                        'hover:bg-black/8 hover:scale-110',
                        isBookmarked
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-muted-foreground/70 hover:text-foreground/70'
                    )}
                    title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                    <Heart
                        className={cn(iconSizeClasses, isBookmarked && 'fill-current')}
                    />
                </button>
            )}

            {/* Compare Button */}
            <button
                onClick={handleCompare}
                className={cn(
                    buttonSizeClasses,
                    'rounded-lg transition-all duration-200',
                    'hover:bg-black/8 hover:scale-110',
                    inComparison
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-muted-foreground/70 hover:text-foreground/70'
                )}
                title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
            >
                <GitCompare className={iconSizeClasses} />
            </button>

            {/* Share Button */}
            <button
                onClick={handleShare}
                className={cn(
                    buttonSizeClasses,
                    'rounded-lg transition-all duration-200',
                    'text-muted-foreground/70 hover:text-foreground/70',
                    'hover:bg-black/8 hover:scale-110'
                )}
                title="Copy link to clipboard"
            >
                <Share2 className={iconSizeClasses} />
            </button>

            {/* View Details Button */}
            {onViewDetails && (
                <button
                    onClick={handleViewDetails}
                    className={cn(
                        buttonSizeClasses,
                        'rounded-lg transition-all duration-200',
                        'text-muted-foreground/70 hover:text-foreground/70',
                        'hover:bg-black/8 hover:scale-110'
                    )}
                    title="View details"
                >
                    <ExternalLink className={iconSizeClasses} />
                </button>
            )}

            {/* Copied Toast */}
            {showCopiedToast && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-foreground text-xs rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                    Link copied!
                </div>
            )}
        </div>
    );
};

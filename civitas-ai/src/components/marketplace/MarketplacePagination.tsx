import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const MarketplacePagination: React.FC<MarketplacePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
      <span className="text-[10px] text-white/25 font-mono">
        {startItem}–{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-md transition-colors ${
            currentPage === 1
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[10px] text-white/15">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-7 h-7 rounded-md text-[10px] font-medium transition-all ${
                page === currentPage
                  ? 'bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-md transition-colors ${
            currentPage === totalPages
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

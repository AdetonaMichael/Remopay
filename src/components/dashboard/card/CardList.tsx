'use client';

import React from 'react';
import { VirtualCard, CardPaginationMeta } from '@/types/card.types';
import { CardListItem } from './CardListItem';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface CardListProps {
  cards: VirtualCard[];
  pagination: CardPaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Card list display with pagination
 * Shows all user virtual cards and handles pagination
 */
export const CardList: React.FC<CardListProps> = ({
  cards,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
}) => {
  const { current_page, total_pages, total_records, page_size } = pagination;

  const handlePreviousPage = () => {
    if (current_page > 1) {
      onPageChange(current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (current_page < total_pages) {
      onPageChange(current_page + 1);
    }
  };

  // Empty state
  if (cards.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
        <p className="text-gray-600">Create your first virtual card to get started</p>
      </div>
    );
  }

  // Loading state - show only on first load
  if (isLoading && cards.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <CardListItem key={card.id} card={card} />
        ))}
      </div>

      {/* Pagination Section */}
      {total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 mt-6">
          {/* Info Text */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{cards.length}</span> of{' '}
            <span className="font-semibold">{total_records}</span> cards
            {total_records > page_size && (
              <span>
                {' '}
                (Page <span className="font-semibold">{current_page}</span> of{' '}
                <span className="font-semibold">{total_pages}</span>)
              </span>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Per page:</label>
            <select
              value={page_size}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 hover:border-gray-400 disabled:opacity-50"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={isLoading || current_page === 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(total_pages, 5) }, (_, i) => {
                let pageNum: number;
                if (total_pages <= 5) {
                  pageNum = i + 1;
                } else if (current_page <= 3) {
                  pageNum = i + 1;
                } else if (current_page >= total_pages - 2) {
                  pageNum = total_pages - 4 + i;
                } else {
                  pageNum = current_page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                    className={`h-8 w-8 rounded-lg text-sm font-medium disabled:opacity-50 ${
                      current_page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={isLoading || current_page === total_pages}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

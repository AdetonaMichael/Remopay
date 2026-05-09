'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  title?: string;
  emptyMessage?: string;
  perPage?: number;
  total?: number;
  className?: string;
}

export const AdminTable = React.forwardRef<
  HTMLDivElement,
  AdminTableProps<any>
>(
  (
    {
      columns,
      data,
      loading = false,
      currentPage,
      totalPages,
      onPageChange,
      title,
      emptyMessage = 'No data available',
      perPage = 20,
      total,
      className,
    },
    ref
  ) => {
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const startIndex = (currentPage - 1) * perPage + 1;
    const endIndex = Math.min(currentPage * perPage, total || data.length);

    return (
      <div ref={ref} className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ''}`}>
        {/* Header */}
        {title && (
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">
              Showing {startIndex} to {endIndex} of {total || data.length}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center px-6 py-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
                  <Spinner />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Loading data...
                </p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center px-6 py-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  {emptyMessage}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={`px-6 py-3 font-semibold text-gray-700 ${
                        alignClass[column.align || 'left']
                      }`}
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => {
                      const value =
                        column.render?.(
                          (row as any)[String(column.key)],
                          row,
                          rowIndex
                        ) ?? (row as any)[String(column.key)];

                      return (
                        <td
                          key={String(column.key)}
                          className={`px-6 py-4 text-sm text-gray-900 ${
                            alignClass[column.align || 'left']
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AdminTable.displayName = 'AdminTable';

'use client';

import React from 'react';
import { CardAuditLog } from '@/types/card-admin.types';
import { Calendar, User, Edit3 } from 'lucide-react';

interface AuditLogTimelineProps {
  logs: CardAuditLog[];
  isLoading?: boolean;
}

export const AuditLogTimeline: React.FC<AuditLogTimelineProps> = ({
  logs,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          No modifications yet. Card details not yet populated by admin.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className={`rounded-lg border p-4 transition-all ${
            index === 0
              ? 'border-blue-200 bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <Edit3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {log.action} Card Details
                  </h4>
                  {index === 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(log.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{log.admin_name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{log.admin_email}</span>
          </div>

          {/* Fields Modified */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Fields Modified:
            </p>
            <div className="flex flex-wrap gap-2">
              {log.fields_modified.map((field) => (
                <span
                  key={field}
                  className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {field.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {log.notes && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
              <p className="text-sm text-gray-700 italic">{log.notes}</p>
            </div>
          )}

          {/* IP Address (if available) */}
          {log.ip_address && (
            <div className="mt-3 text-xs text-gray-500">
              IP Address: <span className="font-mono">{log.ip_address}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

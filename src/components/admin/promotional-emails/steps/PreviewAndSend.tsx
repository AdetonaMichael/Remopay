'use client';

import { useState } from 'react';
import { useAlert } from '@/hooks/useAlert';
import {
  Mail,
  Send,
  CalendarClock,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface PreviewAndSendProps {
  previewHtml: string;
  targetUserCount?: number;
  previewUsers?: any[];
  campaignName: string;
  loading: boolean;
  onSend: (sendOption: 'now' | 'schedule', scheduledAt?: string) => Promise<void>;
}

export default function PreviewAndSend({
  previewHtml,
  targetUserCount = 0,
  previewUsers = [],
  campaignName,
  loading,
  onSend,
}: PreviewAndSendProps) {
  const { showAlert } = useAlert();
  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  const handleSend = async () => {
    if (!confirmSend) {
      showAlert('Please confirm sending to users', 'warning');
      return;
    }
    if (sendOption === 'schedule' && !scheduledAt) {
      showAlert('Please select a date and time', 'warning');
      return;
    }
    try {
      await onSend(sendOption, sendOption === 'schedule' ? scheduledAt : undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const isReady = confirmSend && (sendOption === 'now' || (sendOption === 'schedule' && scheduledAt));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Preview & Send</h2>
        <p className="mt-1 text-sm text-gray-500">Review your campaign before sending it out.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT — Email Preview */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Email Preview</p>

          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            {/* Mock email client header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-8 font-medium text-gray-400">From</span>
                  <span className="bg-white border border-gray-200 rounded px-2 py-0.5 font-medium text-gray-700">
                    remopay@noreply.com
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-8 font-medium text-gray-400">Subj</span>
                  <span className="bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-700 truncate max-w-xs">
                    {campaignName || 'Campaign'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="bg-white p-5 min-h-64 max-h-96 overflow-auto">
              {previewHtml ? (
                <div
                  className="text-gray-800 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-300">
                  <Mail size={36} strokeWidth={1.5} />
                  <p className="text-sm">Email preview will appear here</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Actual rendering may vary across email clients
          </p>

          {/* Preview Recipients */}
          {previewUsers && previewUsers.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                  Preview Recipients ({previewUsers.length})
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {previewUsers.map((user, index) => (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name || ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {user.tier_level && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs font-medium text-blue-700 flex-shrink-0">
                          {user.tier_level}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Config panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* Campaign summary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Summary</p>
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#fdf2f2] flex items-center justify-center flex-shrink-0">
                  <Tag size={14} className="text-[#620707]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Campaign name</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {campaignName || <span className="text-gray-400 italic">Not set</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#fdf2f2] flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-[#620707]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Recipients</p>
                  <p className="text-sm font-medium text-gray-900">
                    {targetUserCount > 0
                      ? <><span className="text-[#620707] font-semibold">{targetUserCount.toLocaleString()}</span> users</>
                      : <span className="text-gray-400">No recipients selected</span>
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#fdf2f2] flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-[#620707]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Delivery</p>
                  <p className="text-sm font-medium text-gray-900">
                    {sendOption === 'now'
                      ? 'Immediately'
                      : scheduledAt
                        ? new Date(scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                        : <span className="text-gray-400">Not scheduled</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Send options */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">When to send</p>
            <div className="space-y-2">
              {/* Send now */}
              <button
                type="button"
                onClick={() => setSendOption('now')}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                  sendOption === 'now'
                    ? 'border-[#620707] bg-[#fdf2f2]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    sendOption === 'now' ? 'border-[#620707]' : 'border-gray-300'
                  }`}>
                    {sendOption === 'now' && (
                      <div className="w-2 h-2 rounded-full bg-[#620707]" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${sendOption === 'now' ? 'text-[#620707]' : 'text-gray-800'}`}>
                      Send immediately
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Deliver to all recipients right now</p>
                  </div>
                  <Send size={14} className={`ml-auto flex-shrink-0 ${sendOption === 'now' ? 'text-[#620707]' : 'text-gray-300'}`} />
                </div>
              </button>

              {/* Schedule */}
              <button
                type="button"
                onClick={() => setSendOption('schedule')}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                  sendOption === 'schedule'
                    ? 'border-[#620707] bg-[#fdf2f2]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    sendOption === 'schedule' ? 'border-[#620707]' : 'border-gray-300'
                  }`}>
                    {sendOption === 'schedule' && (
                      <div className="w-2 h-2 rounded-full bg-[#620707]" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${sendOption === 'schedule' ? 'text-[#620707]' : 'text-gray-800'}`}>
                      Schedule for later
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Choose a specific date and time</p>
                  </div>
                  <CalendarClock size={14} className={`ml-auto flex-shrink-0 ${sendOption === 'schedule' ? 'text-[#620707]' : 'text-gray-300'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Date picker — only when schedule selected */}
          {sendOption === 'schedule' && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <label htmlFor="schedule-datetime" className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <Calendar size={12} />
                Schedule date & time
              </label>
              <input
                id="schedule-datetime"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#620707]/20 focus:border-[#620707] transition-colors text-gray-900"
              />
            </div>
          )}

          {/* Confirmation checkbox */}
          <div>
            <button
              type="button"
              onClick={() => setConfirmSend(!confirmSend)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                confirmSend
                  ? 'border-[#620707] bg-[#fdf2f2]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  confirmSend ? 'border-[#620707] bg-[#620707]' : 'border-gray-300'
                }`}>
                  {confirmSend && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${confirmSend ? 'text-[#620707]' : 'text-gray-800'}`}>
                    I confirm this campaign
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    This will send to{' '}
                    <span className="font-medium text-gray-600">
                      {targetUserCount.toLocaleString()} users
                    </span>
                    {' '}and cannot be undone.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady || loading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isReady && !loading
                ? 'bg-[#620707] hover:bg-[#4a0505] active:scale-[0.98] text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending campaign…
              </>
            ) : (
              <>
                <Send size={15} />
                {sendOption === 'schedule' ? 'Schedule campaign' : 'Send campaign now'}
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
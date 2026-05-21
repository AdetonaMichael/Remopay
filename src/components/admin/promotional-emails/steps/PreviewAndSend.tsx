'use client';

import { useState } from 'react';
import { useAlert } from '@/hooks/useAlert';

interface PreviewAndSendProps {
  previewHtml: string;
  targetUserCount: number;
  campaignName: string;
  loading: boolean;
  onSend: (sendOption: 'now' | 'schedule', scheduledAt?: string) => Promise<void>;
}

export default function PreviewAndSend({
  previewHtml,
  targetUserCount,
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Preview & Send</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Preview */}
        <div className="lg:col-span-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-700">Email Preview</p>
            </div>
            <div
              className="p-4 min-h-96 overflow-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>

        {/* Send Options */}
        <div className="space-y-6">
          {/* Campaign Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Campaign Summary</p>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <span className="font-medium">Name:</span> {campaignName}
              </p>
              <p>
                <span className="font-medium">Recipients:</span>{' '}
                {targetUserCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Send Option */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Send Option</p>

            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="send-option"
                value="now"
                checked={sendOption === 'now'}
                onChange={() => setSendOption('now')}
                className="w-4 h-4 accent-[#620707]"
              />
              <div>
                <p className="font-medium text-gray-900">Send Immediately</p>
                <p className="text-xs text-gray-600">Email sends now to all recipients</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="send-option"
                value="schedule"
                checked={sendOption === 'schedule'}
                onChange={() => setSendOption('schedule')}
                className="w-4 h-4 accent-[#620707]"
              />
              <div>
                <p className="font-medium text-gray-900">Schedule for Later</p>
                <p className="text-xs text-gray-600">Choose a date and time</p>
              </div>
            </label>

            {sendOption === 'schedule' && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707]"
              />
            )}
          </div>

          {/* Confirmation */}
          <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={confirmSend}
              onChange={(e) => setConfirmSend(e.target.checked)}
              className="w-4 h-4 mt-1 accent-[#620707]"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">I confirm sending to {targetUserCount.toLocaleString()} users</p>
              <p className="text-xs text-gray-600">This action will queue emails for delivery</p>
            </div>
          </label>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!confirmSend || loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Processing...' : '✓ Send Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}

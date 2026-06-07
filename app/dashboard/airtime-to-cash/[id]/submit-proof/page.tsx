'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Upload,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import { airtimeToCashService } from '@/services/airtime-to-cash.service';

interface FileUploadState {
  file?: File;
  preview?: string;
  uploading: boolean;
  error?: string;
}

export default function SubmitProofPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { submitProof, isSubmittingProof, conversionError, clearError } =
    useAirtimeToCash();

  const transactionId = Number(params.id);

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploading: false,
  });

  // Fetch transaction details on mount
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await airtimeToCashService.getTransaction(transactionId);
        setTransaction(data);
      } catch (error: any) {
        addToast({
          message: 'Failed to load transaction',
          type: 'error',
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, router, addToast]);

  // Handle error toast
  useEffect(() => {
    if (conversionError) {
      addToast({
        message: conversionError,
        type: 'error',
      });
    }
  }, [conversionError, addToast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadState({
        uploading: false,
        error: 'Only JPEG, PNG, or WebP images are supported',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadState({
        uploading: false,
        error: 'File size must be less than 5MB',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadState({
        file,
        preview: event.target?.result as string,
        uploading: false,
        error: undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!uploadState.file || !uploadState.preview) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Please select a screenshot',
      }));
      return;
    }

    try {
      // In a real implementation, upload the file to storage and get URL
      // For now, we'll use a simulated URL (backend expects public URL)
      const screenshotUrl = uploadState.preview; // In real implementation: upload to S3/storage service

      await submitProof(transactionId, screenshotUrl);

      addToast({
        message: 'Proof submitted! Awaiting admin verification.',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/dashboard/airtime-to-cash/history');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit proof:', error);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#d71927]" size={24} />
          <p className="text-gray-600">Loading transaction...</p>
        </div>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="font-bold text-red-900">Transaction not found</p>
            <p className="text-sm text-red-700">Unable to load transaction details</p>
          </div>
        </div>
        <Button
          onClick={() => router.back()}
          className="mt-4 rounded-2xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-extrabold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Initiate Conversion</p>
                <p className="text-xs text-gray-600">
                  ₦{transaction.airtime_amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Submit Proof</p>
                <p className="text-xs text-gray-600">Upload transfer screenshot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Instructions */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="mb-3 text-sm font-bold text-blue-900">📋 Instructions</p>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>
                  1. Send <strong>₦{transaction.airtime_amount.toLocaleString()}</strong> airtime to{' '}
                  <strong>{transaction.provider.toUpperCase()}</strong> number: <strong>08010000000</strong>
                  (displayed in next step)
                </li>
                <li>2. Take a screenshot showing successful transfer</li>
                <li>3. Upload the screenshot below</li>
                <li>4. Admin will verify and credit your wallet</li>
              </ol>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Upload Transfer Screenshot <span className="text-red-600">*</span>
              </label>

              <label className="block">
                <div
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                    uploadState.preview
                      ? 'border-green-300 bg-green-50'
                      : uploadState.error
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!uploadState.preview ? (
                    <>
                      <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                      <p className="text-sm font-semibold text-gray-900">
                        Click to upload screenshot
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        JPEG, PNG, or WebP • Max 5MB
                      </p>
                    </>
                  ) : (
                    <>
                      <img
                        src={uploadState.preview}
                        alt="Preview"
                        className="mx-auto mb-4 max-h-64 rounded-xl object-contain"
                      />
                      <Check className="mx-auto mb-2 text-green-600" size={32} />
                      <p className="text-sm font-semibold text-green-900">
                        Screenshot ready to submit
                      </p>
                    </>
                  )}
                </div>
              </label>

              {uploadState.error && (
                <p className="mt-3 text-sm font-medium text-red-600">{uploadState.error}</p>
              )}
            </div>

            {/* Additional Instructions */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                  ⚠️ Important
                </p>
                <ul className="space-y-1 text-sm text-amber-900">
                  <li>• Screenshot must clearly show successful transfer</li>
                  <li>• Include amount sent and receiver number</li>
                  <li>• Your face/ID should not be visible (privacy)</li>
                  <li>• Admin typically reviews within 2-4 hours</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                onClick={() => router.back()}
                className="rounded-2xl border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-900 hover:bg-gray-50"
              >
                Go Back
              </Button>

              <Button
                onClick={handleSubmitProof}
                disabled={!uploadState.preview || isSubmittingProof}
                className="ml-auto flex items-center gap-2 rounded-2xl bg-[#d71927] px-6 py-3 font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:opacity-60"
              >
                {isSubmittingProof ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Submit Proof</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Transaction Summary */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">Transaction Details</p>

            <div className="mt-5 space-y-4">
              {/* Reference */}
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-600">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                  {transaction.reference}
                </p>
              </div>

              {/* Provider */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Provider</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {transaction.provider.toUpperCase()}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Airtime Amount</p>
                <p className="mt-1 text-lg font-extrabold text-[#d71927]">
                  ₦{transaction.airtime_amount.toLocaleString()}
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Your Phone</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {transaction.phone_number}
                </p>
              </div>

              {/* Status */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Status</p>
                <p className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                  {transaction.status.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Estimated Cash */}
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  You'll Receive (Estimated)
                </p>
                <p className="mt-2 text-2xl font-extrabold text-green-900">
                  ₦{(transaction.cash_credited || Math.round(transaction.net_amount * (transaction.conversion_rate || 0.8))).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-green-700">After service fee deducted</p>
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600">
                  Initiated {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                  {new Date(transaction.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}

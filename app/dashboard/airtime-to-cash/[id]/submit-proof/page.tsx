'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Upload,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import { airtimeToCashService } from '@/services/airtime-to-cash.service';
import { AirtimeToCashTransaction } from '@/types/airtime-to-cash.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// File Upload State Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  error: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SubmitProofPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { uploadScreenshot, isSubmittingProof } = useAirtimeToCash();

  const transactionId = Number(params.id);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const [transaction, setTransaction] = useState<AirtimeToCashTransaction | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    preview: null,
    uploading: false,
    error: null,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Effects
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Fetch transaction details on mount
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setTransactionLoading(true);
        const data = await airtimeToCashService.getTransaction(transactionId);
        
        if (!data) {
          throw new Error('Transaction data is empty');
        }
        
        setTransaction(data as AirtimeToCashTransaction);
      } catch (error: any) {
        console.error('[SubmitProofPage] Failed to load transaction:', error);
        
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load transaction. Please try again.';
        
        addToast({
          message: errorMessage,
          type: 'error',
        });
        
        // Redirect back after showing error
        setTimeout(() => router.back(), 1500);
      } finally {
        setTransactionLoading(false);
      }
    };

    if (transactionId && transactionId > 0) {
      fetchTransaction();
    }
  }, [transactionId, router, addToast]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Validation Functions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const validateFile = useCallback((file: File): string | null => {
    // Check file exists
    if (!file) {
      return 'Please select a file';
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const exts = ALLOWED_FILE_EXTENSIONS.join(', ');
      return `Only ${exts} images are allowed`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = MAX_FILE_SIZE / 1024 / 1024;
      return `File size must be less than ${maxMB}MB`;
    }

    return null; // No errors
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Event Handlers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setUploadState({
        file: null,
        preview: null,
        uploading: false,
        error: null,
      });
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({
        file: null,
        preview: null,
        uploading: false,
        error: validationError,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      setUploadState({
        file,
        preview,
        uploading: false,
        error: null,
      });
    };
    reader.onerror = () => {
      setUploadState({
        file: null,
        preview: null,
        uploading: false,
        error: 'Failed to read file',
      });
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleSubmitProof = useCallback(async () => {
    if (!uploadState.file) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Please select a screenshot',
      }));
      return;
    }

    try {
      setUploadState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
      }));

      console.log('[SubmitProofPage] Submitting proof for transaction:', transactionId);

      // Call the hook function to upload screenshot
      const result = await uploadScreenshot(transactionId, uploadState.file);

      console.log('[SubmitProofPage] Upload successful, result:', result);

      // Show success message
      const successMessage = 
        result?.message || 
        'Proof submitted successfully! Awaiting admin verification.';
      
      addToast({
        message: successMessage,
        type: 'success',
      });

      // Clear the upload state
      setUploadState({
        file: null,
        preview: null,
        uploading: false,
        error: null,
      });

      // Redirect to history after delay
      setTimeout(() => {
        router.push('/dashboard/airtime-to-cash/history');
      }, 1500);
    } catch (error: any) {
      console.error('[SubmitProofPage] Upload failed:', error);

      // Extract error message from response or error object
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to upload screenshot. Please try again.';

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: errorMessage,
      }));

      // Show error toast
      addToast({
        message: errorMessage,
        type: 'error',
      });
    }
  }, [uploadState.file, transactionId, uploadScreenshot, router, addToast]);

  const handleReset = useCallback(() => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      error: null,
    });
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Render: Loading State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (transactionLoading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#d71927]" size={24} />
          <p className="text-gray-600">Loading transaction...</p>
        </div>
      </Card>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Render: Error State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Render: Main Content
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* Header with Progress Steps */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-extrabold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Initiate Conversion</p>
                <p className="text-xs text-gray-600">
                  ₦{transaction.airtime_amount?.toLocaleString() || '0'}
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

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* Main Content */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Instructions */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="mb-3 text-sm font-bold text-gray-900">Instructions</p>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>
                  1. Send <strong>₦{transaction.airtime_amount?.toLocaleString() || '0'}</strong> airtime to{' '}
                  <strong>{transaction.provider?.toUpperCase() || 'PROVIDER'}</strong> number: <strong>08010000000</strong>
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

              <label className="block cursor-pointer">
                <div
                  className={`relative rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                    uploadState.preview
                      ? 'border-green-300 bg-green-50'
                      : uploadState.error
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    disabled={uploadState.uploading || isSubmittingProof}
                    className="hidden"
                  />

                  {!uploadState.preview ? (
                    <>
                      <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                      <p className="text-sm font-semibold text-gray-900">
                        Click to upload screenshot
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        JPEG, PNG, or GIF • Max 5MB
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
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm font-medium text-red-600">{uploadState.error}</p>
                </div>
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
                disabled={uploadState.uploading || isSubmittingProof}
                className="rounded-2xl border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                Go Back
              </Button>

              <Button
                onClick={handleSubmitProof}
                disabled={
                  !uploadState.file ||
                  uploadState.uploading ||
                  isSubmittingProof ||
                  !!uploadState.error
                }
                className="ml-auto flex items-center gap-2 rounded-2xl bg-[#d71927] px-6 py-3 font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:opacity-60"
              >
                {uploadState.uploading || isSubmittingProof ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Uploading...
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

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* Right Sidebar: Transaction Summary */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">Transaction Details</p>

            <div className="mt-5 space-y-4">
              {/* Reference */}
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-600">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                  {transaction.reference || 'N/A'}
                </p>
              </div>

              {/* Provider */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Provider</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {transaction.provider?.toUpperCase() || 'N/A'}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Airtime Amount</p>
                <p className="mt-1 text-lg font-extrabold text-[#d71927]">
                  ₦{transaction.airtime_amount?.toLocaleString() || '0'}
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Your Phone</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {transaction.phone_number || 'N/A'}
                </p>
              </div>

              {/* Status */}
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">Status</p>
                <p className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                  {transaction.status?.replace(/_/g, ' ') || 'N/A'}
                </p>
              </div>

              {/* Estimated Cash */}
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  You'll Receive (Estimated)
                </p>
                <p className="mt-2 text-2xl font-extrabold text-green-900">
                  ₦
                  {(
                    Number(transaction.cash_credited || 0) > 0
                      ? transaction.cash_credited
                      : Math.round(
                          (transaction.net_amount || 0) *
                            (transaction.conversion_rate || 0.8)
                        )
                  ).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-green-700">After service fee deducted</p>
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600">
                  Initiated{' '}
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleDateString()
                    : 'N/A'}{' '}
                  at{' '}
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleTimeString()
                    : 'N/A'}
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

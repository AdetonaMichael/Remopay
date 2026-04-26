'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-sm mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left text-xs text-red-800 overflow-auto max-h-40">
            <p className="font-mono font-bold mb-2">Error Details:</p>
            <p>{error.message}</p>
            {error.digest && <p className="text-xs text-gray-600 mt-2">Digest: {error.digest}</p>}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-32 rounded bg-gray-100" />
        </div>
        <div className="h-7 w-24 rounded-full bg-gray-200" />
      </div>

      {/* Financial Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-5 w-36 rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-4 w-28 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Source Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-36 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 h-5 w-20 rounded bg-gray-200" />
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-100" />
                <div className="mt-1 h-3 w-24 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

// Full page skeleton loader
export const PageSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    {/* Header skeleton */}
    <div className="space-y-2">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="h-4 w-96 bg-gray-100 rounded-lg" />
    </div>

    {/* Metrics grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded-lg" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>

    {/* Content area skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-lg" />
          <div className="space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Card skeleton loader
export const CardSkeleton = ({ count = 1 }: { count?: number }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-gray-200 rounded-lg" />
            <div className="h-4 w-56 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="border-b border-gray-200 p-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="h-4 w-20 bg-gray-200 rounded" />
      ))}
    </div>

    {/* Rows */}
    {[...Array(rows)].map((_, rowIdx) => (
      <div key={rowIdx} className="border-b border-gray-100 p-6 grid gap-4 last:border-0" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, colIdx) => (
          <div key={colIdx} className="h-4 w-24 bg-gray-100 rounded" />
        ))}
      </div>
    ))}
  </div>
);

// Form skeleton loader
export const FormSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-100 rounded-lg" />
    </div>

    <div className="grid grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>

    <div className="space-y-3">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-24 w-full bg-gray-100 rounded-lg" />
    </div>

    <div className="flex gap-3 pt-4">
      <div className="h-10 w-24 bg-gray-200 rounded-lg" />
      <div className="h-10 w-24 bg-gray-100 rounded-lg" />
    </div>
  </div>
);

// Chart/Analytics skeleton loader
export const ChartSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 animate-pulse">
    <div className="h-6 w-40 bg-gray-200 rounded-lg" />

    <div className="space-y-3 pt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-12 bg-gray-100 rounded" />
          <div className="h-8 flex-1 bg-gray-100 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </div>
      ))}
    </div>
  </div>
);

// Dashboard skeleton loader (multiple sections)
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header */}
    <div className="space-y-2">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="h-4 w-96 bg-gray-100 rounded-lg" />
    </div>

    {/* Quick stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 space-y-3">
          <div className="h-4 w-20 bg-gray-100 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>

    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Large card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-lg" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

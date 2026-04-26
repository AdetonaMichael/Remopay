export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#f8fafc]">
      <td className="px-6 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-[#e5e7eb]" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 animate-pulse rounded-full bg-[#e5e7eb]" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#e5e7eb]" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-28 animate-pulse rounded bg-[#e5e7eb]" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 w-20 animate-pulse rounded bg-[#e5e7eb]" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="h-6 w-16 animate-pulse rounded-full bg-[#e5e7eb]" />
      </td>
    </tr>
  );
}

export function MobileCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-[#edf2f7] bg-[#fcfcfd] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e5e7eb]" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-[#e5e7eb]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="h-3 w-12 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#e5e7eb]" />
        </div>
        <div>
          <div className="h-3 w-12 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#e5e7eb]" />
        </div>
        <div className="col-span-2">
          <div className="h-3 w-16 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-[#e5e7eb]" />
        </div>
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full animate-pulse rounded-2xl bg-[#e5e7eb]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="h-10 animate-pulse rounded-2xl bg-[#e5e7eb]" />
        <div className="h-10 animate-pulse rounded-2xl bg-[#e5e7eb]" />
        <div className="h-10 animate-pulse rounded-2xl bg-[#e5e7eb]" />
        <div className="h-10 animate-pulse rounded-2xl bg-[#e5e7eb]" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-4 h-8 w-32 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-[#e5e7eb]" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#e5e7eb]" />
      </div>
    </div>
  );
}

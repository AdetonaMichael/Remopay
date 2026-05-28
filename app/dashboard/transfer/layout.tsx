/**
 * Transfer Layout
 * Shared layout for all transfer-related pages
 */

import { ProtectedPageWrapper } from '@/components/ProtectedPageWrapper';

export default function TransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPageWrapper>
      {children}
    </ProtectedPageWrapper>
  );
}

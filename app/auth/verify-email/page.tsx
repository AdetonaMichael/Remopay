'use client';

import { Suspense } from 'react';
import { VerifyEmailForm } from './VerifyEmailForm';
import { AuthProtectedRoute } from '@/components/AuthProtectedRoute';

export default function VerifyEmailPage() {
  return (
    <AuthProtectedRoute requireUnauthenticated={false} redirectTo="/dashboard">
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="min-h-screen"
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

          * {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
        `}</style>

        <Suspense fallback={null}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </AuthProtectedRoute>
  );
}
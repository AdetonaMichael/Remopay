import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

/**
 * Phone Verification Page
 * 
 * Users are redirected here when trying to access protected routes
 * without completing phone verification.
 * 
 * Once verified, they're redirected back to their intended page via
 * the `next` query parameter.
 */
export default function VerifyPhonePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <PhoneVerificationModal />
    </div>
  );
}

import { Metadata } from 'next';
import EmailTemplatesPage from '@/components/admin/promotional-emails/EmailTemplatesPage';

export const metadata: Metadata = {
  title: 'Email Templates - Remopay Admin',
  description: 'Manage email templates for promotional campaigns',
};

export default function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <EmailTemplatesPage />
    </div>
  );
}

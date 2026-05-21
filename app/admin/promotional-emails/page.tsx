import { Metadata } from 'next';
import PromotionalEmailCampaigns from '@/components/admin/promotional-emails/PromotionalEmailCampaigns';

export const metadata: Metadata = {
  title: 'Email Campaigns - Remopay Admin',
  description: 'Manage promotional email campaigns',
};

export default function EmailCampaignsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <PromotionalEmailCampaigns />
    </div>
  );
}

import { Metadata } from 'next';
import CampaignAnalytics from '@/components/admin/promotional-emails/CampaignAnalytics';

export const metadata: Metadata = {
  title: 'Campaign Analytics - Remopay Admin',
  description: 'View campaign analytics and delivery statistics',
};

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <CampaignAnalytics />
    </div>
  );
}

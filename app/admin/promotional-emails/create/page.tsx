import { Metadata } from 'next';
import PromotionalEmailBuilder from '@/components/admin/PromotionalEmailBuilder';

export const metadata: Metadata = {
  title: 'Create Campaign - Remopay Admin',
  description: 'Create a new promotional email campaign',
};

export default function CreateCampaignPage() {
  return <PromotionalEmailBuilder />;
}

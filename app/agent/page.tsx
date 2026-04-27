'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function AgentPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect if not agent
  useEffect(() => {
    if (user && !user.roles?.some((r) => r === 'agent')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your customers and earnings</p>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-x-visible">
        {[
          { title: 'Total Customers', value: '0' },
          { title: 'This Month Earnings', value: '₦0.00' },
          { title: 'Pending Commission', value: '₦0.00' },
        ].map((stat) => (
          <Card key={stat.title} className="min-w-full md:min-w-auto snap-start md:snap-start">
            <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Customers', href: '/agent/customers' },
            { label: 'Commissions', href: '/agent/commissions' },
            { label: 'Performance', href: '/agent/performance' },
          ].map((action) => (
            <Button key={action.href} variant="outline" fullWidth>
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Full agent dashboard with customer management, commission tracking, and performance
          analytics will be implemented soon.
        </p>
      </Card>
    </div>
  );
}

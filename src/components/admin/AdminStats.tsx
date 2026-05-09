'use client';

import React from 'react';
import { Card, CardBody } from '@/components/shared/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
}

interface AdminStatsProps {
  stats: StatItem[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return (
          <TrendingUp className="h-4 w-4 text-green-600" />
        );
      case 'down':
        return (
          <TrendingDown className="h-4 w-4 text-red-600" />
        );
      default:
        return (
          <Minus className="h-4 w-4 text-gray-400" />
        );
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="mb-6 hidden-scrollbar overflow-x-auto md:overflow-x-visible">
      <div className="inline-flex w-full gap-4 md:grid md:grid-cols-2 md:w-auto lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="min-w-[calc(100vw-3rem)] md:min-w-0">
            <CardBody className="space-y-2">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                {stat.icon && (
                  <div className="text-[#a9b7ff]">{stat.icon}</div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTrendColor(
                    stat.change.direction
                  )}`}
                >
                  {getTrendIcon(stat.change.direction)}
                  {stat.change.value}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

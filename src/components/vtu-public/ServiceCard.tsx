import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  features: string[];
  color?: 'red' | 'blue' | 'green' | 'purple';
}

const colorClasses = {
  red: 'hover:shadow-red-100 border-red-100',
  blue: 'hover:shadow-blue-100 border-blue-100',
  green: 'hover:shadow-green-100 border-green-100',
  purple: 'hover:shadow-purple-100 border-purple-100',
};

const iconBgClasses = {
  red: 'bg-red-50',
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
};

const iconColorClasses = {
  red: 'text-red-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
};

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  features,
  color = 'red',
}: ServiceCardProps) {
  return (
    <Link href={href}>
      <div className={`group relative h-full rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-xl ${colorClasses[color]}`}>
        {/* Background gradient accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent opacity-0 group-hover:opacity-5 transition-opacity" />
        
        {/* Icon */}
        <div className={`${iconBgClasses[color]} mb-4 inline-flex rounded-xl p-3`}>
          <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600">{description}</p>

        {/* Features */}
        <ul className="mb-6 space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${color === 'red' ? 'bg-red-600' : 'bg-blue-600'} flex-shrink-0`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-semibold text-red-600 transition-transform group-hover:translate-x-1">
          Learn More
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

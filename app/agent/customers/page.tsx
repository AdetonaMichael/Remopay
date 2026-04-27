'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { Search } from 'lucide-react';

export default function AgentCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    setCustomers([
      {
        id: '1',
        first_name: 'Chidi',
        last_name: 'Okafor',
        email: 'chidi@example.com',
        phone: '+234901234567',
        total_spent: 125000,
        transactions: 18,
        last_transaction: '2024-01-25',
      },
      {
        id: '2',
        first_name: 'Amara',
        last_name: 'Eze',
        email: 'amara@example.com',
        phone: '+234902345678',
        total_spent: 89500,
        transactions: 12,
        last_transaction: '2024-01-24',
      },
      {
        id: '3',
        first_name: 'Tunde',
        last_name: 'Adebayo',
        email: 'tunde@example.com',
        phone: '+234903456789',
        total_spent: 45000,
        transactions: 6,
        last_transaction: '2024-01-23',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (loading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Customers</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your customer base</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Customer</Button>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-x-visible">
        {[
          { label: 'Total Customers', value: customers.length.toString() },
          { label: 'Total Revenue', value: `₦${customers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString()}` },
          { label: 'Average Transaction', value: `₦${Math.round(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.reduce((sum, c) => sum + c.transactions, 1)).toLocaleString()}` },
        ].map((stat) => (
          <Card key={stat.label} className="min-w-full md:min-w-auto snap-start md:snap-start">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              label="Search"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₦{customer.total_spent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.transactions}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.last_transaction}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#a9b7ff] hover:text-[#9da9ff] font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

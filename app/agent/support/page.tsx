'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { Badge } from '@/components/shared/Badge';
import { MessageSquare, Clock } from 'lucide-react';

export default function AgentSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('open');

  useEffect(() => {
    setTickets([
      {
        id: 'TICKET001',
        subject: 'Account verification pending',
        category: 'Account',
        status: 'open',
        priority: 'high',
        created: '2024-01-24 10:30',
        last_reply: '2024-01-24 14:15',
        responses: 2,
      },
      {
        id: 'TICKET002',
        subject: 'Commission payment issue',
        category: 'Payment',
        status: 'open',
        priority: 'high',
        created: '2024-01-25 09:00',
        last_reply: '2024-01-25 09:30',
        responses: 1,
      },
      {
        id: 'TICKET003',
        subject: 'Referral code not working',
        category: 'Technical',
        status: 'resolved',
        priority: 'medium',
        created: '2024-01-20 11:00',
        last_reply: '2024-01-21 16:45',
        responses: 4,
      },
      {
        id: 'TICKET004',
        subject: 'Dashboard loading slow',
        category: 'Technical',
        status: 'resolved',
        priority: 'low',
        created: '2024-01-18 15:30',
        last_reply: '2024-01-19 10:00',
        responses: 2,
      },
    ]);
    setLoading(false);
  }, []);

  const filteredTickets = tickets.filter((ticket) =>
    selectedTab === 'all' ? true : ticket.status === selectedTab
  );

  const getPriorityColor = (priority: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-2">Get help and track your support tickets</p>
        </div>
        <Button>Create Ticket</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Open Tickets', value: tickets.filter((t) => t.status === 'open').length },
          { label: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length },
          { label: 'Avg Response Time', value: '2 hours' },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {typeof stat.value === 'number' ? stat.value : stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            {['open', 'resolved', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  selectedTab === tab
                    ? 'border-[#a9b7ff] text-[#a9b7ff]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Tickets
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                    <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)} size="sm">
                      {ticket.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  {ticket.category}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  Created: {ticket.created}
                </div>
                <div className="text-gray-900 font-medium">{ticket.responses} responses</div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">Last reply: {ticket.last_reply}</span>
                <button className="text-[#a9b7ff] hover:text-[#9da9ff] font-medium text-sm">
                  View Ticket
                </button>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tickets in this category</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How long does verification take?',
              a: 'Agent verification typically takes 1-2 business days after submission.',
            },
            {
              q: 'When are commissions paid?',
              a: 'Commissions are calculated daily and paid out every Monday.',
            },
            {
              q: 'How can I increase my commission rate?',
              a: 'Commission rates increase based on sales volume. Check the performance rewards section.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

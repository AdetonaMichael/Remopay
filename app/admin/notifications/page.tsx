'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Send, Edit2, Plus, ChevronDown, X } from 'lucide-react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { useAuthStore } from '@/store/auth.store';
import { adminService } from '@/services/admin.service';
import { Spinner } from '@/components/shared/Spinner';
import { Modal } from '@/components/shared/Modal';
import { AdminUser } from '@/types/api.types';

interface NotificationStats {
  total?: number;
  unread?: number;
  read?: number;
  by_type?: Record<string, number>;
  by_priority?: Record<string, number>;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifStats, setNotifStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMode, setSendMode] = useState<'single' | 'bulk'>('single');
  
  // Users state for dropdown selection
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedSingleUser, setSelectedSingleUser] = useState<AdminUser | null>(null);
  const [selectedBulkUsers, setSelectedBulkUsers] = useState<AdminUser[]>([]);
  
  const [formData, setFormData] = useState({
    user_id: '',
    user_ids: '',
    title: '',
    body: '',
    type: 'system',
    priority: 'normal',
  });

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.some((role) => role === 'admin'));
  }, [user]);
 
   
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getNotificationStats();
        if (response?.data) {
          setNotifStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching notification stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch users when modal opens
  useEffect(() => {
    if (showSendModal && users.length === 0) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const response = await adminService.getUsers(1, 100); // Backend max per_page is 100
          console.log('Notifications - Full response:', response);
          
          // API structure: response = { success, data: [...users], pagination: {...} }
          // response.data IS the array of users!
          const usersArray = response?.data;
          
          if (Array.isArray(usersArray) && usersArray.length > 0) {
            console.log('Setting users:', usersArray);
            setUsers(usersArray);
          } else {
            console.log('No users array found or empty:', usersArray);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [showSendModal, users.length]);

  const handleSend = async () => {
    try {
      if (sendMode === 'single') {
        if (!selectedSingleUser || !formData.title || !formData.body) {
          alert('Please select a user and fill in all fields');
          return;
        }
        await adminService.sendNotificationToUser(
          Number(selectedSingleUser.id),
          formData.title,
          formData.body,
          formData.type,
          formData.priority
        );
      } else {
        if (selectedBulkUsers.length === 0 || !formData.title || !formData.body) {
          alert('Please select at least one user and fill in all fields');
          return;
        }
        const userIds = selectedBulkUsers.map((u) => Number(u.id));

        await adminService.sendNotificationToUsers(
          userIds,
          formData.title,
          formData.body,
          formData.type,
          formData.priority
        );
      }
      alert('Notification sent successfully!');
      setShowSendModal(false);
      setFormData({
        user_id: '',
        user_ids: '',
        title: '',
        body: '',
        type: 'system',
        priority: 'normal',
      });
      setSelectedSingleUser(null);
      setSelectedBulkUsers([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  const statsItems = [
    {
      title: 'Total Notifications',
      value: notifStats?.total || 0,
      icon: <Bell className="h-6 w-6" />,
      change: { value: '+12.5%', direction: 'up' as const },
    },
    {
      title: 'Unread',
      value: notifStats?.unread || 0,
      icon: <Bell className="h-6 w-6" />,
      change: { value: '-2.1%', direction: 'down' as const },
    },
    {
      title: 'Read',
      value: notifStats?.read || 0,
      icon: <Bell className="h-6 w-6" />,
      change: { value: '+15.3%', direction: 'up' as const },
    },
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] p-6 text-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <AdminHeader
        title="Notifications"
        description="Send and manage user notifications"
        action={{
          label: '+ Send Notification',
          onClick: () => setShowSendModal(true),
        }}
      />

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
              <Spinner />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Loading notification stats...
            </p>
          </div>
        </div>
      ) : (
        <>
          <AdminStats stats={statsItems} />

          {/* Notification Types */}
          {notifStats?.by_type && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications by Type
                </h3>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-x-visible md:gap-6 lg:grid-cols-5">
                  {Object.entries(notifStats.by_type).map(([type, count]) => (
                    <div
                      key={type}
                      className="min-w-[180px] snap-center md:min-w-0 rounded-lg border-2 border-[#d71927] bg-gradient-to-br from-[#d71927]/5 to-transparent p-4 text-center transition-all hover:shadow-lg hover:border-[#d71927]"
                    >
                      <p className="text-sm font-semibold text-[#d71927] capitalize">
                        {type}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-gray-900">
                        {count}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Priority Distribution */}
          {notifStats?.by_priority && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications by Priority
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {Object.entries(notifStats.by_priority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between rounded-lg border-l-4 border-l-[#d71927] bg-[#d71927]/5 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            priority === 'high'
                              ? 'danger'
                              : priority === 'normal'
                                ? 'info'
                                : 'warning'
                          }
                        >
                          {priority}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {priority === 'high'
                            ? 'High Priority'
                            : priority === 'normal'
                              ? 'Normal Priority'
                              : 'Low Priority'}{' '}
                          Notifications
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-x-visible md:gap-4 lg:grid-cols-3">
                <button
                  onClick={() => {
                    setSendMode('single');
                    setShowSendModal(true);
                  }}
                  className="min-w-max snap-center md:min-w-0 flex items-center gap-2 rounded-lg bg-[#d71927] px-4 py-3 font-medium text-white transition-all hover:bg-[#b01620] hover:shadow-lg focus:ring-2 focus:ring-[#d71927]/50 md:justify-center"
                >
                  <Send className="h-4 w-4" />
                  Send to User
                </button>
                <button
                  onClick={() => {
                    setSendMode('bulk');
                    setShowSendModal(true);
                  }}
                  className="min-w-max snap-center md:min-w-0 flex items-center gap-2 rounded-lg bg-[#d71927] px-4 py-3 font-medium text-white transition-all hover:bg-[#b01620] hover:shadow-lg focus:ring-2 focus:ring-[#d71927]/50 md:justify-center"
                >
                  <Send className="h-4 w-4" />
                  Send to Multiple
                </button>
                <button
                  disabled
                  className="min-w-max snap-center md:min-w-0 flex items-center gap-2 rounded-lg border-2 border-[#d71927] px-4 py-3 font-medium text-[#d71927] opacity-50 transition-all md:justify-center"
                >
                  <Edit2 className="h-4 w-4" />
                  Broadcast Campaign
                </button>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {showSendModal && (
        <Modal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSendMode('single');
            setFormData({
              user_id: '',
              user_ids: '',
              title: '',
              body: '',
              type: 'system',
              priority: 'normal',
            });
            setSelectedSingleUser(null);
            setSelectedBulkUsers([]);
            setSearchQuery('');
            setShowUserDropdown(false);
          }}
          title="Send Notification"
        >
          <div className="space-y-4">
            <div className="flex gap-2 border-b-2 border-gray-200">
              <button
                onClick={() => setSendMode('single')}
                className={`flex-1 rounded-t-lg px-4 py-3 font-medium transition-all ${
                  sendMode === 'single'
                    ? 'border-b-2 border-[#d71927] bg-[#d71927]/5 text-[#d71927]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single User
              </button>
              <button
                onClick={() => setSendMode('bulk')}
                className={`flex-1 rounded-t-lg px-4 py-3 font-medium transition-all ${
                  sendMode === 'bulk'
                    ? 'border-b-2 border-[#d71927] bg-[#d71927]/5 text-[#d71927]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multiple Users
              </button>
            </div>

            {sendMode === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-full flex items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:border-[#d71927] focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 transition"
                  >
                    <span>
                      {selectedSingleUser
                        ? `${selectedSingleUser.first_name} ${selectedSingleUser.last_name} (${selectedSingleUser.email})`
                        : 'Choose a user...'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserDropdown && (
                    <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 outline-none transition"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {loadingUsers ? (
                          <div className="flex items-center justify-center p-4">
                            <Spinner />
                          </div>
                        ) : users.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No users available
                          </div>
                        ) : (
                          users
                            .filter((u) =>
                              `${u.first_name} ${u.last_name} ${u.email}`
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSingleUser(u);
                                  setShowUserDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-[#d71927]/5 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition"
                              >
                                <div>
                                  <p className="font-medium">
                                    {u.first_name} {u.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                {selectedSingleUser?.id === u.id && (
                                  <div className="h-2 w-2 rounded-full bg-[#d71927]" />
                                )}
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-full flex items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:border-[#d71927] focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 transition"
                  >
                    <span>
                      {selectedBulkUsers.length > 0
                        ? `${selectedBulkUsers.length} user(s) selected`
                        : 'Choose users...'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserDropdown && (
                    <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 outline-none transition"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {loadingUsers ? (
                          <div className="flex items-center justify-center p-4">
                            <Spinner />
                          </div>
                        ) : users.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No users available
                          </div>
                        ) : (
                          users
                            .filter((u) =>
                              `${u.first_name} ${u.last_name} ${u.email}`
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map((u) => (
                              <label
                                key={u.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-900 hover:bg-[#d71927]/5 border-b border-gray-100 last:border-b-0 cursor-pointer transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedBulkUsers.some((su) => su.id === u.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBulkUsers([...selectedBulkUsers, u]);
                                    } else {
                                      setSelectedBulkUsers(
                                        selectedBulkUsers.filter((su) => su.id !== u.id)
                                      );
                                    }
                                  }}
                                  className="rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {u.first_name} {u.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </label>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedBulkUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedBulkUsers.map((u) => (
                      <Badge key={u.id} variant="danger" className="flex items-center gap-1">
                        {u.first_name} {u.last_name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBulkUsers(
                              selectedBulkUsers.filter((su) => su.id !== u.id)
                            )
                          }
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                placeholder="Notification message"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 transition"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 transition"
                >
                  <option value="system">System</option>
                  <option value="transaction">Transaction</option>
                  <option value="promotion">Promotion</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/20 transition"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSend}
                className="flex-1 rounded-lg bg-[#d71927] px-4 py-2 font-medium text-white transition-all hover:bg-[#b01620] focus:ring-2 focus:ring-[#d71927]/50"
              >
                Send Notification
              </button>
              <button
                className="flex-1 rounded-lg border-2 border-[#d71927] px-4 py-2 font-medium text-[#d71927] transition-all hover:bg-[#d71927]/5 focus:ring-2 focus:ring-[#d71927]/50"
                onClick={() => {
                  setShowSendModal(false);
                  setSendMode('single');
                  setFormData({
                    user_id: '',
                    user_ids: '',
                    title: '',
                    body: '',
                    type: 'system',
                    priority: 'normal',
                  });
                  setSelectedSingleUser(null);
                  setSelectedBulkUsers([]);
                  setSearchQuery('');
                  setShowUserDropdown(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

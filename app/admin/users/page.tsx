'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Shield,
  Users2,
  UserCheck,
  UserMinus,
  ShieldCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Bell,
  Trash2,
  X,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';
import { Modal } from '@/components/shared/Modal';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Spinner } from '@/components/shared/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { useAlert } from '@/hooks/useAlert';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/format.utils';
import type { AdminUser } from '@/types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = 'active' | 'suspended' | 'inactive';
type BulkAction = 'verify' | 'unverify' | 'delete';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(
  status?: UserStatus | string
): 'success' | 'danger' | 'warning' | 'info' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    active: 'success',
    suspended: 'danger',
    inactive: 'warning',
  };
  return map[status ?? ''] ?? 'info';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showAlert } = useAlert();

  // ── State - Data ────────────────────────────────────────────────────────────

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [userDetails, setUserDetails] = useState<AdminUser | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── State - Filters ─────────────────────────────────────────────────────────

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // ── State - Selected User ───────────────────────────────────────────────────

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string | number>>(new Set());
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkAction>('verify');

  // ── State - Modals ──────────────────────────────────────────────────────────

  const [showDetails, setShowDetails] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);

  // ── State - Form Data ───────────────────────────────────────────────────────

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    type: 'system',
    priority: 'normal',
    send_push: true,
    send_email: false,
  });

  const [emailData, setEmailData] = useState({
    title: '',
    body: '',
    template: 'admin-custom',
  });

  // ── State - Loading ─────────────────────────────────────────────────────────

  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────────────

  const isAdmin = useMemo(
    () => Boolean(user?.roles?.some((role) => role === 'admin')),
    [user]
  );

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin, router]);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const filters: any = {
        search: searchTerm,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (verificationFilter !== 'all') {
        filters.verified = verificationFilter === 'verified';
      }

      const response = await adminService.getUsers(page, 50, filters);

      if (response?.data) {
        const userData = Array.isArray(response.data)
          ? response.data
          : response.data.data ?? [];
        setUsers(userData);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.last_page ?? 1);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await adminService.getRoles();

      let rolesData = [];
      if (Array.isArray(response)) {
        rolesData = response;
      } else if (Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response?.data && Array.isArray(response.data)) {
        rolesData = response.data;
      }

      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showAlert('Failed to fetch roles', 'error');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUserDetails = async (userId: string | number) => {
    try {
      const response = await adminService.getUser(String(userId));
      if (response?.data) {
        const details = response.data.user || response.data.data || response.data;
        setUserDetails(details);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showAlert('Failed to fetch user details', 'error');
    }
  };

  const fetchUserTransactions = async (userId: string | number) => {
    try {
      setLoadingTransactions(true);
      const response = await adminService.getUserTransactions(String(userId), 1, 20);
      if (response?.data) {
        const txns = Array.isArray(response.data) ? response.data : response.data.data ?? [];
        setUserTransactions(txns);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('Failed to fetch transactions', 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, verificationFilter]);

  // ── Action Handlers ────────────────────────────────────────────────────────

  const handleOpenDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    await fetchUserDetails(user.id);
    setShowDetails(true);
  };

  const handleOpenRoleModal = async (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRole('');

    if (roles.length === 0) {
      await fetchRoles();
    }

    setShowRoleModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setLoadingAction(true);
      await adminService.changeUserRole(selectedUser.id, selectedRole);
      showAlert('Role changed successfully', 'success');
      setShowRoleModal(false);
      setSelectedRole('');
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error assigning role:', error);
      showAlert('Failed to change user role', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleOpenNotificationModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNotificationData({
      title: '',
      body: '',
      type: 'system',
      priority: 'normal',
      send_push: true,
      send_email: false,
    });
    setShowNotificationModal(true);
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationData.title || !notificationData.body) {
      showAlert('Please fill all required fields', 'warning');
      return;
    }

    try {
      setLoadingAction(true);
      await adminService.sendNotificationWithData(selectedUser.id, {
        title: notificationData.title,
        body: notificationData.body,
        type: notificationData.type,
        priority: notificationData.priority as 'high' | 'normal' | 'low',
        send_push: notificationData.send_push,
        send_email: notificationData.send_email,
      });
      showAlert('Notification sent successfully', 'success');
      setShowNotificationModal(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      showAlert('Failed to send notification', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleOpenEmailModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEmailData({
      title: '',
      body: '',
      template: 'admin-custom',
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailData.title || !emailData.body) {
      showAlert('Please fill all required fields', 'warning');
      return;
    }

    try {
      setLoadingAction(true);
      await adminService.sendEmailToUser(selectedUser.id, {
        title: emailData.title,
        body: emailData.body,
        send_email: true,
        email_template: emailData.template,
      });
      showAlert('Email sent successfully', 'success');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      showAlert('Failed to send email', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setLoadingAction(true);
      await adminService.updateUser(String(selectedUser.id), editFormData);
      showAlert('User updated successfully', 'success');
      setShowEditModal(false);
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error updating user:', error);
      showAlert('Failed to update user', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleOpenTransactionsModal = async (user: AdminUser) => {
    setSelectedUser(user);
    await fetchUserTransactions(user.id);
    setShowTransactionsModal(true);
  };

  const toggleUserSelection = (userId: string | number) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleExecuteBulkAction = async () => {
    if (selectedUsers.size === 0) {
      showAlert('Please select at least one user', 'warning');
      return;
    }

    try {
      setLoadingAction(true);
      await adminService.bulkUserAction(
        Array.from(selectedUsers) as number[],
        selectedBulkAction
      );
      showAlert(`Bulk action '${selectedBulkAction}' completed successfully`, 'success');
      setShowBulkActionModal(false);
      setSelectedUsers(new Set());
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error executing bulk action:', error);
      showAlert(`Failed to execute bulk action`, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${user.first_name} ${user.last_name}?`
      )
    ) {
      return;
    }

    try {
      setLoadingAction(true);
      await adminService.deleteUser(String(user.id));
      showAlert('User deleted successfully', 'success');
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('Failed to delete user', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone_number ?? '').includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    const active = users.filter((u) => u.status === 'active' || !u.status).length;
    const suspended = users.filter((u) => u.status === 'suspended').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    return { total: users.length, active, suspended, inactive };
  }, [users]);

  // ── Guard render ────────────────────────────────────────────────────────────

  if (!isAdmin) return null;

  if (loading) {
    return <TableSkeleton rows={6} cols={5} />;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen space-y-8 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <section className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 md:overflow-x-visible xl:grid-cols-4">
        {[
          {
            title: 'All Users',
            value: summary.total,
            note: 'Registered user accounts',
            Icon: Users2,
          },
          {
            title: 'Active Accounts',
            value: summary.active,
            note: 'Users currently active',
            Icon: UserCheck,
          },
          {
            title: 'Suspended Accounts',
            value: summary.suspended,
            note: 'Restricted user accounts',
            Icon: ShieldCheck,
          },
          {
            title: 'Inactive Accounts',
            value: summary.inactive,
            note: 'Dormant or unused accounts',
            Icon: UserMinus,
          },
        ].map(({ title, value, note, Icon }) => (
          <Card
            key={title}
            className="min-w-full snap-start rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] md:min-w-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">{title}</p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827]">
                  {value}
                </p>
                <p className="mt-2 text-sm text-[#6b7280]">{note}</p>
              </div>
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <Icon className="h-5 w-5 text-[#4a5ff7]" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <Card className="rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Filters
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Search by name, email, or phone and narrow results by status and verification.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px_160px]">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              size={18}
            />
            <Input
              label="Search"
              placeholder="Search by name, email, or phone…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Status
            </label>
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                size={18}
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | UserStatus);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#d1d5db] bg-white pl-11 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Verification */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Verified
            </label>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value as 'all' | 'verified' | 'unverified');
                setCurrentPage(1);
              }}
              className="h-11 w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-2 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Bulk Actions Button */}
          <div className="flex items-end">
            <Button
              variant={selectedUsers.size > 0 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowBulkActionModal(true)}
              disabled={selectedUsers.size === 0}
              className="w-full"
            >
              Actions ({selectedUsers.size})
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-[28px] border border-[#e5e7eb] bg-white p-0 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#f1f5f9] px-6 py-5">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            User Records
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage user accounts, send communications, and update user information.
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eef2ff]">
              <Users2 className="h-8 w-8 text-[#4a5ff7]" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#111827]">
              No users found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#6b7280]">
              No users match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#fcfcfd]">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleAllUsers}
                        className="h-4 w-4 rounded border-[#d1d5db] text-[#4a5ff7]"
                      />
                    </th>
                    {[
                      'User',
                      'Email',
                      'Phone',
                      'Status',
                      'Verified',
                      'Joined',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280] ${
                          h === 'Actions' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[#f8fafc] transition-colors hover:bg-[#fafafa]"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                          className="h-4 w-4 rounded border-[#d1d5db] text-[#4a5ff7]"
                        />
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-sm font-bold text-[#4a5ff7]">
                            {u.first_name.charAt(0)}
                            {u.last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-xs text-[#9ca3af]">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {u.email}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {u.phone_number ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(u.status)} size="sm">
                          {u.status ?? 'active'}
                        </Badge>
                      </td>

                      {/* Verified */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={u.is_verified ? 'success' : 'warning'}
                          size="sm"
                        >
                          {u.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {formatDate(u.created_at ?? '')}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetails(u)}
                            title="View Details"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[#4a5ff7] transition hover:bg-[#eef2ff]"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenNotificationModal(u)}
                            title="Send Notification"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f1f5f9]"
                          >
                            <Bell size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEmailModal(u)}
                            title="Send Email"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f1f5f9]"
                          >
                            <Mail size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenRoleModal(u)}
                            title="Change Role"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f1f5f9]"
                          >
                            <Shield size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 p-4 xl:hidden">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-[22px] border border-[#edf2f7] bg-[#fcfcfd] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="h-4 w-4 rounded border-[#d1d5db] text-[#4a5ff7]"
                      />
                      <div>
                        <p className="text-base font-bold text-[#111827]">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-sm text-[#6b7280]">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(u.status)} size="sm">
                      {u.status ?? 'active'}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-[#111827]">
                        {u.phone_number ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
                        Verified
                      </p>
                      <p className="mt-1">
                        <Badge
                          variant={u.is_verified ? 'success' : 'warning'}
                          size="sm"
                        >
                          {u.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-xs text-[#6b7280]">
                      Joined {formatDate(u.created_at ?? '')}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenDetails(u)}
                        className="rounded-lg p-2 text-[#4a5ff7] transition hover:bg-[#eef2ff]"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenNotificationModal(u)}
                        className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f1f5f9]"
                      >
                        <Bell size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEmailModal(u)}
                        className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f1f5f9]"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-[24px] border border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#6b7280]">
          Showing{' '}
          <span className="font-semibold text-[#111827]">
            {filteredUsers.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-[#111827]">{users.length}</span>{' '}
          users
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-[#d1d5db] px-4"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="rounded-xl bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#111827]">
            {currentPage} / {totalPages}
          </div>

          <Button
            variant="outline"
            className="h-11 rounded-xl border-[#d1d5db] px-4"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* ── User Details Modal ───────────────────────────────────────────── */}
      {showDetails && userDetails && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="User Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="mb-4 font-semibold text-[#111827]">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                    First Name
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#111827]">
                    {userDetails.first_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                    Last Name
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#111827]">
                    {userDetails.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#111827]">
                    {userDetails.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#111827]">
                    {userDetails.phone_number ?? 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Verification */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Status
                </p>
                <p className="mt-2">
                  <Badge variant={getStatusVariant(userDetails.status)}>
                    {userDetails.status ?? 'active'}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Verification
                </p>
                <p className="mt-2">
                  <Badge
                    variant={userDetails.is_verified ? 'success' : 'warning'}
                  >
                    {userDetails.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Statistics */}
            {userDetails.statistics && (
              <div>
                <h3 className="mb-4 font-semibold text-[#111827]">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[#e5e7eb] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                      Total Transactions
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#111827]">
                      {userDetails.statistics.total_transactions}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e5e7eb] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                      Successful
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#111827]">
                      {userDetails.statistics.successful_transactions}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e5e7eb] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                      Total Spending
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#111827]">
                      ₦{userDetails.statistics.total_spending.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e5e7eb] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                      Wallet Balance
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#111827]">
                      ₦{userDetails.statistics.wallet_balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowDetails(false);
                  handleOpenEditModal(userDetails);
                }}
                className="flex-1"
              >
                Edit User
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDetails(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Send Notification Modal ──────────────────────────────────────── */}
      {showNotificationModal && selectedUser && (
        <Modal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title="Send Notification"
          size="md"
        >
          <div className="space-y-5">
            {/* User Info */}
            <div className="rounded-lg bg-[#f8fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                To
              </p>
              <p className="mt-2 text-sm font-medium text-[#111827]">
                {selectedUser.first_name} {selectedUser.last_name}
              </p>
              <p className="text-xs text-[#6b7280]">{selectedUser.email}</p>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Title
              </label>
              <Input
                placeholder="Notification title..."
                value={notificationData.title}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, title: e.target.value })
                }
              />
            </div>

            {/* Body */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Message
              </label>
              <textarea
                placeholder="Notification message..."
                value={notificationData.body}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, body: e.target.value })
                }
                rows={4}
                className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Type
              </label>
              <select
                value={notificationData.type}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, type: e.target.value })
                }
                className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
              >
                <option value="system">System</option>
                <option value="promotional">Promotional</option>
                <option value="security">Security</option>
                <option value="update">Update</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationData.send_push}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      send_push: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#d1d5db]"
                />
                <span className="text-sm font-medium text-[#111827]">
                  Send as push notification
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationData.send_email}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      send_email: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#d1d5db]"
                />
                <span className="text-sm font-medium text-[#111827]">
                  Also send as email
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleSendNotification}
                disabled={loadingAction}
                className="flex-1"
              >
                {loadingAction ? (
                  <>
                    <Spinner />
                    Sending...
                  </>
                ) : (
                  'Send Notification'
                )}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowNotificationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Send Email Modal ──────────────────────────────────────────────── */}
      {showEmailModal && selectedUser && (
        <Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title="Send Email"
          size="md"
        >
          <div className="space-y-5">
            {/* User Info */}
            <div className="rounded-lg bg-[#f8fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                To
              </p>
              <p className="mt-2 text-sm font-medium text-[#111827]">
                {selectedUser.email}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Subject
              </label>
              <Input
                placeholder="Email subject..."
                value={emailData.title}
                onChange={(e) =>
                  setEmailData({ ...emailData, title: e.target.value })
                }
              />
            </div>

            {/* Body */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Message
              </label>
              <textarea
                placeholder="Email message..."
                value={emailData.body}
                onChange={(e) =>
                  setEmailData({ ...emailData, body: e.target.value })
                }
                rows={4}
                className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
              />
            </div>

            {/* Template */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Template
              </label>
              <select
                value={emailData.template}
                onChange={(e) =>
                  setEmailData({ ...emailData, template: e.target.value })
                }
                className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
              >
                <option value="admin-custom">Custom Admin</option>
                <option value="security">Security Alert</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleSendEmail}
                disabled={loadingAction}
                className="flex-1"
              >
                {loadingAction ? (
                  <>
                    <Spinner />
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowEmailModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="md"
        >
          <div className="space-y-5">
            {/* First Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                First Name
              </label>
              <Input
                value={editFormData.first_name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    first_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Last Name
              </label>
              <Input
                value={editFormData.last_name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    last_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Email
              </label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Phone Number
              </label>
              <Input
                value={editFormData.phone_number}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateUser}
                disabled={loadingAction}
                className="flex-1"
              >
                {loadingAction ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Assign Role Modal ────────────────────────────────────────────── */}
      {showRoleModal && selectedUser && (
        <Modal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title="Assign Role to User"
          size="md"
        >
          <div className="space-y-5">
            {/* User Info */}
            <div className="rounded-lg bg-[#f8fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                User
              </p>
              <p className="mt-2 text-sm font-medium text-[#111827]">
                {selectedUser.first_name} {selectedUser.last_name}
              </p>
              <p className="text-xs text-[#6b7280]">{selectedUser.email}</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Select Role
              </label>
              {loadingRoles ? (
                <div className="flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] py-8">
                  <Spinner />
                  <span className="ml-2 text-sm text-[#6b7280]">Loading roles…</span>
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-lg border border-[#fcd34d] bg-[#fef3c7] p-4 text-sm text-[#92400e]">
                  No roles available. Please contact an administrator.
                </div>
              ) : (
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#111827] transition focus:border-[#4a5ff7] focus:ring-4 focus:ring-[#4a5ff7]/10"
                >
                  <option value="">Select a role…</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleAssignRole}
                disabled={!selectedRole || loadingAction}
                className="flex-1"
              >
                {loadingAction ? (
                  <>
                    <Spinner />
                    Assigning...
                  </>
                ) : (
                  'Assign Role'
                )}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowRoleModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Transactions Modal ───────────────────────────────────────────── */}
      {showTransactionsModal && selectedUser && (
        <Modal
          isOpen={showTransactionsModal}
          onClose={() => setShowTransactionsModal(false)}
          title={`Transactions - ${selectedUser.first_name} ${selectedUser.last_name}`}
          size="lg"
        >
          <div className="space-y-4">
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
                <span className="ml-2 text-sm text-[#6b7280]">Loading transactions…</span>
              </div>
            ) : userTransactions.length === 0 ? (
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] py-8 text-center">
                <p className="text-sm text-[#6b7280]">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="rounded-lg border border-[#e5e7eb] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-[#111827]">
                          {txn.transaction_type || txn.type}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          Ref: {txn.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#111827]">
                          ₦{txn.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            txn.status === 'success'
                              ? 'success'
                              : txn.status === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#6b7280]">
                      {formatDate(txn.created_at || txn.transaction_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowTransactionsModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Bulk Action Modal ────────────────────────────────────────────── */}
      {showBulkActionModal && (
        <Modal
          isOpen={showBulkActionModal}
          onClose={() => setShowBulkActionModal(false)}
          title="Bulk User Action"
          size="md"
        >
          <div className="space-y-5">
            <div className="rounded-lg bg-[#f8fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Selected Users
              </p>
              <p className="mt-2 text-lg font-bold text-[#111827]">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Action Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                Select Action
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: 'verify' as BulkAction,
                    label: 'Verify Users',
                    icon: CheckCircle,
                  },
                  {
                    value: 'unverify' as BulkAction,
                    label: 'Unverify Users',
                    icon: X,
                  },
                  {
                    value: 'delete' as BulkAction,
                    label: 'Delete Users',
                    icon: Trash2,
                  },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] p-3 cursor-pointer transition hover:bg-[#f8fafc]"
                  >
                    <input
                      type="radio"
                      name="bulk-action"
                      value={value}
                      checked={selectedBulkAction === value}
                      onChange={(e) =>
                        setSelectedBulkAction(e.target.value as BulkAction)
                      }
                      className="h-4 w-4"
                    />
                    <Icon size={18} className="text-[#6b7280]" />
                    <span className="text-sm font-medium text-[#111827]">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {selectedBulkAction === 'delete' && (
              <div className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] p-4">
                <p className="text-sm font-medium text-[#991b1b]">
                  ⚠️ Warning: This action cannot be undone. All selected users will be permanently deleted.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant={selectedBulkAction === 'delete' ? 'danger' : 'primary'}
                size="md"
                onClick={handleExecuteBulkAction}
                disabled={loadingAction}
                className="flex-1"
              >
                {loadingAction ? (
                  <>
                    <Spinner />
                    Processing...
                  </>
                ) : (
                  'Execute Action'
                )}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowBulkActionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

const sidebarItems = [
  { to: '/admin', icon: Activity, label: 'Overview', active: true },
  { to: '/admin/users', icon: Users, label: 'User Management', active: false },
  { to: '/admin/events', icon: Calendar, label: 'Event Moderation', active: false },
  { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics', active: false },
  { to: '/admin/reports', icon: Shield, label: 'Reports', active: false },
];

const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/analytics/platform`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();

        setStats({
          totalUsers: data.overview.total_users,
          totalEvents: data.overview.total_events,
          activeEvents: data.overview.published_events,
          pendingEvents: data.overview.pending_events,
          totalRevenue: data.overview.revenue,
          completedTickets: data.overview.completed_tickets,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 m-6 rounded">
          {error}
        </div>
      )}
      <h1 className="text-2xl font-bold p-6">Admin Dashboard</h1>
    </div>
  );
};

export default AdminDashboard;

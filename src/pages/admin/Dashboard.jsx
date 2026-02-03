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
          <span className="text-[#6F7287]">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F05537] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-sm text-[#6F7287]">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-[#F05537]/10 text-[#F05537]'
                        : 'text-[#6F7287] hover:bg-[#F8F7FA]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
                {error}
              </div>
            )}

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/70">
                Manage users, moderate events, and monitor platform performance.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

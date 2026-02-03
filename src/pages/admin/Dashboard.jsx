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
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/helpers';
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
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const analyticsRes = await fetch(
          `${API_BASE_URL}/analytics/platform`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');

        const analytics = await analyticsRes.json();

        setStats({
          totalUsers: analytics.overview.total_users,
          totalEvents: analytics.overview.total_events,
          activeEvents: analytics.overview.published_events,
          pendingEvents: analytics.overview.pending_events,
          totalRevenue: analytics.overview.revenue,
          completedTickets: analytics.overview.completed_tickets,
        });

        const eventsRes = await fetch(
          `${API_BASE_URL}/moderation/events/pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setRecentEvents(eventsData.events?.slice(0, 5) || []);
        }

        const usersRes = await fetch(
          `${API_BASE_URL}/users/recent`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setRecentUsers(usersData.users?.slice(0, 5) || []);
        }
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
          <aside className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F05537] rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || 'Admin'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="text-xs font-bold text-red-600">
                      ADMINISTRATOR
                    </span>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      item.active
                        ? 'bg-red-100 text-red-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Welcome */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl p-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-white/70">
                Monitor platform performance and moderation
              </p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Stat label="Users" value={stats.totalUsers} />
                <Stat label="Events" value={stats.totalEvents} />
                <Stat label="Published" value={stats.activeEvents} />
                <Stat label="Pending" value={stats.pendingEvents} />
                <Stat
                  label="Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                />
                <Stat label="Tickets" value={stats.completedTickets} />
              </div>
            )}

            {/* Pending alert */}
            {stats?.pendingEvents > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
                <AlertTriangle className="text-orange-500" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {stats.pendingEvents} events pending approval
                  </p>
                </div>
                <Link to="/admin/events">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Review
                  </Button>
                </Link>
              </div>
            )}

            {/* Recent lists */}
            <div className="grid lg:grid-cols-2 gap-6">
              <RecentEvents events={recentEvents} />
              <RecentUsers users={recentUsers} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const RecentEvents = ({ events }) => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="p-6 border-b flex justify-between">
      <h2 className="font-semibold">Recent Events</h2>
      <Link to="/admin/events" className="text-red-600 text-sm">
        View All
      </Link>
    </div>
    <div className="p-6 space-y-3">
      {events.length ? (
        events.map((e) => (
          <div key={e.id} className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No pending events</p>
      )}
    </div>
  </div>
);

const RecentUsers = ({ users }) => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="p-6 border-b flex justify-between">
      <h2 className="font-semibold">Recent Users</h2>
      <Link to="/admin/users" className="text-red-600 text-sm">
        View All
      </Link>
    </div>
    <div className="p-6 space-y-3">
      {users.length ? (
        users.map((u) => (
          <div key={u.id} className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No recent users</p>
      )}
    </div>
  </div>
);

export default AdminDashboard;

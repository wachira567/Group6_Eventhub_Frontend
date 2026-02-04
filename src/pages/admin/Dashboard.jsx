import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, DollarSign, Shield, Activity, ChevronRight, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
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
        
        // Fetch platform analytics
        const response = await fetch(`${API_BASE_URL}/analytics/platform`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        
        setStats({
          totalUsers: data.overview.total_users,
          totalEvents: data.overview.total_events,
          activeEvents: data.overview.published_events,
          pendingEvents: data.overview.pending_events,
          totalRevenue: data.overview.revenue,
          completedTickets: data.overview.completed_tickets,
        });

        // Fetch recent events (pending approval)
        const eventsRes = await fetch(`${API_BASE_URL}/moderation/events/pending`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setRecentEvents(eventsData.events?.slice(0, 5) || []);
        }

        // Fetch recent users
        const usersRes = await fetch(`${API_BASE_URL}/users/recent`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setRecentUsers(usersData.users?.slice(0, 5) || []);
        }

      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">{user?.name || 'Admin'}</p>
                    <p className="text-sm text-[#6F7287]">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs uppercase font-bold">
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
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/70">
                Manage users, moderate events, and monitor platform performance.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Total Users</p>
                  <p className="text-2xl font-bold text-[#1E0A3C]">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Total Events</p>
                  <p className="text-2xl font-bold text-[#1E0A3C]">{stats.totalEvents}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Published Events</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeEvents}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Pending</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.pendingEvents}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#F05537]">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedTickets}</p>
                </div>
              </div>
            )}

            {/* Pending Events Alert */}
            {stats?.pendingEvents > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-800">
                    {stats.pendingEvents} events pending approval
                  </p>
                  <p className="text-sm text-orange-600">
                    Review and approve events waiting for moderation.
                  </p>
                </div>
                <Link to="/admin/events">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Review Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-[#E6E5E8] flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1E0A3C]">Recent Events</h2>
                  <Link to="/admin/events" className="text-[#F05537] hover:text-[#D94E32] text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg">
                          <div>
                            <p className="font-medium text-[#39364F]">{event.title}</p>
                            <p className="text-sm text-[#6F7287]">
                              {event.organizer?.name || 'Unknown'} • {new Date(event.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Pending
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#6F7287] text-center py-4">No pending events</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-[#E6E5E8] flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1E0A3C]">Recent Users</h2>
                  <Link to="/admin/users" className="text-[#F05537] hover:text-[#D94E32] text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F05537] rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-[#39364F]">{user.name}</p>
                              <p className="text-sm text-[#6F7287]">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              user.role === 'organizer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#6F7287] text-center py-4">No recent users</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

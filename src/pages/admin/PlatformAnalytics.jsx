import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, Users, Calendar, DollarSign, Ticket, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';

const PlatformAnalytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/platform`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span className="text-[#6F7287]">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
        Error loading analytics: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#1E0A3C] mb-6">Platform Analytics</h1>

        {/* Overview Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Total Users</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics.overview.total_users?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +{analytics.overview.new_users_week || 0} this week
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Total Events</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics.overview.total_events || 0}</p>
              <p className="text-xs text-[#6F7287] mt-1">{analytics.overview.published_events || 0} published</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Revenue</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{formatCurrency(analytics.overview.revenue || 0)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Tickets Sold</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics.overview.completed_tickets?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {/* Monthly Revenue */}
        {analytics && analytics.monthly_revenue && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1E0A3C]">Monthly Revenue</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-[#D2D2D6] rounded-lg text-sm"
              >
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E5E8]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Month</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6F7287]">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthly_revenue.map((month) => (
                    <tr key={month.month} className="border-b border-[#E6E5E8] last:border-0">
                      <td className="py-3 px-4 text-[#39364F] font-medium">{month.month}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#F05537]">{formatCurrency(month.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;

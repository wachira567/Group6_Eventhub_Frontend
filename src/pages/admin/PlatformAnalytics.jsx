import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, TrendingUp, Users, Calendar, DollarSign, Eye, Ticket, ArrowUp, BarChart3, Loader2 } from 'lucide-react';
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
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/platform`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.stats || data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
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

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#1E0A3C] mb-6">Platform Analytics</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
            Error loading analytics: {error}
          </div>
        )}

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
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics?.users?.total?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +{analytics?.users?.new || 0} new
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Total Events</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics?.events?.total || 0}</p>
              <p className="text-xs text-[#6F7287] mt-1">
                {analytics?.events?.published || 0} published
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Revenue</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{formatCurrency(analytics?.revenue?.total || 0)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-[#6F7287]">Tickets Sold</p>
              </div>
              <p className="text-2xl font-bold text-[#1E0A3C]">{analytics?.tickets?.total_valid?.toLocaleString() || 0}</p>
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

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Events by Category */}
          {analytics && analytics.events_by_category && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1E0A3C] mb-4">Events by Category</h2>
              <div className="space-y-4">
                {Object.entries(analytics.events_by_category).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F05537]/10 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-[#F05537]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#39364F]">{category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1E0A3C]">{count} events</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Events */}
          {analytics && analytics.top_events && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1E0A3C] mb-4">Top Events by Tickets</h2>
              <div className="space-y-4">
                {analytics.top_events.length > 0 ? (
                  analytics.top_events.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-[#F05537] text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-[#39364F]">{event.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#F05537]">{event.tickets} tickets</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#6F7287] text-center py-4">No event data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;

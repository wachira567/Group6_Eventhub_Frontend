import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, Users, Calendar, DollarSign, Ticket, ArrowUp, BarChart3, Loader2 } from 'lucide-react';
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

        {/* Overview Stats & Monthly Revenue (Commits 1–5) */}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Events by Category (Commit 6) */}

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

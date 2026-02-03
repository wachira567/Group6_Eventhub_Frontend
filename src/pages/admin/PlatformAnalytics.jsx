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

  return <div>Platform Analytics Component</div>;
};

export default PlatformAnalytics;

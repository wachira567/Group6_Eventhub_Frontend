import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Users, DollarSign, Ticket, Calendar, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import { toast } from 'sonner';

const EventAnalytics = () => {
  const { id } = useParams();
  const [timeRange, setTimeRange] = useState('7d');
  const [salesFilter, setSalesFilter] = useState('revenue');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEventAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/event/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setEvent(data.event);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEventAnalytics();
  };

  useEffect(() => {
    fetchEventAnalytics();
  }, [id]);

  // Filter daily sales based on time range (show from current date backwards)
  const getFilteredDailySales = () => {
    if (!analytics?.daily_sales) return [];
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    // Take the last N days (most recent) and reverse to show from current date first
    return analytics.daily_sales.slice(-days).reverse();
  };

  // Calculate summary stats from real data
  const getSummaryStats = () => {
    if (!analytics?.overview) {
      return {
        ticketsSold: 0,
        totalTickets: 0,
        revenue: 0,
      };
    }

    const { overview } = analytics;
    return {
      ticketsSold: overview.tickets_sold || 0,
      totalTickets: overview.total_tickets || 0,
      revenue: overview.revenue || 0,
    };
  };

  const summary = getSummaryStats();
  const filteredDailySales = getFilteredDailySales();

  // Calculate max value for graph scaling
  const maxValue = useMemo(() => {
    if (filteredDailySales.length === 0) return 0;
    return Math.max(...filteredDailySales.map(day => 
      salesFilter === 'revenue' ? day.revenue : day.tickets
    ));
  }, [filteredDailySales, salesFilter]);

  // Calculate graph data
  const graphData = useMemo(() => {
    return filteredDailySales.map((day, index) => {
      const value = salesFilter === 'revenue' ? day.revenue : day.tickets;
      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
      const isHighest = value === maxValue && maxValue > 0;
      
      return {
        ...day,
        value,
        height,
        isHighest,
        label: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }, [filteredDailySales, maxValue, salesFilter]);

  // Calculate summary stats for the graph
  const graphSummary = useMemo(() => {
    if (filteredDailySales.length === 0) {
      return { total: 0, average: 0, best: 0 };
    }
    
    const total = filteredDailySales.reduce((sum, day) => sum + (salesFilter === 'revenue' ? day.revenue : day.tickets), 0);
    const average = Math.round(total / filteredDailySales.length);
    const best = maxValue;
    
    return { total, average, best };
  }, [filteredDailySales, maxValue, salesFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/organizer/my-events"
            className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Events
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <OrganizerSidebar />
            <div className="flex-1 flex items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-[#F05537] animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || !event) {
    return (
      <div className="min-h-screen bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/organizer/my-events"
            className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Events
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <OrganizerSidebar />
            <div className="flex-1">
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <BarChart3 className="w-16 h-16 text-[#A9A8B3] mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-[#1E0A3C] mb-2">Analytics Not Available</h2>
                <p className="text-[#6F7287] mb-4">Unable to load analytics data for this event.</p>
                <Button onClick={fetchEventAnalytics} className="bg-[#F05537] hover:bg-[#D94E32]">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/organizer/my-events"
            className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537]"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Events
          </Link>
          
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Event Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-6">
                <img
                  src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
                  alt={event.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-[#1E0A3C]">{event.title}</h1>
                  <p className="text-[#6F7287]">{formatDate(event.start_date)}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats - Only Tickets Sold and Revenue */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">
                  {summary.ticketsSold}/{summary.totalTickets}
                </p>
                <div className="w-full bg-[#E6E5E8] rounded-full h-2 mt-2">
                  <div
                    className="bg-[#F05537] h-2 rounded-full"
                    style={{ width: `${summary.totalTickets > 0 ? (summary.ticketsSold / summary.totalTickets) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Revenue</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">{formatCurrency(summary.revenue)}</p>
                <p className="text-xs text-[#6F7287] mt-1">From completed sales</p>
              </div>
            </div>

            {/* Ticket Sales Breakdown - Full Width */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-[#1E0A3C] mb-4">Ticket Sales by Type</h2>
              <div className="space-y-4">
                {analytics.ticket_sales?.length > 0 ? (
                  analytics.ticket_sales.map((ticket) => (
                    <div key={ticket.type} className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg">
                      <div>
                        <p className="font-medium text-[#39364F]">{ticket.type}</p>
                        <p className="text-sm text-[#6F7287]">{ticket.sold} sold of {ticket.total}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#F05537]">{formatCurrency(ticket.revenue)}</p>
                        <div className="w-24 bg-[#E6E5E8] rounded-full h-2 mt-1">
                          <div
                            className="bg-[#F05537] h-2 rounded-full"
                            style={{ width: `${ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#6F7287] text-center py-4">No ticket sales yet</p>
                )}
              </div>
            </div>

            {/* Daily Sales Graph */}
            <div className="bg-white rounded-xl p-6 shadow-sm" key={`${timeRange}-${salesFilter}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1E0A3C]">Daily Sales</h2>
                <div className="flex items-center gap-3">
                  {/* Filter by metric */}
                  <div className="flex items-center bg-[#F8F7FA] rounded-lg p-1">
                    <button
                      onClick={() => setSalesFilter('revenue')}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        salesFilter === 'revenue'
                          ? 'bg-[#F05537] text-white'
                          : 'text-[#6F7287] hover:text-[#1E0A3C]'
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setSalesFilter('tickets')}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        salesFilter === 'tickets'
                          ? 'bg-[#F05537] text-white'
                          : 'text-[#6F7287] hover:text-[#1E0A3C]'
                      }`}
                    >
                      Tickets
                    </button>
                  </div>
                  {/* Time range filter */}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border border-[#D2D2D6] rounded-lg text-sm bg-white"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
              
              {/* Graph */}
              {graphData.length > 0 ? (
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-[#6F7287]">
                    <span>{salesFilter === 'revenue' ? formatCurrency(maxValue) : maxValue}</span>
                    <span>{salesFilter === 'revenue' ? formatCurrency(Math.round(maxValue * 0.75)) : Math.round(maxValue * 0.75)}</span>
                    <span>{salesFilter === 'revenue' ? formatCurrency(Math.round(maxValue * 0.5)) : Math.round(maxValue * 0.5)}</span>
                    <span>{salesFilter === 'revenue' ? formatCurrency(Math.round(maxValue * 0.25)) : Math.round(maxValue * 0.25)}</span>
                    <span>0</span>
                  </div>
                  
                  {/* Bar chart */}
                  <div className="ml-20">
                    <div className="flex items-end justify-between h-48 gap-2">
                      {graphData.map((day) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#1E0A3C] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatDate(day.date)}: {salesFilter === 'revenue' ? formatCurrency(day.revenue) : `${day.tickets} tickets`}
                          </div>
                          
                          {/* Bar */}
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              day.isHighest ? 'bg-[#F05537]' : 'bg-[#8B8B95]'
                            }`}
                            style={{ height: `${day.height}%`, minHeight: day.height > 0 ? '4px' : '0' }}
                          />
                          
                          {/* Date label */}
                          <span className="text-xs text-[#6F7287] mt-2 truncate w-full text-center">
                            {day.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary stats below graph */}
                  <div className="mt-6 pt-4 border-t border-[#E6E5E8] grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-[#6F7287]">Total {salesFilter === 'revenue' ? 'Revenue' : 'Tickets'}</p>
                      <p className="text-xl font-bold text-[#1E0A3C]">
                        {salesFilter === 'revenue' 
                          ? formatCurrency(graphSummary.total)
                          : graphSummary.total
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[#6F7287]">Average per Day</p>
                      <p className="text-xl font-bold text-[#1E0A3C]">
                        {salesFilter === 'revenue'
                          ? formatCurrency(graphSummary.average)
                          : graphSummary.average
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[#6F7287]">Best Day</p>
                      <p className="text-xl font-bold text-[#F05537]">
                        {salesFilter === 'revenue'
                          ? formatCurrency(graphSummary.best)
                          : graphSummary.best
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-[#6F7287]">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                  <p>No sales data available for this period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
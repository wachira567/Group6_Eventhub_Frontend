import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Users, Ticket, PlusCircle, ChevronRight, Eye, DollarSign, Settings, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import { toast } from 'sonner';
import { logout } from '../../store/slices/authSlice';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/my-events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        dispatch(logout());
        toast.error('Session expired', {
          description: 'Please log in again.',
        });
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const eventsList = data.events || [];
      setEvents(eventsList);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = eventsList.filter(e => new Date(e.start_date) >= today);
      const totalTicketsSold = eventsList.reduce((sum, e) => sum + (e.tickets_sold || 0), 0);
      const totalRevenue = eventsList.reduce((sum, e) => sum + (e.revenue || 0), 0);

      setStats({
        totalEvents: eventsList.length,
        totalTicketsSold,
        totalRevenue,
        upcomingEvents: upcomingEvents.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get recent events (up to 3)
  const recentEvents = events
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.business_name || user?.name?.split(' ')[0] || 'Organizer'}!
              </h1>
              <p className="text-white/70 mb-4">
                Manage your events, track sales, and grow your audience.
              </p>
              <Link to="/organizer/create-event">
                <Button className="bg-white text-purple-700 hover:bg-white/90">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#F05537]/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#F05537]" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Total Events</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">{stats.totalEvents}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">{stats.totalTicketsSold}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Revenue</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-[#6F7287]">Upcoming</p>
                </div>
                <p className="text-2xl font-bold text-[#1E0A3C]">{stats.upcomingEvents}</p>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-[#E6E5E8] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1E0A3C]">Recent Events</h2>
                <Link
                  to="/organizer/my-events"
                  className="text-[#F05537] hover:text-[#D94E32] text-sm font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#F05537] animate-spin" />
                  </div>
                ) : recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex gap-4 p-4 bg-[#F8F7FA] rounded-lg"
                      >
                        <img
                          src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-[#1E0A3C] mb-1">
                                {event.title}
                              </h3>
                              <p className="text-sm text-[#6F7287]">
                                {formatDate(event.start_date)} • {event.location}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              event.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {event.status === 'published' ? 'Active' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Ticket className="w-4 h-4 text-[#6F7287]" />
                              <span className="text-[#39364F] font-medium">{event.tickets_sold || 0}</span>
                              <span className="text-[#6F7287]">sold</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#6F7287] mb-4">No events yet. Create your first event!</p>
                    <Link to="/organizer/create-event">
                      <Button className="bg-[#F05537] hover:bg-[#D94E32]">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-[#E6E5E8]">
                <h2 className="text-lg font-semibold text-[#1E0A3C]">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link to="/organizer/create-event">
                    <Button variant="outline" className="w-full justify-start">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create New Event
                    </Button>
                  </Link>
                  <Link to="/organizer/my-events">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link to="/organizer/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Organizer Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
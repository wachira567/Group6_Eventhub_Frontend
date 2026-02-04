import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, PlusCircle, Search, Filter, Edit, BarChart3, Users, Eye, ChevronLeft, MoreVertical, Loader2, Trash2, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import { toast } from 'sonner';
import { logout } from '../../store/slices/authSlice';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';

const MyEvents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
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
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const isEventPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(eventDate) < today;
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully');
      // Refresh events list
      fetchMyEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleHideEvent = async (eventId) => {
    if (!confirm('Are you sure you want to hide this event? It will no longer be visible to the public.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to hide event');
      }

      toast.success('Event hidden successfully');
      // Refresh events list
      fetchMyEvents();
    } catch (error) {
      console.error('Error hiding event:', error);
      toast.error('Failed to hide event');
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, isPast) => {
    if (isPast) {
      return 'bg-gray-200 text-gray-600';
    }
    const badges = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-[#1E0A3C]">My Events</h1>
                  <Link to="/organizer/create-event">
                    <Button className="bg-[#F05537] hover:bg-[#D94E32]">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Events List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-[#F05537] animate-spin" />
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="space-y-6">
                    {filteredEvents.map((event) => {
                      const isPast = isEventPast(event.start_date);
                      const isCancelled = event.status === 'cancelled';
                      return (
                        <div
                          key={event.id}
                          className={`border rounded-xl overflow-hidden transition-shadow ${
                            isPast || isCancelled
                              ? 'border-gray-300 bg-gray-50 opacity-75'
                              : 'border-[#E6E5E8] hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                              <img
                                src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
                                alt={event.title}
                                className={`w-full h-full object-cover ${isPast || isCancelled ? 'grayscale' : ''}`}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`text-lg font-semibold ${isPast || isCancelled ? 'text-gray-500' : 'text-[#1E0A3C]'}`}>
                                      {event.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(event.status, isPast)}`}>
                                      {isPast ? 'Past Event' : event.status}
                                    </span>
                                  </div>
                                  <p className={`text-sm mb-4 ${isPast || isCancelled ? 'text-gray-400' : 'text-[#6F7287]'}`}>
                                    {formatDate(event.start_date)} • {event.location}
                                  </p>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className={`rounded-lg p-3 ${isPast || isCancelled ? 'bg-gray-100' : 'bg-[#F8F7FA]'}`}>
                                  <p className={`text-xs ${isPast || isCancelled ? 'text-gray-500' : 'text-[#6F7287]'}`}>Tickets Sold</p>
                                  <p className={`text-lg font-semibold ${isPast || isCancelled ? 'text-gray-600' : 'text-[#1E0A3C]'}`}>
                                    {event.tickets_sold || 0}
                                  </p>
                                </div>
                                <div className={`rounded-lg p-3 ${isPast || isCancelled ? 'bg-gray-100' : 'bg-[#F8F7FA]'}`}>
                                  <p className={`text-xs ${isPast || isCancelled ? 'text-gray-500' : 'text-[#6F7287]'}`}>Revenue</p>
                                  <p className={`text-lg font-semibold ${isPast || isCancelled ? 'text-gray-600' : 'text-[#F05537]'}`}>
                                    {formatCurrency(event.revenue || 0)}
                                  </p>
                                </div>
                                <div className={`rounded-lg p-3 ${isPast || isCancelled ? 'bg-gray-100' : 'bg-[#F8F7FA]'}`}>
                                  <p className={`text-xs ${isPast || isCancelled ? 'text-gray-500' : 'text-[#6F7287]'}`}>Status</p>
                                  <p className={`text-lg font-semibold ${isPast || isCancelled ? 'text-gray-600' : 'text-[#1E0A3C]'}`}>
                                    {isPast ? 'Ended' : isCancelled ? 'Hidden' : 'Active'}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {!isPast && !isCancelled && (
                                  <Link to={`/organizer/edit-event/${event.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Button>
                                  </Link>
                                )}
                                <Link to={`/organizer/analytics/${event.id}`}>
                                  <Button variant="outline" size="sm">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                  </Button>
                                </Link>
                                <Link to={`/organizer/attendees/${event.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    Attendees
                                  </Button>
                                </Link>
                                <Link to={`/events/${event.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                                {/* Delete Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                                {/* Hide Button - only show for published events */}
                                {!isPast && !isCancelled && event.status === 'published' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleHideEvent(event.id)}
                                    className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                  >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F8F7FA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-[#A9A8B3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                      No events found
                    </h3>
                    <p className="text-[#6F7287] mb-4">
                      Create your first event to start selling tickets.
                    </p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEvents;

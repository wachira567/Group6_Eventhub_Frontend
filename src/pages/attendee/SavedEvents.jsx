import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, Calendar, MapPin, ChevronLeft, Search, X, Ticket, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';

const sidebarItems = [
  { to: '/attendee', icon: Ticket, label: 'Overview', active: false },
  { to: '/attendee/tickets', icon: Ticket, label: 'My Tickets', active: false },
  { to: '/attendee/saved', icon: Heart, label: 'Saved Events', active: true },
];

const SavedEvents = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/events/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved events');
        }

        const data = await response.json();
        setSavedEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching saved events:', err);
        setError('Failed to load your saved events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [token]);

  const removeSaved = async (eventId) => {
    if (!token) return;

    try {
      setRemovingId(eventId);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove saved event');
      }

            // Remove from local state
      setSavedEvents(savedEvents.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error('Error removing saved event:', err);
      alert('Failed to remove event. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

   const filteredEvents = savedEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span className="text-[#6F7287]">Loading your saved events...</span>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/attendee"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#F05537] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">{user?.name || 'User'}</p>
                    <p className="text-sm text-[#6F7287]">{user?.email}</p>
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
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-[#1E0A3C]">
                    Saved Events
                    <span className="ml-2 text-lg font-normal text-[#6F7287]">
                      ({savedEvents.length})
                    </span>
                  </h1>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                    <input
                      type="text"
                      placeholder="Search saved events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none w-full sm:w-64"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mt-4">
                    {error}
                  </div>
                )}
              </div>

              {/* Events Grid */}
              <div className="p-6">
                {filteredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border border-[#E6E5E8] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="relative h-48">
                          <img
                            src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeSaved(event.id)}
                            disabled={removingId === event.id}
                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {removingId === event.id ? (
                              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-[#39364F]">
                              {event.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-[#1E0A3C] mb-2 line-clamp-1">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-sm text-[#6F7287] mb-4">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.start_date)}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#F05537]">
                              {formatCurrency(event.price)}
                            </span>
                            <Link to={`/events/${event.id}`}>
                              <Button size="sm" className="bg-[#F05537] hover:bg-[#D94E32]">
                                <Ticket className="w-4 h-4 mr-2" />
                                Get Tickets
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F8F7FA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-[#A9A8B3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                      No saved events
                    </h3>
                    <p className="text-[#6F7287] mb-4">
                      {searchQuery 
                        ? "No events match your search. Try a different search term."
                        : "Events you save will appear here for quick access."}
                    </p>
                    {!searchQuery && (
                      <Link to="/events">
                        <Button className="bg-[#F05537] hover:bg-[#D94E32]">
                          Discover Events
                        </Button>
                      </Link>
                    )}
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

export default SavedEvents;



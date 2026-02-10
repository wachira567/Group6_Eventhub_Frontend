import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, ChevronLeft, Calendar, User, MapPin, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';

const EventModeration = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('token');

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/moderation/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (eventId) => {
    setActionLoading(eventId);
    try {
      const response = await fetch(`${API_BASE_URL}/moderation/event/${eventId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to approve event');
      }

      // Refresh the list
      await fetchPendingEvents();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setActionLoading(eventId);
    try {
      const response = await fetch(`${API_BASE_URL}/moderation/event/${eventId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to reject event');
      }

      // Refresh the list
      await fetchPendingEvents();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter - show only matching status
    const matchesStatus = statusFilter === 'all' || event.status?.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      published: 'bg-green-100 text-green-700',
      pending: 'bg-orange-100 text-orange-700',
      rejected: 'bg-red-100 text-red-700',
      draft: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-50 text-red-600',
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const pendingCount = events.filter(e => ['draft', 'pending'].includes(e.status?.toLowerCase())).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#6F7287]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading events...</span>
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

        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-[#E6E5E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1E0A3C]">Event Moderation</h1>
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{pendingCount} pending approval</span>
              </div>
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
                <option value="draft">Draft</option>
                <option value="pending">Pending Approval</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="p-6">
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border border-[#E6E5E8] rounded-xl overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                      <img
                        src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#1E0A3C]">{event.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(event.status)}`}>
                              {formatStatus(event.status)}
                            </span>
                          </div>
                          <p className="text-sm text-[#6F7287] line-clamp-2">{event.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#6F7287]">Organizer</p>
                          <p className="text-sm font-medium text-[#39364F]">{event.organizer?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#A9A8B3]">{event.organizer?.email || ''}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6F7287]">Date</p>
                          <p className="text-sm font-medium text-[#39364F]">{formatDate(event.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6F7287]">Location</p>
                          <p className="text-sm font-medium text-[#39364F]">{event.venue || event.venue_address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6F7287]">Submitted</p>
                          <p className="text-sm font-medium text-[#39364F]">{formatDate(event.created_at)}</p>
                        </div>
                      </div>

                      {/* Ticket Types */}
                      {event.ticket_types && event.ticket_types.length > 0 && (
                        <div className="bg-[#F8F7FA] rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-[#39364F] mb-2">Ticket Types</p>
                          <div className="flex flex-wrap gap-2">
                            {event.ticket_types.map((ticket, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-[#6F7287]">
                                {ticket.name}: {formatCurrency(ticket.price)} ({ticket.quantity} qty)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {['draft', 'pending'].includes(event.status?.toLowerCase()) && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApprove(event.id)}
                            disabled={actionLoading === event.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === event.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(event.id)}
                            disabled={actionLoading === event.id}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            {actionLoading === event.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                          </Button>
                          <Link to={`/events/${event.id}`}>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </Link>
                        </div>
                      )}

                      {!['draft', 'pending'].includes(event.status?.toLowerCase()) && (
                        <div className="flex gap-3">
                          <Link to={`/events/${event.id}`}>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Event
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                  {events.length === 0 ? 'No events pending approval' : 'No events found'}
                </h3>
                <p className="text-[#6F7287]">
                  {events.length === 0 
                    ? 'All events have been reviewed. Great job!' 
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModeration;

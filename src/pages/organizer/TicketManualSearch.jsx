import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Check, X, User, Mail, Phone, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import { apiGet, apiPost } from '../../utils/api';

const TicketManualSearch = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      const data = await response.json();
      
      // Check if user is the organizer
      if (data.event.organizer_id !== user?.id && user?.role !== 'admin') {
        setError('You are not authorized to manage tickets for this event');
        setLoading(false);
        return;
      }
      
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchTickets = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      // Search by ticket number, phone, or email
      const response = await apiGet(`/tickets/event/${eventId}?search=${encodeURIComponent(searchQuery)}`);
      
      if (response.data.tickets && response.data.tickets.length > 0) {
        setSearchResults(response.data.tickets);
      } else {
        setError('No tickets found for this search query');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const confirmTicketEntry = async (ticket) => {
    try {
      const response = await apiPost(`/tickets/confirm-by-code`, {
        ticket_code: ticket.ticket_number,
        event_id: parseInt(eventId)
      });

      if (response.data.valid) {
        // Update the ticket status in results
        setSearchResults(prev => 
          prev.map(t => 
            t.id === ticket.id 
              ? { ...t, is_used: true, used_at: new Date().toISOString() }
              : t
          )
        );
      } else {
        setError(response.data.error || 'Failed to verify ticket');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F05537] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/organizer/my-events')}
            className="mb-4"
          >
            ← Back to Events
          </Button>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/organizer/scan-tickets/${eventId}`)}
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          ← Back to Scanner
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Header */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F05537] rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#1E0A3C]">Manual Ticket Search</h1>
                    <p className="text-sm text-[#6F7287] font-normal">{event?.title}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Search for tickets by phone number, email, or ticket number. Use this when the QR code 
                  is unreadable or the guest's phone is off.
                </p>
                
                <form onSubmit={searchTickets} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Search by phone, email, or ticket number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && !searchResults.length && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results ({searchResults.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((ticket) => (
                      <div 
                        key={ticket.id}
                        className={`p-4 rounded-lg border ${
                          ticket.is_used 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-gray-500" />
                              <span className="font-mono font-medium">{ticket.ticket_number}</span>
                              {ticket.is_used && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  Already Used
                                </span>
                              )}
                            </div>
                            
                            {ticket.is_guest ? (
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {ticket.guest_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {ticket.guest_email}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  User ID: {ticket.user_id}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-sm">
                              <span className="text-gray-500">Status: </span>
                              <span className={`font-medium ${
                                ticket.payment_status === 'COMPLETED' 
                                  ? 'text-green-600' 
                                  : ticket.payment_status === 'FAILED'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }`}>
                                {ticket.payment_status}
                              </span>
                            </div>
                          </div>

                          {!ticket.is_used && ticket.payment_status === 'COMPLETED' && (
                            <Button
                              onClick={() => confirmTicketEntry(ticket)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm Entry
                            </Button>
                          )}
                          
                          {ticket.is_used && (
                            <div className="text-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                {ticket.used_at 
                                  ? new Date(ticket.used_at).toLocaleTimeString() 
                                  : 'Used'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-2">When to use manual search:</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Guest's phone is dead or not available</li>
                  <li>• QR code is damaged or smudged</li>
                  <li>• Guest claims they paid but never received ticket</li>
                  <li>• Payment is still pending</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketManualSearch;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, MapPin, Clock, Users, Share2, Heart, ChevronLeft, Minus, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatDate, formatTime, formatCurrency } from '../utils/helpers';
import { API_BASE_URL } from '../utils/constants';
import TicketPurchaseModal from '../components/tickets/TicketPurchaseModal';
import EventMap from '../components/events/EventMap';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  // Event data state
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch event data from API
  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // API_BASE_URL already includes /api prefix
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found');
          }
          throw new Error('Failed to fetch event data');
        }
        
        const data = await response.json();
        
        // Set event data
        setEvent(data.event);
        
        // Transform ticket types to match the expected format
        const transformedTicketTypes = (data.ticket_types || []).map(tt => ({
          id: tt.id,  // Use the integer ID from the database
          name: tt.name,
          price: tt.price,
          available: tt.available,
          quantity_total: tt.quantity_total,
          quantity_sold: tt.quantity_sold,
          description: tt.description,
        }));
        
        setTicketTypes(transformedTicketTypes);
        
        // Set default selected ticket (first available one)
        if (transformedTicketTypes.length > 0) {
          const availableTicket = transformedTicketTypes.find(t => t.available > 0) || transformedTicketTypes[0];
          setSelectedTicket(availableTicket);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id]);

  // Check if event is saved (only for authenticated users)
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !token || !id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/events/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const savedEventIds = (data.events || []).map(e => e.id);
          setIsSaved(savedEventIds.includes(parseInt(id)));
        }
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    };

    checkSavedStatus();
  }, [id, isAuthenticated, token]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxAvailable = selectedTicket?.available || 10;
    if (newQuantity >= 1 && newQuantity <= Math.min(10, maxAvailable)) {
      setQuantity(newQuantity);
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    // Reset quantity if it exceeds available
    if (quantity > ticket.available) {
      setQuantity(1);
    }
  };

  const handlePurchase = () => {
    // Allow guest checkout - no authentication required
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    // Optimistic UI update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert on error
        setIsSaved(!newSavedState);
        throw new Error('Failed to save event');
      }

      const data = await response.json();
      // Sync with server response
      setIsSaved(data.saved);
    } catch (err) {
      console.error('Error saving event:', err);
      // Revert UI on error
      setIsSaved(!newSavedState);
    } finally {
      setIsSaving(false);
    }
  };

  // Construct event data for the modal (matching the expected format)
  const eventDataForModal = event ? {
    id: event.id,
    title: event.title,
    ticketTypes: ticketTypes,
  } : null;

  const totalPrice = (selectedTicket?.price || 0) * quantity;

  // Calculate total tickets and sold tickets
  const totalTickets = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_total || 0), 0);
  const ticketsSold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#F05537] animate-spin mx-auto mb-4" />
          <p className="text-[#6F7287]">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-[#F05537] hover:bg-[#D94E32] text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // No event data
  if (!event) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#6F7287] mb-4">Event not found</p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#F05537] hover:bg-[#D94E32] text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to events
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[300px] lg:h-[400px] bg-gray-100">
        <img
          src={event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg'}
          alt={event.title}
          className="w-full h-full object-contain bg-gray-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
              {/* Date Badge */}
              <div className="inline-flex items-center gap-2 bg-[#F05537]/10 text-[#F05537] px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                {formatDate(event.start_date)}
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-4">
                {event.title}
              </h1>

              {/* Organizer */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#F05537] rounded-full flex items-center justify-center text-white font-semibold">
                  {event.organizer_id ? 'O' : 'E'}
                </div>
                <div>
                  <p className="text-sm text-[#6F7287]">Organized by</p>
                  <p className="font-medium text-[#39364F]">Event Organizer</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F8F7FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#F05537]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#39364F]">Time</p>
                    <p className="text-sm text-[#6F7287]">
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F8F7FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#F05537]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#39364F]">Location</p>
                    <p className="text-sm text-[#6F7287]">{event.location}</p>
                    <p className="text-sm text-[#A9A8B3]">{event.city}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1E0A3C] mb-4">About this event</h2>
                <div className="prose prose-sm max-w-none text-[#6F7287] whitespace-pre-line">
                  {event.description || 'No description available.'}
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#F8F7FA] text-[#6F7287] rounded-full text-sm capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Map */}
              <div>
                <h2 className="text-xl font-semibold text-[#1E0A3C] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h2>
                <EventMap
                  coordinates={event.coordinates}
                  address={event.venue_address || event.city || event.location}
                  eventTitle={event.title}
                  height="350px"
                />
              </div>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-[#1E0A3C] mb-4">Get Tickets</h2>

              {/* Ticket Types */}
              {ticketTypes.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {ticketTypes.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleTicketSelect(ticket)}
                      disabled={ticket.available <= 0}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'border-[#F05537] bg-[#FFF5F3]'
                          : ticket.available <= 0
                          ? 'border-[#E6E5E8] opacity-50 cursor-not-allowed'
                          : 'border-[#E6E5E8] hover:border-[#D2D2D6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#39364F]">{ticket.name}</p>
                          <p className="text-sm text-[#6F7287]">
                            {ticket.available > 0 ? `${ticket.available} available` : 'Sold out'}
                          </p>
                        </div>
                        <p className="font-semibold text-[#F05537]">
                          {formatCurrency(ticket.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#6F7287]">
                  No tickets available for this event.
                </div>
              )}

              {/* Quantity and Purchase Section */}
              {selectedTicket && selectedTicket.available > 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[#39364F]">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-full border border-[#D2D2D6] flex items-center justify-center disabled:opacity-50 hover:border-[#F05537]"
                      >
                        <Minus className="w-4 h-4" />

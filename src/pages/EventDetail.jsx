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


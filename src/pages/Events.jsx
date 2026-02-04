import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, X } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import TicketPurchaseModal from '../components/tickets/TicketPurchaseModal';
import { Button } from '../components/ui/button';
import { CATEGORIES, API_BASE_URL } from '../utils/constants';
import { Spinner } from '../components/ui/spinner';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const searchQuery = searchParams.get('search') || '';
  const locationFilter = searchParams.get('location') || '';
  const categoryFilter = searchParams.get('category') || '';
  const priceFilter = searchParams.get('price') || '';
  const dateFilter = searchParams.get('date') || '';

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Always filter out past events - show only upcoming events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.set('start_date_from', today.toISOString().split('T')[0]);
        
        if (searchQuery) {
          params.set('search', searchQuery);
        }
        
        if (locationFilter) {
          params.set('city', locationFilter);
        }
        
        if (categoryFilter) {
          params.set('category', categoryFilter);
        }
        
        // Note: The backend doesn't have a price filter, but we can handle it client-side
        // if needed after fetching the data
        
        const queryString = params.toString();
        const url = `${API_BASE_URL}/events${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        let fetchedEvents = data.events || [];
        
        // Handle price filtering client-side since backend doesn't support it
        if (priceFilter) {
          if (priceFilter === 'free') {
            fetchedEvents = fetchedEvents.filter(event => {
              // Check if event has a minimum price of 0 or is free
              const minPrice = event.ticket_types?.length > 0 
                ? Math.min(...event.ticket_types.map(tt => tt.price || 0))
                : event.price || 0;
              return minPrice === 0;
            });
          } else if (priceFilter === 'paid') {
            fetchedEvents = fetchedEvents.filter(event => {
              const minPrice = event.ticket_types?.length > 0 
                ? Math.min(...event.ticket_types.map(tt => tt.price || 0))
                : event.price || 0;
              return minPrice > 0;
            });
          }
        }
        
        // Transform backend event format to match frontend expectations
        const transformedEvents = fetchedEvents.map(event => {
          const ticketTypes = event.ticket_types?.map(tt => ({
            id: tt.id,
            name: tt.name,
            price: tt.price || 0,
            available: (tt.quantity_total || 0) - (tt.quantity_sold || 0)
          })) || [];
          
          const minPrice = ticketTypes.length > 0 
            ? Math.min(...ticketTypes.map(tt => tt.price))
            : event.price || 0;
          
          return {
            id: event.id,
            title: event.title,
            date: event.start_date,
            location: event.location,
            price: minPrice,
            image: event.image_url || 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg',
            organizer: event.organizer_name || 'Event Organizer',
            ticketsSold: event.tickets_sold || 0,
            totalTickets: event.total_capacity || 100,
            category: event.category,
            ticketTypes: ticketTypes,
          };
        });
        
        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, locationFilter, categoryFilter, priceFilter]);

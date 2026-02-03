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



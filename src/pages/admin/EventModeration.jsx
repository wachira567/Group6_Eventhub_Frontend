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
      const response = await fetch(`${API_BASE_URL}/moderation/events/pending`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
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

  return <div>Event Moderation Component</div>;
};

export default EventModeration;

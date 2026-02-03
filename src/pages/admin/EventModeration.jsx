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

  const handleApprove = async (eventId) => {
    setActionLoading(eventId);
    try {
      const response = await fetch(`${API_BASE_URL}/moderation/events/${eventId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to approve event');
      await fetchPendingEvents();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;
    setActionLoading(eventId);
    try {
      const response = await fetch(`${API_BASE_URL}/moderation/events/${eventId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject event');
      await fetchPendingEvents();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtering events by search query and status
  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge helpers
  const getStatusBadge = (status) => {
    const badges = {
      published: 'bg-green-100 text-green-700',
      pending_approval: 'bg-orange-100 text-orange-700',
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

  return <div>Event Moderation Component</div>;
};

export default EventModeration;

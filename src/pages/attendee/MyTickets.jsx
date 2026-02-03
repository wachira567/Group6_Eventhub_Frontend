import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Ticket, Calendar, MapPin, Clock, Download, Eye, ChevronLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';

const sidebarItems = [
  { to: '/attendee', icon: Ticket, label: 'Overview', active: false },
  { to: '/attendee/tickets', icon: Ticket, label: 'My Tickets', active: true },
  { to: '/attendee/saved', icon: Ticket, label: 'Saved Events', active: false },
];

const MyTickets = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load your tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);


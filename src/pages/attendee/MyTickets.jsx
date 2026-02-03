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

  const handleDownload = async (ticketId) => {
    if (!token) return;

    try {
      setDownloadingId(ticketId);
      const response = await fetch(`${API_BASE_URL}/tickets/download/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download ticket');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EventHub_Ticket_${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      alert('Failed to download ticket. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

    // Filter tickets by status and search query
  const now = new Date();
  const filteredTickets = tickets.filter((ticket) => {
    const eventDate = ticket.event ? new Date(ticket.event.start_date) : null;
    // Check payment_status - handle both string and enum object formats
    const isPaid = ticket.payment_status === 'completed' || ticket.payment_status === 'COMPLETED';
    const isUpcoming = eventDate && eventDate >= now && isPaid;
    const isPast = eventDate && eventDate < now && isPaid;

    const matchesTab = activeTab === 'upcoming' ? isUpcoming : isPast;
    const matchesSearch = searchQuery === '' || 
      (ticket.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ticket.event?.location?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span className="text-[#6F7287]">Loading your tickets...</span>
        </div>
      </div>
    );
  }



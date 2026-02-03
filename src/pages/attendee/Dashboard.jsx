import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Heart, User, Settings, ChevronRight, Calendar, MapPin, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import { Button } from '../../components/ui/button';

const sidebarItems = [
  { to: '/attendee', icon: User, label: 'Overview' },
  { to: '/attendee/tickets', icon: Ticket, label: 'My Tickets' },
  { to: '/attendee/saved', icon: Heart, label: 'Saved Events' },
  { to: '/attendee/settings', icon: Settings, label: 'Settings' },
];

const AttendeeDashboard = () => {
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    past: 0,
    saved: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's tickets
        const ticketsRes = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        let ticketsData = [];
        if (ticketsRes.ok) {
          const ticketsJson = await ticketsRes.json();
          ticketsData = ticketsJson.tickets || [];
          setTickets(ticketsData);
        }

        // Fetch saved events
        const savedRes = await fetch(`${API_BASE_URL}/events/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        let savedData = [];
        if (savedRes.ok) {
          const savedJson = await savedRes.json();
          savedData = savedJson.events || [];
          setSavedEvents(savedData);
        }

                // Calculate stats
        const now = new Date();
        const upcomingTickets = ticketsData.filter(t => {
          const eventDate = t.event ? new Date(t.event.start_date) : null;
          return eventDate && eventDate >= now && t.payment_status === 'completed';
        });

        const pastTickets = ticketsData.filter(t => {
          const eventDate = t.event ? new Date(t.event.start_date) : null;
          return eventDate && eventDate < now && t.payment_status === 'completed';
        });

        const totalSpent = ticketsData
          .filter(t => t.payment_status === 'completed')
          .reduce((sum, t) => sum + (t.total_price || 0), 0);

        setStats({
          upcoming: upcomingTickets.length,
          past: pastTickets.length,
          saved: savedData.length,
          totalSpent,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

   // Get recent upcoming tickets (first 3)
  const recentTickets = tickets
    .filter(t => {
      const eventDate = t.event ? new Date(t.event.start_date) : null;
      return eventDate && eventDate >= new Date() && t.payment_status === 'completed';
    })
    .sort((a, b) => new Date(a.event?.start_date) - new Date(b.event?.start_date))
    .slice(0, 3);

  // Get recent saved events (first 2)
  const recentSavedEvents = savedEvents.slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span className="text-[#6F7287]">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

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
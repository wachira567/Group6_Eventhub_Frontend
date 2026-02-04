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


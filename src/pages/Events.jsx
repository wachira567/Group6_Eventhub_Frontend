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

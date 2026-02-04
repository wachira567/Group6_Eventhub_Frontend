import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/events/EventCard';
import { Button } from '../components/ui/button';
import { API_BASE_URL } from '../utils/constants';
import { Spinner } from '../components/ui/spinner';

const filterTabs = ['All', 'For you', 'Today', 'This weekend'];

const FeaturedEventsSection = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current date in ISO format for filtering upcoming events
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch upcoming events from API - get more than 4 so we can randomize
        const url = `${API_BASE_URL}/events?per_page=20&start_date_from=${today}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        let fetchedEvents = data.events || [];
        
        // Transform backend event format to match frontend expectations
        const transformedEvents = fetchedEvents.map(event => {
          const ticketTypes = event.ticket_types?.map(tt => ({
            id: tt.id,
            name: tt.name,
            price: tt.price || 0,
            available: tt.available || 0
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
        
        // Filter only upcoming events (in case API doesn't filter properly)
        const upcomingEvents = transformedEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= new Date();
        });
        
        // Shuffle and take exactly 4 random upcoming events
        const shuffled = upcomingEvents.sort(() => 0.5 - Math.random());
        setEvents(shuffled.slice(0, 4));
      } catch (err) {

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

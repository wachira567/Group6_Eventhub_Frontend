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

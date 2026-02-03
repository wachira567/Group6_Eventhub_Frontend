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
        console.error('Error fetching featured events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-12 lg:py-16 bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-2">
              Events in Nairobi
            </h2>
            <p className="text-[#6F7287]">Discover the best events happening near you</p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[#F05537] text-white'
                    : 'bg-white text-[#39364F] hover:bg-[#E6E5E8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-12 h-12 text-[#F05537]" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-[#6F7287] mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#6F7287]">No events found. Check back soon!</p>
              </div>
            )}

            {/* See More Button */}
            <div className="mt-10 text-center">
              <Button
                onClick={() => navigate('/events')}
                variant="outline"
                className="border-[#F05537] text-[#F05537] hover:bg-[#F05537] hover:text-white px-8"
              >
                See All Events
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedEventsSection;

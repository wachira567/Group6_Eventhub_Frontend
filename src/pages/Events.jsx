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
              // Check if event has a minimum price of 0 or is free
              const minPrice = event.ticket_types?.length > 0 
                ? Math.min(...event.ticket_types.map(tt => tt.price || 0))
                : event.price || 0;
              return minPrice === 0;
            });
          } else if (priceFilter === 'paid') {
            fetchedEvents = fetchedEvents.filter(event => {
              const minPrice = event.ticket_types?.length > 0 
                ? Math.min(...event.ticket_types.map(tt => tt.price || 0))
                : event.price || 0;
              return minPrice > 0;
            });
          }
        }
        
        // Transform backend event format to match frontend expectations
        const transformedEvents = fetchedEvents.map(event => {
          const ticketTypes = event.ticket_types?.map(tt => ({
            id: tt.id,
            name: tt.name,
            price: tt.price || 0,
            available: (tt.quantity_total || 0) - (tt.quantity_sold || 0)
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
        
        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, locationFilter, categoryFilter, priceFilter]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchQuery || locationFilter || categoryFilter || priceFilter || dateFilter;

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E6E5E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-4">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Events'}
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center bg-[#F8F7FA] border border-[#D2D2D6] rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-[#6F7287] mr-3" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="flex-1 bg-transparent outline-none text-[#39364F]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-[#F05537] text-white rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F05537]/10 text-[#F05537] rounded-full text-sm">
                  Search: {searchQuery}
                  <button onClick={() => updateFilter('search', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F05537]/10 text-[#F05537] rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  {locationFilter}
                  <button onClick={() => updateFilter('location', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F05537]/10 text-[#F05537] rounded-full text-sm">
                  {categoryFilter}
                  <button onClick={() => updateFilter('category', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-[#6F7287] hover:text-[#F05537] underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1E0A3C]">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-[#6F7287]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#39364F] mb-3">Category</h4>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={categoryFilter === cat.id}
                          onChange={() => updateFilter('category', cat.id)}
                          className="text-[#F05537] focus:ring-[#F05537]"
                        />
                        <span className="text-sm text-[#6F7287]">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#39364F] mb-3">Price</h4>
                  <div className="space-y-2">
                    {[
                      { value: '', label: 'All' },
                      { value: 'free', label: 'Free' },
                      { value: 'paid', label: 'Paid' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === option.value}
                          onChange={() => updateFilter('price', option.value)}
                          className="text-[#F05537] focus:ring-[#F05537]"
                        />
                        <span className="text-sm text-[#6F7287]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <h4 className="text-sm font-medium text-[#39364F] mb-3">Date</h4>
                  <div className="space-y-2">
                    {[
                      { value: '', label: 'Any date' },
                      { value: 'today', label: 'Today' },
                      { value: 'tomorrow', label: 'Tomorrow' },
                      { value: 'weekend', label: 'This weekend' },
                      { value: 'week', label: 'This week' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="date"
                          checked={dateFilter === option.value}
                          onChange={() => updateFilter('date', option.value)}
                          className="text-[#F05537] focus:ring-[#F05537]"
                        />
                        <span className="text-sm text-[#6F7287]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="flex-1">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Spinner className="w-12 h-12 text-[#F05537]" />
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                  Error loading events
                </h3>
                <p className="text-[#6F7287] mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Events Content */}
            {!loading && !error && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[#6F7287]">
                    Showing <span className="font-semibold text-[#39364F]">{events.length}</span> events
                  </p>
                </div>

                {events.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onGetTickets={handleOpenModal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-[#F8F7FA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-[#A9A8B3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                      No events found
                    </h3>
                    <p className="text-[#6F7287] mb-4">
                      Try adjusting your search or filters to find what you are looking for.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default Events;

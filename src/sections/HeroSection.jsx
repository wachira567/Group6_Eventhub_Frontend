import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Nairobi');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dtbe44muv/image/upload/v1770061707/hero-bg_lfe8zy.jpg"
          alt="Event crowd"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E0A3C]/90 via-[#1E0A3C]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Discover events that{' '}
            <span className="text-[#F05537]">match your passion</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/80 mb-8">
            Find and book tickets for concerts, workshops, conferences, and more. 
            Your next unforgettable experience is just a click away.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-2 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-[#F8F7FA] rounded-lg px-4 py-3">
                <Search className="w-5 h-5 text-[#6F7287] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search events, artists, or venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#39364F] placeholder-[#A9A8B3]"
                />
              </div>
              <div className="flex items-center bg-[#F8F7FA] rounded-lg px-4 py-3">
                <MapPin className="w-5 h-5 text-[#6F7287] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent outline-none text-[#39364F] w-24 sm:w-32"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#F05537] hover:bg-[#D94E32] text-white px-8 py-3 h-auto rounded-lg font-semibold"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="text-white/60 text-sm">Popular:</span>
            {['Music', 'Business', 'Food & Drink', 'Sports'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/events?category=${tag.toLowerCase()}`)}
                className="text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

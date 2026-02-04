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


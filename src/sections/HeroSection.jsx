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

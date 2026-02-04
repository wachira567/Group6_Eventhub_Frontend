import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { POPULAR_CITIES } from '../utils/constants';

const PopularCitiesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

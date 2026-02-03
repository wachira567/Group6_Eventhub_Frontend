import { useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const CTASection = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Calendar, value: '10,000+', label: 'Events Hosted' },
    { icon: Users, value: '500K+', label: 'Happy Attendees' },
    { icon: TrendingUp, value: '98%', label: 'Success Rate' },
  ];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E0A3C] to-[#39364F]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
        </div>
      </div>
    </section>
  );
};

export default CTASection;
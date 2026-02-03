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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E0A3C] to-[#39364F]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#F05537] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F05537] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
              Ready to host your own{' '}
              <span className="text-[#F05537]">amazing event?</span>
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of event organizers who trust EventHub to sell tickets, 
              manage attendees, and grow their events. From small meetups to large concerts, 
              we have got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/create-event')}
                className="bg-[#F05537] hover:bg-[#D94E32] text-white px-8 py-6 h-auto text-lg font-semibold"
              >
                Create Event
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/events')}
                className="border-white text-white hover:bg-white/10 px-8 py-6 h-auto text-lg"
              >
                Browse Events
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-[#F05537] mx-auto mb-4" />
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
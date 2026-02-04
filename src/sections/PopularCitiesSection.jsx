import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { POPULAR_CITIES } from '../utils/constants';

const PopularCitiesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-8">
          Popular Destinations
        </h2>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => navigate(`/events?location=${city.name}`)}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg">{city.name}</h3>
                <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Explore events <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-[#1E0A3C] mb-4">
            Things to do around Kenya
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              'Things to do in Westlands',
              'Things to do in Kilimani',
              'Things to do in Karen',
              'Things to do in Lavington',
              'Things to do in Parklands',
              'Things to do in Ngong Road',
              'Things to do in Upper Hill',
              'Things to do in Eastleigh',
            ].map((link) => (
              <button
                key={link}
                onClick={() => navigate(`/events?location=${link.replace('Things to do in ', '')}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#F8F7FA] hover:bg-[#E6E5E8] rounded-full text-sm text-[#39364F] transition-colors"
              >
                {link}
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCitiesSection;

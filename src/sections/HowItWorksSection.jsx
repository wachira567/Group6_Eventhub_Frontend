import { Search, CreditCard, Ticket, Check } from 'lucide-react';
import { HOW_IT_WORKS } from '../utils/constants';

const iconMap = {
  Search,
  CreditCard,
  Ticket,
};

const HowItWorksSection = () => {
  return (
    <section className="py-12 lg:py-16 bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-4">
            How EventHub Works
          </h2>
          <p className="text-[#6F7287] max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to discover and book your next amazing event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
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
          {HOW_IT_WORKS.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div
                key={step.step}
                className="relative bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#F05537] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>

                <div className="w-16 h-16 bg-[#FFF5F3] rounded-full flex items-center justify-center mx-auto mb-6">
                  {IconComponent && (
                    <IconComponent className="w-8 h-8 text-[#F05537]" />
                  )}
                </div>

                <h3 className="text-xl font-semibold text-[#1E0A3C] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#6F7287]">
                  {step.description}
                </p>

                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#E6E5E8]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
import HeroSection from '../sections/HeroSection';
import CategoriesSection from '../sections/CategoriesSection';
import FeaturedEventsSection from '../sections/FeaturedEventsSection';
import PopularCitiesSection from '../sections/PopularCitiesSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import CTASection from '../sections/CTASection';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <CategoriesSection />
      <FeaturedEventsSection />
      <PopularCitiesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default Home;

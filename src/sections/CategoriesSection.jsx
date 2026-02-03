import { CATEGORIES } from '../utils/constants';
import CategoryPill from '../components/events/CategoryPill';

const CategoriesSection = () => {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1E0A3C] mb-8 text-center">
          Explore by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
          {CATEGORIES.map((category) => (
            <CategoryPill key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

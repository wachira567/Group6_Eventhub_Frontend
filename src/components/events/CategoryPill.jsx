import { Link } from 'react-router-dom';
import { Headphones, Sparkles, Palette, Calendar, Heart, Gamepad2, Briefcase, UtensilsCrossed } from 'lucide-react';

const iconMap = {
  Headphones,
  Sparkles,
  Palette,
  Calendar,
  Heart,
  Gamepad2,
  Briefcase,
  UtensilsCrossed,
};

const CategoryPill = ({ category }) => {
  const IconComponent = iconMap[category.icon];

  return (
    <Link
      to={`/events?category=${category.id}`}
      className="flex flex-col items-center gap-3 group"
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ 
          backgroundColor: `${category.color}15`,
        }}
      >
        {IconComponent && (
          <IconComponent 
            className="w-8 h-8 transition-colors"
            style={{ color: category.color }}
          />
        )}
      </div>
      <span className="text-sm font-medium text-[#39364F] text-center group-hover:text-[#F05537] transition-colors">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryPill;

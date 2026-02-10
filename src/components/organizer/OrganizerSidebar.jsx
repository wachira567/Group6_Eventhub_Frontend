import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Calendar, PlusCircle, Settings } from 'lucide-react';

const sidebarItems = [
  { to: '/organizer', icon: TrendingUp, label: 'Overview' },
  { to: '/organizer/my-events', icon: Calendar, label: 'My Events' },
  { to: '/organizer/create-event', icon: PlusCircle, label: 'Create Event' },
  { to: '/organizer/settings', icon: Settings, label: 'Settings' },
];

const OrganizerSidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Helper to check if a link is active
  const isActive = (path) => {
    if (path === '/organizer') {
      return location.pathname === '/organizer';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm sticky top-24">
        {/* User Profile */}
        <div className="p-6 border-b border-[#E6E5E8]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#F05537] rounded-full flex items-center justify-center text-white text-xl font-bold">
              {(user?.business_name || user?.name)?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-[#1E0A3C]">
                {user?.business_name || user?.name || 'User'}
              </p>
              <p className="text-sm text-[#6F7287]">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs capitalize">
                Organizer
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-[#F05537]/10 text-[#F05537]'
                    : 'text-[#6F7287] hover:bg-[#F8F7FA]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default OrganizerSidebar;

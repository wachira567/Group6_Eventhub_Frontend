import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin, Menu, X, User, Ticket, LogOut, Heart, PlusCircle, LayoutDashboard, Shield, TrendingUp } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { Button } from '../ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Nairobi');
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('search', searchQuery);
      if (location.trim()) {
        params.set('location', location);
      }
      navigate(`/events?${params.toString()}`);
    }
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case ROLES.ADMIN:
        return '/admin';
      case ROLES.ORGANIZER:
        return '/organizer';
      default:
        return '/attendee';
    }
  };

  // Get role-based nav links
  const getRoleBasedLinks = () => {
    if (!user) return [];
    
    const links = [];
    
    // All authenticated users see Find Events
    links.push({ name: 'Find Events', href: '/events', icon: Search });
    
    if (user.role === ROLES.ORGANIZER || user.role === ROLES.ADMIN) {
      links.push({ name: 'Create Event', href: '/organizer/create-event', icon: PlusCircle });
    }
    
    return links;
  };

  // Get dropdown menu items based on role
  const getDropdownItems = () => {
    if (!user) return [];
    
    const items = [];
    
    if (user.role === ROLES.ADMIN) {
      items.push(
        { name: 'Admin Dashboard', href: '/admin', icon: Shield },
        { name: 'User Management', href: '/admin/users', icon: User },
        { name: 'Event Moderation', href: '/admin/events', icon: Ticket },
        { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      );
    } else if (user.role === ROLES.ORGANIZER) {
      items.push(
        { name: 'Organizer Dashboard', href: '/organizer', icon: LayoutDashboard },
        { name: 'My Events', href: '/organizer/my-events', icon: Ticket },
        { name: 'Create Event', href: '/organizer/create-event', icon: PlusCircle },
      );
    } else {
      items.push(
        { name: 'My Dashboard', href: '/attendee', icon: LayoutDashboard },
        { name: 'My Tickets', href: '/attendee/tickets', icon: Ticket },
        { name: 'Saved Events', href: '/attendee/saved', icon: Heart },
      );
    }
    
    return items;
  };

  const navLinks = getRoleBasedLinks();
  const dropdownItems = getDropdownItems();

  // Check if user is admin or organizer (hide search and Find Events for them)
  const isAdminOrOrganizer = user && (user.role === ROLES.ADMIN || user.role === ROLES.ORGANIZER);

  // Get logo link based on role
  const getLogoLink = () => {
    if (isAdminOrOrganizer) {
      return getDashboardLink();
    }
    return '/';
  };

  // Filter nav links to hide Find Events for admin/organizer
  const filteredNavLinks = isAdminOrOrganizer 
    ? navLinks.filter(link => link.name !== 'Find Events')
    : navLinks;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E6E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to={getLogoLink()} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#F05537] rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1E0A3C]">EventHub</span>
          </Link>

          {/* Search Bar - Desktop (hidden for admin/organizer) */}
          {!isAdminOrOrganizer && (
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="flex-1 flex items-center bg-white border border-[#D2D2D6] rounded-l-lg px-4 py-2.5 focus-within:border-[#F05537] focus-within:ring-1 focus-within:ring-[#F05537]">
                  <Search className="w-5 h-5 text-[#6F7287] mr-3" />
                  <input
                    type="text"
                    placeholder="Search events"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[#39364F] placeholder-[#A9A8B3]"
                  />
                </div>
                <div className="flex items-center bg-white border-y border-r border-[#D2D2D6] px-4 py-2.5">
                  <MapPin className="w-5 h-5 text-[#6F7287] mr-2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-24 bg-transparent outline-none text-[#39364F] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#F05537] hover:bg-[#D94E32] text-white px-6 py-2.5 rounded-r-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[#39364F] hover:text-[#F05537] font-medium text-sm transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-[#39364F] hover:text-[#F05537] font-medium text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      user?.role === ROLES.ADMIN ? 'bg-red-600' :
                      user?.role === ROLES.ORGANIZER ? 'bg-purple-600' : 'bg-[#F05537]'
                    }`}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden xl:inline">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E6E5E8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-[#E6E5E8]">
                      <p className="font-medium text-[#39364F]">{user?.name}</p>
                      <p className="text-sm text-[#6F7287]">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs capitalize ${
                        user?.role === ROLES.ADMIN ? 'bg-red-100 text-red-700' :
                        user?.role === ROLES.ORGANIZER ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user?.role}
                      </span>
                    </div>
                    {/* Menu Items */}
                    <div className="py-2">
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 px-4 py-2 text-[#39364F] hover:bg-[#F8F7FA] text-sm"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      ))}
                      <hr className="my-2 border-[#E6E5E8]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-[#C5162E] hover:bg-[#F8F7FA] text-sm w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-[#39364F] hover:text-[#F05537] font-medium text-sm transition-colors"
                >
                  Log In
                </Link>
                <Link to="/register">
                  <Button className="bg-[#F05537] hover:bg-[#D94E32] text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-[#39364F]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E6E5E8]">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search (hidden for admin/organizer) */}
            {!isAdminOrOrganizer && (
              <form onSubmit={handleSearch} className="flex">
                <div className="flex-1 flex items-center bg-[#F8F7FA] border border-[#D2D2D6] rounded-l-lg px-4 py-3">
                  <Search className="w-5 h-5 text-[#6F7287] mr-3" />
                  <input
                    type="text"
                    placeholder="Search events"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[#39364F]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#F05537] hover:bg-[#D94E32] text-white px-4 rounded-r-lg"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Mobile Nav Links (Find Events hidden for admin/organizer) */}
            <div className="space-y-2">
              {!isAdminOrOrganizer && (
                <Link
                  to="/events"
                  className="flex items-center gap-3 px-4 py-3 text-[#39364F] hover:bg-[#F8F7FA] rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  Find Events
                </Link>
              )}
              
              {isAuthenticated && (user?.role === ROLES.ORGANIZER || user?.role === ROLES.ADMIN) && (
                <Link
                  to="/organizer/create-event"
                  className="flex items-center gap-3 px-4 py-3 text-[#39364F] hover:bg-[#F8F7FA] rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Event
                </Link>
              )}
            </div>

            {isAuthenticated && (
              <div className="space-y-2 border-t border-[#E6E5E8] pt-4">
                {/* Role-based dashboard link */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-3 px-4 py-3 text-[#39364F] hover:bg-[#F8F7FA] rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {user?.role === ROLES.ADMIN ? 'Admin Dashboard' :
                   user?.role === ROLES.ORGANIZER ? 'Organizer Dashboard' : 'My Dashboard'}
                </Link>
                
                {dropdownItems.filter(item => !item.name.includes('Dashboard')).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-[#39364F] hover:bg-[#F8F7FA] rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-[#C5162E] hover:bg-[#F8F7FA] rounded-lg w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 border-t border-[#E6E5E8] pt-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-[#D2D2D6] text-[#39364F] rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F05537] hover:bg-[#D94E32] text-white rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

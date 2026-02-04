import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Ticket,
  Heart,
  User,
  Settings,
  Calendar,
  BarChart3,
  Users,
  PlusCircle,
  ChevronRight,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { formatDate, formatCurrency } from '../utils/helpers';

// Mock data
const myTickets = [
  {
    id: 1,
    eventTitle: 'Soulful Jazz Night: Live Saxophone Performance',
    date: '2026-02-15T19:00:00',
    location: 'Carnivore Restaurant, Nairobi',
    ticketType: 'Regular',
    quantity: 2,
    totalPrice: 5000,
    image: 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg',
    status: 'upcoming',
  },
  {
    id: 2,
    eventTitle: 'Tech Summit 2026: Future of AI in Africa',
    date: '2026-01-20T09:00:00',
    location: 'Sarit Centre, Nairobi',
    ticketType: 'VIP',
    quantity: 1,
    totalPrice: 8000,
    image: 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-2_sdkgcm.jpg',
    status: 'past',
  },
];

const savedEvents = [
  {
    id: 3,
    title: 'Nairobi Food Festival: Taste of East Africa',
    date: '2026-02-25T12:00:00',
    location: 'Uhuru Gardens, Nairobi',
    price: 1500,
    image: 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062127/event-3_g7dion.jpg',
  },
  {
    id: 4,
    title: 'Sunset Yoga & Meditation Retreat',
    date: '2026-02-18T17:30:00',
    location: 'Karura Forest, Nairobi',
    price: 1000,
    image: 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-4_fpa1yh.jpg',
  },
];

const myEvents = [
  {
    id: 1,
    title: 'Business Networking Mixer',
    date: '2026-02-22T18:00:00',
    location: 'Villa Rosa Kempinski, Nairobi',
    ticketsSold: 85,
    totalTickets: 100,
    revenue: 255000,
    status: 'active',
    image: 'https://res.cloudinary.com/dtbe44muv/image/upload/v1770062125/event-7_w5nira.jpg',
  },
];

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-[#F05537]/10 text-[#F05537]'
        : 'text-[#6F7287] hover:bg-[#F8F7FA]'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

const TicketsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1E0A3C]">My Tickets</h2>
    
    {/* Upcoming */}
    <div>
      <h3 className="text-lg font-semibold text-[#39364F] mb-4">Upcoming Events</h3>
      {myTickets.filter(t => t.status === 'upcoming').map((ticket) => (
        <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex gap-4">
            <img
              src={ticket.image}
              alt={ticket.eventTitle}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-[#1E0A3C] mb-1">{ticket.eventTitle}</h4>
              <div className="flex items-center gap-4 text-sm text-[#6F7287] mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(ticket.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ticket.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6F7287]">
                  {ticket.quantity} x {ticket.ticketType}
                </span>
                <span className="font-semibold text-[#F05537]">
                  {formatCurrency(ticket.totalPrice)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E6E5E8] flex gap-3">
            <Button variant="outline" className="flex-1">
              View Ticket
            </Button>
            <Button variant="outline" className="flex-1">
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>

    {/* Past */}
    <div>
      <h3 className="text-lg font-semibold text-[#39364F] mb-4">Past Events</h3>
      {myTickets.filter(t => t.status === 'past').map((ticket) => (
        <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-sm mb-4 opacity-60">
          <div className="flex gap-4">
            <img
              src={ticket.image}
              alt={ticket.eventTitle}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-[#1E0A3C] mb-1">{ticket.eventTitle}</h4>
              <div className="flex items-center gap-4 text-sm text-[#6F7287] mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(ticket.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ticket.location}
                </span>
              </div>
              <span className="text-sm text-[#6F7287]">
                {ticket.quantity} x {ticket.ticketType}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SavedEventsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1E0A3C]">Saved Events</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {savedEvents.map((event) => (
        <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-40 object-cover"
          />
          <div className="p-4">
            <h4 className="font-semibold text-[#1E0A3C] mb-2">{event.title}</h4>
            <div className="flex items-center gap-4 text-sm text-[#6F7287] mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F05537]">
                {formatCurrency(event.price)}
              </span>
              <Button size="sm" className="bg-[#F05537] hover:bg-[#D94E32]">
                Get Tickets
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MyEventsView = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-[#1E0A3C]">My Events</h2>
      <Link to="/create-event">
        <Button className="bg-[#F05537] hover:bg-[#D94E32]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </Link>
    </div>

    {myEvents.map((event) => (
      <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex gap-6">
          <img
            src={event.image}
            alt={event.title}
            className="w-32 h-32 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-[#1E0A3C] text-lg mb-2">{event.title}</h4>
                <div className="flex items-center gap-4 text-sm text-[#6F7287] mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-[#F8F7FA] rounded-lg p-3">
                <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                <p className="text-xl font-bold text-[#1E0A3C]">
                  {event.ticketsSold}/{event.totalTickets}
                </p>
              </div>
              <div className="bg-[#F8F7FA] rounded-lg p-3">
                <p className="text-sm text-[#6F7287]">Revenue</p>
                <p className="text-xl font-bold text-[#F05537]">
                  {formatCurrency(event.revenue)}
                </p>
              </div>
              <div className="bg-[#F8F7FA] rounded-lg p-3">
                <p className="text-sm text-[#6F7287]">Attendance</p>
                <p className="text-xl font-bold text-[#1E0A3C]">
                  {Math.round((event.ticketsSold / event.totalTickets) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E6E5E8] flex gap-3">
          <Button variant="outline" className="flex-1">
            Edit Event
          </Button>
          <Button variant="outline" className="flex-1">
            View Attendees
          </Button>
          <Button variant="outline" className="flex-1">
            Analytics
          </Button>
        </div>
      </div>
    ))}
  </div>
);

const AnalyticsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1E0A3C]">Analytics</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-[#6F7287]">Total Events</p>
        <p className="text-3xl font-bold text-[#1E0A3C]">12</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-[#6F7287]">Total Tickets Sold</p>
        <p className="text-3xl font-bold text-[#1E0A3C]">1,234</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-[#6F7287]">Total Revenue</p>
        <p className="text-3xl font-bold text-[#F05537]">KES 2.5M</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-[#6F7287]">Avg. Attendance</p>
        <p className="text-3xl font-bold text-[#1E0A3C]">87%</p>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#39364F] mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {[
          { action: 'New ticket purchase', event: 'Business Networking Mixer', time: '2 minutes ago', amount: 'KES 3,000' },
          { action: 'Event created', event: 'Tech Workshop 2026', time: '1 hour ago', amount: null },
          { action: 'Ticket refunded', event: 'Jazz Night', time: '3 hours ago', amount: 'KES 2,500' },
          { action: 'New ticket purchase', event: 'Food Festival', time: '5 hours ago', amount: 'KES 1,500' },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-[#E6E5E8] last:border-0">
            <div>
              <p className="font-medium text-[#39364F]">{item.action}</p>
              <p className="text-sm text-[#6F7287]">{item.event} • {item.time}</p>
            </div>
            {item.amount && (
              <span className="font-semibold text-[#F05537]">{item.amount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProfileView = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1E0A3C]">Profile Settings</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-[#F05537] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#1E0A3C]">{user?.name || 'User'}</h3>
            <p className="text-[#6F7287]">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-[#F05537]/10 text-[#F05537] rounded-full text-sm capitalize">
              {user?.role || 'Attendee'}
            </span>
          </div>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#39364F] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="+254 700 000 000"
              className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
            />
          </div>
          <Button className="bg-[#F05537] hover:bg-[#D94E32]">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isOrganizer = user?.role === 'organizer';

  const sidebarItems = [
    { to: '/dashboard/tickets', icon: Ticket, label: 'My Tickets' },
    { to: '/dashboard/saved', icon: Heart, label: 'Saved Events' },
    ...(isOrganizer ? [
      { to: '/dashboard/events', icon: Calendar, label: 'My Events' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    ] : []),
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-24">
              <div className="mb-6 px-4">
                <p className="text-sm text-[#6F7287]">Welcome back,</p>
                <p className="font-semibold text-[#1E0A3C]">{user?.name || 'User'}</p>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.to}
                    {...item}
                    active={location.pathname === item.to}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/tickets" element={<TicketsView />} />
              <Route path="/saved" element={<SavedEventsView />} />
              <Route path="/events" element={<MyEventsView />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/" element={<TicketsView />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
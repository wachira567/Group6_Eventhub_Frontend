import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Eye,
  ChevronLeft,
  Search,
  Loader2,
  User,
  Settings,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { formatDate, formatTime, formatCurrency } from "../../utils/helpers";
import { API_BASE_URL } from "../../utils/constants";

const sidebarItems = [
  { to: "/attendee", icon: User, label: "Overview", active: false },
  { to: "/attendee/tickets", icon: Ticket, label: "My Tickets", active: true },
  { to: "/attendee/saved", icon: Ticket, label: "Saved Events", active: false },
  {
    to: "/attendee/settings",
    icon: Settings,
    label: "Settings",
    active: false,
  },
];

const MyTickets = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  // Filter tickets by status and search query
  const now = new Date();
  const filteredTickets = tickets.filter((ticket) => {
    const eventDate = ticket.event ? new Date(ticket.event.start_date) : null;
    // Check payment_status - handle both string and enum object formats
    const isPaid =
      ticket.payment_status === "completed" ||
      ticket.payment_status === "COMPLETED";
    const isUpcoming = eventDate && eventDate >= now && isPaid;
    const isPast = eventDate && eventDate < now && isPaid;

    const matchesTab = activeTab === "upcoming" ? isUpcoming : isPast;
    const matchesSearch =
      searchQuery === "" ||
      ticket.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event?.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          <span className="text-[#6F7287]">Loading your tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/attendee"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#F05537] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-[#6F7287]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? "bg-[#F05537]/10 text-[#F05537]"
                        : "text-[#6F7287] hover:bg-[#F8F7FA]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-[#E6E5E8]">
                <h1 className="text-2xl font-bold text-[#1E0A3C] mb-4">
                  My Tickets
                </h1>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                    {error}
                  </div>
                )}

                {/* Tabs and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "upcoming"
                          ? "bg-[#F05537] text-white"
                          : "bg-[#F8F7FA] text-[#6F7287] hover:bg-[#E6E5E8]"
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setActiveTab("past")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "past"
                          ? "bg-[#F05537] text-white"
                          : "bg-[#F8F7FA] text-[#6F7287] hover:bg-[#E6E5E8]"
                      }`}
                    >
                      Past Events
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="p-6">
                {filteredTickets.length > 0 ? (
                  <div className="space-y-6">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`border rounded-xl overflow-hidden ${
                          activeTab === "upcoming"
                            ? "border-[#E6E5E8]"
                            : "border-[#E6E5E8] opacity-70"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Event Image */}
                          <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                            <img
                              src={
                                ticket.event?.image_url ||
                                "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062126/event-1_ivv30i.jpg"
                              }
                              alt={ticket.event?.title || "Event"}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Ticket Details */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                                  {ticket.event?.title || "Event"}
                                </h3>
                                <div className="space-y-2 text-sm text-[#6F7287]">
                                  <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(ticket.event?.start_date)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(ticket.event?.start_date)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {ticket.event?.location}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-[#6F7287]">
                                  Ticket #{ticket.ticket_number}
                                </p>
                                <p className="font-semibold text-[#F05537] mt-1">
                                  {formatCurrency(ticket.total_price)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#E6E5E8] flex flex-wrap items-center justify-between gap-4">
                              <div className="flex gap-4 text-sm">
                                <span className="text-[#6F7287]">
                                  <span className="font-medium text-[#39364F]">
                                    {ticket.quantity}
                                  </span>{" "}
                                  x {ticket.ticket_type_name || "Ticket"}
                                </span>
                              </div>

                              <div className="flex gap-3">
                                {activeTab === "past" && (
                                  <Button variant="outline" size="sm">
                                    Leave Review
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F8F7FA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-[#A9A8B3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">
                      {activeTab === "upcoming"
                        ? "No upcoming tickets"
                        : "No past events"}
                    </h3>
                    <p className="text-[#6F7287] mb-4">
                      {activeTab === "upcoming"
                        ? "You don't have any upcoming events. Time to explore!"
                        : "You haven't attended any events yet."}
                    </p>
                    {activeTab === "upcoming" && (
                      <Link to="/events">
                        <Button className="bg-[#F05537] hover:bg-[#D94E32]">
                          Browse Events
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;

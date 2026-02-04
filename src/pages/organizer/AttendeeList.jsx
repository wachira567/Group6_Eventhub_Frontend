import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, Download, Mail, Users, Check, X, Filter, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import { toast } from 'sonner';

const AttendeeList = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventAndAttendees();
  }, [id]);

  const fetchEventAndAttendees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch event details
      const eventResponse = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!eventResponse.ok) {
        throw new Error('Failed to fetch event details');
      }

      const eventData = await eventResponse.json();
      setEvent(eventData.event);

      // Fetch attendees
      const attendeesResponse = await fetch(`${API_BASE_URL}/analytics/event/${id}/attendees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!attendeesResponse.ok) {
        throw new Error('Failed to fetch attendees');
      }

      const attendeesData = await attendeesResponse.json();
      
      // Transform attendee data to match the expected format
      const transformedAttendees = attendeesData.attendees?.map((attendee, index) => ({
        id: index + 1,
        name: attendee.user_name,
        email: attendee.user_email,
        phone: '-', // Phone not available from API
        ticketType: attendee.ticket_type,
        quantity: attendee.quantity,
        amount: 0, // Will be calculated if needed
        status: 'confirmed', // All returned attendees have completed payment
        checkedIn: false, // Check-in status not available from current API
        checkInTime: null,
        ticketNumber: attendee.ticket_number,
        purchasedAt: attendee.purchased_at,
      })) || [];
      
      setAttendees(transformedAttendees);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendees data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: attendees.length,
    confirmed: attendees.filter(a => a.status === 'confirmed').length,
    checkedIn: attendees.filter(a => a.checkedIn).length,
    cancelled: attendees.filter(a => a.status === 'cancelled').length,
    totalRevenue: attendees
      .filter(a => a.status === 'confirmed')
      .reduce((sum, a) => sum + (a.amount * a.quantity), 0),
  };

  const toggleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedAttendees.includes(id)) {
      setSelectedAttendees(selectedAttendees.filter(aid => aid !== id));
    } else {
      setSelectedAttendees([...selectedAttendees, id]);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Ticket Type', 'Quantity', 'Ticket Number', 'Purchase Date'];
    const rows = filteredAttendees.map(a => [
      a.name,
      a.email,
      a.ticketType,
      a.quantity,
      a.ticketNumber,
      a.purchasedAt ? new Date(a.purchasedAt).toLocaleString() : '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${event?.title?.replace(/\s+/g, '-').toLowerCase() || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendees list exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/organizer/my-events"
            className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Events
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <OrganizerSidebar />
            <div className="flex-1 flex items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-[#F05537] animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/organizer/my-events"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Events
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Event Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h1 className="text-2xl font-bold text-[#1E0A3C]">{event?.title || 'Event'}</h1>
              <p className="text-[#6F7287]">{event?.start_date ? formatDate(event.start_date) : '-'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-[#1E0A3C]">{stats.total}</p>
                <p className="text-sm text-[#6F7287]">Total</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-sm text-[#6F7287]">Confirmed</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.checkedIn}</p>
                <p className="text-sm text-[#6F7287]">Checked In</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                <p className="text-sm text-[#6F7287]">Cancelled</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-[#F05537]">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-[#6F7287]">Revenue</p>
              </div>
            </div>

            {/* Actions & Filters */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="p-4 border-b border-[#E6E5E8] flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Attendees Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E6E5E8] bg-[#F8F7FA]">
                      <th className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-[#F05537] rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Attendee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Ticket</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#6F7287]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Purchase Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-[#6F7287]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="border-b border-[#E6E5E8] last:border-0 hover:bg-[#F8F7FA]">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.includes(attendee.id)}
                            onChange={() => toggleSelect(attendee.id)}
                            className="w-4 h-4 text-[#F05537] rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[#39364F]">{attendee.name}</p>
                            <p className="text-sm text-[#6F7287]">{attendee.email}</p>
                            <p className="text-xs text-[#A9A8B3]">Ticket: {attendee.ticketNumber}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#39364F]">{attendee.ticketType}</span>
                          <span className="text-sm text-[#6F7287] ml-2">x{attendee.quantity}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            attendee.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {attendee.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#6F7287]">
                            {attendee.purchasedAt ? formatDate(attendee.purchasedAt) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a href={`mailto:${attendee.email}`}>
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">No attendees found</h3>
                  <p className="text-[#6F7287]">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeList;

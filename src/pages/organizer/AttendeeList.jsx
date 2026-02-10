import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, Download, Mail, Users, Check, X, Filter, Loader2, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import { toast } from 'sonner';

const AttendeeList = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkedInFilter, setCheckedInFilter] = useState('all');
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_tickets: 0,
    checked_in: 0,
    pending: 0,
    total_revenue: 0
  });

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

      // Fetch attendees with check-in status
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
        id: attendee.id || index + 1,
        ticket_id: attendee.ticket_id,
        ticket_number: attendee.ticket_number,
        name: attendee.user_name,
        email: attendee.user_email,
        phone: '-',
        ticketType: attendee.ticket_type,
        ticket_type_id: attendee.ticket_type_id,
        quantity: attendee.quantity,
        amount: attendee.total_price,
        status: attendee.payment_status === 'COMPLETED' ? 'confirmed' : 
                attendee.payment_status === 'PENDING' ? 'pending' : 'cancelled',
        checkedIn: attendee.is_checked_in,
        checkInTime: attendee.checked_in_at,
        verifiedBy: attendee.verified_by,
        purchasedAt: attendee.purchased_at,
        is_guest: attendee.is_guest,
      })) || [];
      
      setAttendees(transformedAttendees);
      
      // Set stats from API
      if (attendeesData.stats) {
        setStats({
          total_tickets: attendeesData.stats.total_tickets || 0,
          checked_in: attendeesData.stats.checked_in || 0,
          pending: attendeesData.stats.pending || 0,
          total_revenue: attendeesData.stats.total_revenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendees data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch = 
      (attendee.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (attendee.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (attendee.ticket_number?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter;
    const matchesCheckedIn = checkedInFilter === 'all' || 
      (checkedInFilter === 'checked_in' && attendee.checkedIn) ||
      (checkedInFilter === 'not_checked_in' && !attendee.checkedIn);
    
    return matchesSearch && matchesStatus && matchesCheckedIn;
  });

  const calculateStats = () => {
    return {
      total: attendees.length,
      confirmed: attendees.filter(a => a.status === 'confirmed').length,
      pending: attendees.filter(a => a.status === 'pending').length,
      cancelled: attendees.filter(a => a.status === 'cancelled').length,
      checkedIn: attendees.filter(a => a.checkedIn).length,
      notCheckedIn: attendees.filter(a => !a.checkedIn && a.status === 'confirmed').length,
      totalRevenue: attendees
        .filter(a => a.status === 'confirmed')
        .reduce((sum, a) => sum + (a.amount * a.quantity), 0),
    };
  };

  const currentStats = calculateStats();

  const toggleSelectAll = () => {
    if (currentStats.total === 0) return;
    if (filteredAttendees.length === 0) return;
    // For simplicity, we won't implement bulk selection for this version
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Ticket Number', 
      'Name', 
      'Email', 
      'Ticket Type', 
      'Quantity', 
      'Price', 
      'Status',
      'Checked In',
      'Checked In At',
      'Purchase Date'
    ];
    
    const rows = filteredAttendees.map(a => [
      a.ticket_number,
      a.name,
      a.email,
      a.ticketType,
      a.quantity,
      a.amount.toFixed(2),
      a.status,
      a.checkedIn ? 'Yes' : 'No',
      a.checkInTime ? formatDateTime(a.checkInTime) : '-',
      a.purchasedAt ? formatDateTime(a.purchasedAt) : '-'
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
                <p className="text-2xl font-bold text-[#1E0A3C]">{currentStats.total}</p>
                <p className="text-sm text-[#6F7287]">Total Tickets</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-green-600">{currentStats.checkedIn}</p>
                <p className="text-sm text-[#6F7287]">Checked In</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-yellow-600">{currentStats.notCheckedIn}</p>
                <p className="text-sm text-[#6F7287]">Not Checked In</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600">{currentStats.confirmed}</p>
                <p className="text-sm text-[#6F7287]">Confirmed</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-[#F05537]">{formatCurrency(currentStats.totalRevenue)}</p>
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
                    placeholder="Search by name, email, or ticket number..."
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
                  <option value="all">All Payment Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={checkedInFilter}
                  onChange={(e) => setCheckedInFilter(e.target.value)}
                  className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                >
                  <option value="all">All Check-in Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Ticket #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Attendee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Ticket Type</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#6F7287]">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#6F7287]">Check-in</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Purchase Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-[#6F7287]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="border-b border-[#E6E5E8] last:border-0 hover:bg-[#F8F7FA]">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-[#1E0A3C]">{attendee.ticket_number}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[#39364F]">
                              {attendee.name}
                              {attendee.is_guest && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Guest</span>
                              )}
                            </p>
                            <p className="text-sm text-[#6F7287]">{attendee.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#39364F]">{attendee.ticketType}</span>
                          <span className="text-sm text-[#6F7287] ml-2">x{attendee.quantity}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            attendee.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            attendee.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {attendee.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {attendee.checkedIn ? (
                            <div className="flex flex-col items-center">
                              <Check className="w-5 h-5 text-green-600" />
                              {attendee.checkInTime && (
                                <span className="text-xs text-green-600 mt-1">
                                  {formatDateTime(attendee.checkInTime)}
                                </span>
                              )}
                              {attendee.verifiedBy && (
                                <span className="text-xs text-gray-500">by {attendee.verifiedBy}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#6F7287]">
                            {attendee.purchasedAt ? formatDateTime(attendee.purchasedAt) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a href={`mailto:${attendee.email}`}>
                              <Button variant="ghost" size="sm" title="Send Email">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </a>
                          </div>
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

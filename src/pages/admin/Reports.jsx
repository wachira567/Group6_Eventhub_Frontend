import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ChevronLeft, Download, FileText, Calendar, DollarSign, 
  Users, TrendingUp, Filter, Loader2, FileSpreadsheet,
  BarChart3, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/utils/constants';

const reportTemplates = [
  {
    id: 'overview',
    name: 'Platform Overview',
    icon: TrendingUp,
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    icon: DollarSign,
  },
  {
    id: 'events',
    name: 'Event Performance',
    icon: Calendar,
  },
  {
    id: 'users',
    name: 'User Analytics',
    icon: Users,
  },
];

const Reports = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('all');
  
  // Export states
  const [exporting, setExporting] = useState(null);

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (eventType !== 'all') params.append('type', eventType);
      
      // Fetch overview stats
      const overviewRes = await fetch(`${API_BASE_URL}/reports/analytics?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const overviewData = await overviewRes.json();
      setReportData(overviewData);
      
      // Fetch events export data
      const eventsRes = await fetch(`${API_BASE_URL}/reports/events/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventsResult = await eventsRes.json();
      setEventsData(eventsResult.events || []);
      
      // Fetch users export data
      const usersRes = await fetch(`${API_BASE_URL}/reports/users/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersResult = await usersRes.json();
      setUsersData(usersResult.users || []);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    if (token) {
      fetchReportData();
    }
  }, [token, startDate, endDate, eventType]);

  // Handle CSV export
  const handleExport = async (type) => {
    try {
      setExporting(type);
      
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      let endpoint = '';
      switch (type) {
        case 'users': endpoint = `/reports/users/export?${params}`; break;
        case 'events': endpoint = `/reports/events/export?${params}`; break;
        case 'tickets': endpoint = `/reports/tickets/export?${params}`; break;
        default: return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#1E0A3C]">Reports & Analytics</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('events')} disabled={exporting === 'events'}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Events
            </Button>
            <Button variant="outline" onClick={() => handleExport('users')} disabled={exporting === 'users'}>
              <Users className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button variant="outline" onClick={() => handleExport('tickets')} disabled={exporting === 'tickets'}>
              <FileText className="w-4 h-4 mr-2" />
              Export Tickets
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">Event Status</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                >
                  <option value="all">All Events</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setEventType('all');
                  }}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {reportTemplates.map((template) => (
            <Button
              key={template.id}
              variant={activeTab === template.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(template.id)}
              className={activeTab === template.id ? 'bg-[#F05537] hover:bg-[#D94E32]' : ''}
            >
              <template.icon className="w-4 h-4 mr-2" />
              {template.name}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && reportData && (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#6F7287]">Total Users</p>
                          <p className="text-2xl font-bold text-[#1E0A3C]">{reportData.overview?.total_users || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#6F7287]">Total Events</p>
                          <p className="text-2xl font-bold text-[#1E0A3C]">{reportData.overview?.total_events || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                          <p className="text-2xl font-bold text-[#1E0A3C]">{reportData.overview?.total_tickets_sold || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#6F7287]">Total Revenue</p>
                          <p className="text-2xl font-bold text-[#1E0A3C]">KES {Number(reportData.overview?.total_revenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Stats */}
                {reportData.revenue && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Revenue Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-[#6F7287]">Total Revenue</p>
                          <p className="text-xl font-bold text-[#1E0A3C]">KES {Number(reportData.revenue.total_revenue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6F7287]">Transactions</p>
                          <p className="text-xl font-bold text-[#1E0A3C]">{reportData.revenue.transaction_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6F7287]">Avg Transaction</p>
                          <p className="text-xl font-bold text-[#1E0A3C]">KES {Number(reportData.revenue.average_transaction || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Role Distribution */}
                {reportData.users?.role_distribution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        User Role Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(reportData.users.role_distribution).map(([role, count]) => (
                          <div key={role} className="text-center p-4 bg-[#F8F7FA] rounded-lg">
                            <p className="text-2xl font-bold text-[#1E0A3C]">{count}</p>
                            <p className="text-sm text-[#6F7287]">{role}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Events Performance ({eventsData.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Event</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-right py-3 px-4">Tickets</th>
                          <th className="text-right py-3 px-4">Sold</th>
                          <th className="text-right py-3 px-4">Revenue</th>
                          <th className="text-right py-3 px-4">Occupancy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventsData.map((event) => (
                          <tr key={event.id} className="border-b hover:bg-[#F8F7FA]">
                            <td className="py-3 px-4">
                              <p className="font-medium text-[#1E0A3C]">{event.title}</p>
                              <p className="text-xs text-[#6F7287]">{event.venue || 'No venue'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                event.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {event.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">{event.total_tickets}</td>
                            <td className="py-3 px-4 text-right">{event.sold_tickets}</td>
                            <td className="py-3 px-4 text-right">KES {Number(event.revenue || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#F05537]" 
                                    style={{ width: `${event.occupancy_rate}%` }}
                                  />
                                </div>
                                <span className="text-xs">{Number(event.occupancy_rate || 0).toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {eventsData.length === 0 && (
                      <p className="text-center text-[#6F7287] py-8">No events found with current filters</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Analytics ({usersData.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-left py-3 px-4">Verified</th>
                          <th className="text-right py-3 px-4">Tickets</th>
                          <th className="text-right py-3 px-4">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-[#F8F7FA]">
                            <td className="py-3 px-4">
                              <p className="font-medium text-[#1E0A3C]">{user.name}</p>
                              <p className="text-xs text-[#6F7287]">{user.email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {user.is_verified ? (
                                <span className="text-green-600">✓ Yes</span>
                              ) : (
                                <span className="text-red-600">✗ No</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">{user.total_tickets}</td>
                            <td className="py-3 px-4 text-right">KES {Number(user.total_spent || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {usersData.length === 0 && (
                      <p className="text-center text-[#6F7287] py-8">No users found with current filters</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && reportData?.revenue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-[#F8F7FA] rounded-lg">
                      <p className="text-sm text-[#6F7287]">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#1E0A3C]">KES {Number(reportData.revenue.total_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[#F8F7FA] rounded-lg">
                      <p className="text-sm text-[#6F7287]">Transactions</p>
                      <p className="text-2xl font-bold text-[#1E0A3C]">{reportData.revenue.transaction_count || 0}</p>
                    </div>
                    <div className="p-4 bg-[#F8F7FA] rounded-lg">
                      <p className="text-sm text-[#6F7287]">Average</p>
                      <p className="text-2xl font-bold text-[#1E0A3C]">KES {Number(reportData.revenue.average_transaction || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-[#F8F7FA] rounded-lg">
                      <p className="text-sm text-[#6F7287]">Tickets Sold</p>
                      <p className="text-2xl font-bold text-[#1E0A3C]">{reportData.overview?.total_tickets_sold || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

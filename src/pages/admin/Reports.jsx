import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, Download, FileText, Calendar, DollarSign, Users, TrendingUp, Filter, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../utils/constants';

const reportTemplates = [
  {
    id: 'overview',
    name: 'Platform Overview',
    description: 'Complete platform statistics and metrics',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Revenue breakdown and financial analytics',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'events',
    name: 'Event Performance',
    description: 'Event statistics and ticket sales analysis',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'users',
    name: 'User Analytics',
    description: 'User growth and engagement metrics',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'full',
    name: 'Full Report',
    description: 'Complete platform report with all data',
    icon: FileText,
    color: 'bg-red-100 text-red-600',
  },
];

const Reports = () => {
  const { token } = useSelector((state) => state.auth);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('pdf');

  const handleDownloadPDF = async (templateId) => {
    try {
      setGenerating(templateId);
      
      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: templateId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Get the blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eventhub_${templateId}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadCSV = async (exportType) => {
    try {
      setGenerating(exportType);
      
      let endpoint = '';
      switch (exportType) {
        case 'users':
          endpoint = '/reports/users/export';
          break;
        case 'events':
          endpoint = '/reports/events/export';
          break;
        case 'tickets':
          endpoint = '/reports/tickets/export';
          break;
        default:
          return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateReport = () => {
    if (format === 'pdf') {
      handleDownloadPDF(reportType);
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
          <h1 className="text-2xl font-bold text-[#1E0A3C]">Reports</h1>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="bg-[#F05537] hover:bg-[#D94E32]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {reportTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setReportType(template.id);
                setShowGenerateModal(true);
              }}
              className="bg-white rounded-xl p-6 shadow-sm text-left hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mb-4`}>
                <template.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#1E0A3C] mb-1">{template.name}</h3>
              <p className="text-sm text-[#6F7287]">{template.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Export Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-[#E6E5E8]">
            <h2 className="text-lg font-semibold text-[#1E0A3C]">Quick Export (CSV)</h2>
            <p className="text-sm text-[#6F7287] mt-1">Download data in CSV format for further analysis</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleDownloadCSV('users')}
                disabled={generating === 'users'}
                className="flex items-center gap-4 p-4 bg-[#F8F7FA] rounded-lg hover:bg-[#E6E5E8] transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#39364F]">Users Export</p>
                  <p className="text-sm text-[#6F7287]">Download all user data</p>
                </div>
                {generating === 'users' && (
                  <Loader2 className="w-5 h-5 animate-spin ml-auto" />
                )}
              </button>

              <button
                onClick={() => handleDownloadCSV('events')}
                disabled={generating === 'events'}
                className="flex items-center gap-4 p-4 bg-[#F8F7FA] rounded-lg hover:bg-[#E6E5E8] transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#39364F]">Events Export</p>
                  <p className="text-sm text-[#6F7287]">Download all events data</p>
                </div>
                {generating === 'events' && (
                  <Loader2 className="w-5 h-5 animate-spin ml-auto" />
                )}
              </button>

              <button
                onClick={() => handleDownloadCSV('tickets')}
                disabled={generating === 'tickets'}
                className="flex items-center gap-4 p-4 bg-[#F8F7FA] rounded-lg hover:bg-[#E6E5E8] transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#39364F]">Tickets Export</p>
                  <p className="text-sm text-[#6F7287]">Download all tickets data</p>
                </div>
                {generating === 'tickets' && (
                  <Loader2 className="w-5 h-5 animate-spin ml-auto" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Reports */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E6E5E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-[#1E0A3C]">Report Templates</h2>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
              >
                <option value="all">All Types</option>
                <option value="overview">Overview</option>
                <option value="revenue">Revenue</option>
                <option value="events">Events</option>
                <option value="users">Users</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates
                .filter(t => typeFilter === 'all' || t.id === typeFilter || (typeFilter === 'overview' && t.id === 'overview'))
                .map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-[#F8F7FA] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center`}>
                        <template.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#39364F]">{template.name}</h3>
                        <p className="text-sm text-[#6F7287]">{template.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(template.id)}
                      disabled={generating === template.id}
                    >
                      {generating === template.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      PDF
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#1E0A3C] mb-4">Generate Report</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                >
                  <option value="overview">Platform Overview</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="events">Event Performance</option>
                  <option value="users">User Analytics</option>
                  <option value="full">Full Report</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#39364F] mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#39364F] mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="text-[#F05537]"
                    />
                    <span>PDF</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="text-[#F05537]"
                    />
                    <span>CSV</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={generating !== null}
                className="flex-1 bg-[#F05537] hover:bg-[#D94E32]"
              >
                {generating !== null ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

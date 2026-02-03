import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ChevronLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  FileText,
  FileSpreadsheet,
  Loader2,
  Download,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../utils/constants';

const reportTemplates = [
  { id: 'overview', name: 'Platform Overview', description: 'Complete platform statistics and metrics', icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
  { id: 'revenue', name: 'Revenue Report', description: 'Revenue breakdown and financial analytics', icon: DollarSign, color: 'bg-green-100 text-green-600' },
  { id: 'events', name: 'Event Performance', description: 'Event statistics and ticket sales analysis', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  { id: 'users', name: 'User Analytics', description: 'User growth and engagement metrics', icon: Users, color: 'bg-orange-100 text-orange-600' },
  { id: 'full', name: 'Full Report', description: 'Complete platform report with all data', icon: FileText, color: 'bg-red-100 text-red-600' },
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

  const generatedReports = [
    { id: 1, name: 'Platform Overview', type: 'overview', date: '2024-01-12', format: 'PDF' },
    { id: 2, name: 'Revenue Report', type: 'revenue', date: '2024-01-10', format: 'PDF' },
    { id: 3, name: 'User Analytics', type: 'users', date: '2024-01-08', format: 'PDF' },
  ];

  const filteredReports =
    typeFilter === 'all'
      ? generatedReports
      : generatedReports.filter((r) => r.type === typeFilter);

  const handleDownloadCSV = async (exportType) => {
    try {
      setGenerating(exportType);
      let endpoint = '';
      if (exportType === 'users') endpoint = '/reports/users/export';
      if (exportType === 'events') endpoint = '/reports/events/export';
      if (exportType === 'tickets') endpoint = '/reports/tickets/export';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-[#6F7287] mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1E0A3C]">Reports</h1>
          <Button className="bg-[#F05537]" onClick={() => setShowGenerateModal(true)}>
            Generate Report
          </Button>
        </div>

        {/* Report templates */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {reportTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setReportType(t.id);
                setShowGenerateModal(true);
              }}
              className="bg-white p-6 rounded-xl shadow-sm text-left"
            >
              <div className={`w-12 h-12 ${t.color} rounded-lg flex items-center justify-center mb-4`}>
                <t.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-[#6F7287]">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Quick CSV export */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6 grid md:grid-cols-3 gap-4">
          {['users', 'events', 'tickets'].map((type) => (
            <button
              key={type}
              onClick={() => handleDownloadCSV(type)}
              disabled={generating === type}
              className="flex items-center gap-3 p-4 bg-[#F8F7FA] rounded-lg"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="capitalize">{type} export</span>
              {generating === type && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </button>
          ))}
        </div>

        {/* Generated reports history */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Generated Reports</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="overview">Overview</option>
                <option value="revenue">Revenue</option>
                <option value="events">Events</option>
                <option value="users">Users</option>
              </select>
            </div>
          </div>

          <div className="divide-y">
            {filteredReports.map((r) => (
              <div key={r.id} className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-[#6F7287]">{r.date} • {r.format}</p>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

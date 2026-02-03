import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, TrendingUp, DollarSign, Calendar, Users, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';

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

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1E0A3C]">Reports</h1>
      </div>
    </div>
  );
};

export default Reports;

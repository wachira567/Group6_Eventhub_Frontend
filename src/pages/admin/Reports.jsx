import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

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

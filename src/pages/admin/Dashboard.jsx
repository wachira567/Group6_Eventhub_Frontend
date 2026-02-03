import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';

const sidebarItems = [
  { to: '/admin', icon: Activity, label: 'Overview', active: true },
  { to: '/admin/users', icon: Users, label: 'User Management', active: false },
  { to: '/admin/events', icon: Calendar, label: 'Event Moderation', active: false },
  { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics', active: false },
  { to: '/admin/reports', icon: Shield, label: 'Reports', active: false },
];

const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <h1 className="text-2xl font-bold p-6">Admin Dashboard</h1>
    </div>
  );
};

export default AdminDashboard;

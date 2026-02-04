import { Link } from 'react-router-dom';
import { Ticket, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'Use EventHub': [
      { name: 'Create Events', href: '/create-event' },
      { name: 'Pricing', href: '#' },
      { name: 'Event Marketing', href: '#' },
      { name: 'Mobile App', href: '#' },
    ],
    'Plan Events': [
      { name: 'Sell Tickets Online', href: '#' },
      { name: 'Concert Tickets', href: '#' },
      { name: 'Event Payment', href: '#' },
      { name: 'QR Code Check-in', href: '#' },
    ],
    'Find Events': [
      { name: 'Nairobi Events', href: '/events?location=Nairobi' },
      { name: 'Mombasa Events', href: '/events?location=Mombasa' },
      { name: 'Kisumu Events', href: '/events?location=Kisumu' },
      { name: 'Today\'s Events', href: '/events?date=today' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-[#1E0A3C] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#F05537] rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">EventHub</span>
            </Link>
            <p className="text-[#A9A8B3] mb-6 max-w-sm">
              EventHub - Discover and book tickets for the best events in Kenya. From concerts to conferences, find your next unforgettable experience.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#A9A8B3]">

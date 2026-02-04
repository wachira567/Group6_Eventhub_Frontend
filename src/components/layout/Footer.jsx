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

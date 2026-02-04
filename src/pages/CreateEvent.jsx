import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Ticket,
  Plus,
  X,
  ChevronLeft,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { CATEGORIES } from '../utils/constants';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    image: null,
    ticketTypes: [
      { name: 'Regular', price: '', quantity: '' },
    ],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index][field] = value;
    setFormData({ ...formData, ticketTypes: newTicketTypes });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [...formData.ticketTypes, { name: '', price: '', quantity: '' }],
    });
  };

  const removeTicketType = (index) => {
    const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData({ ...formData, ticketTypes: newTicketTypes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate event creation
    alert('Event created successfully!');
    navigate('/dashboard/events');
  };

  const steps = [
    { number: 1, title: 'Event Details' },
    { number: 2, title: 'Date & Location' },
    { number: 3, title: 'Tickets' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E6E5E8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-[#1E0A3C]">Create Event</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#E6E5E8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step >= s.number
                      ? 'bg-[#F05537] text-white'
                      : 'bg-[#E6E5E8] text-[#6F7287]'
                  }`}
                >
                  {s.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    step >= s.number ? 'text-[#39364F]' : 'text-[#A9A8B3]'
                  }`}
                >
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                      step > s.number ? 'bg-[#F05537]' : 'bg-[#E6E5E8]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-semibold text-[#1E0A3C]">Event Details</h2>

              {/* Event Image */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Event Image
                </label>
                <div className="border-2 border-dashed border-[#D2D2D6] rounded-xl p-8 text-center hover:border-[#F05537] transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
                  <p className="text-[#39364F] font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-[#A9A8B3]">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Event Title *

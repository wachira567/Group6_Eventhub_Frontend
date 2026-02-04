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
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                  placeholder="Give your event a catchy title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none resize-none"
                  placeholder="Describe your event..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-semibold text-[#1E0A3C]">Date & Location</h2>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#39364F] mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#39364F] mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Venue Name *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                    placeholder="e.g., Carnivore Restaurant"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#39364F] mb-2">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none resize-none"
                  placeholder="Full address for attendees"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-semibold text-[#1E0A3C]">Tickets</h2>

              {formData.ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="border border-[#E6E5E8] rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#39364F]">Ticket Type {index + 1}</h3>
                    {formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="text-[#C5162E] hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-[#6F7287] mb-1">Name</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                        placeholder="e.g., VIP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#6F7287] mb-1">Price (KES)</label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#6F7287] mb-1">Quantity</label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                        placeholder="100"
                      />
                    </div>
                  </div>

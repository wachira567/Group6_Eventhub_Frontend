import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Plus,
  X,
  ChevronLeft,
  Upload,
  Check,
  Loader2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { CATEGORIES, API_BASE_URL } from '../../utils/constants';
import { uploadImage, validateImage } from '../../utils/cloudinary';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import MapLocationPicker from '../../components/events/MapLocationPicker';
import TagsInput from '../../components/events/TagsInput';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    coordinates: null,
    image: null,
    imageUrl: '',
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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file, { maxSize: 5 });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await uploadImage(file, 'events');
      setFormData({
        ...formData,
        image: file,
        imageUrl: result.url,
        imagePublicId: result.publicId,
      });
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
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
    if (formData.ticketTypes.length > 1) {
      const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
      setFormData({ ...formData, ticketTypes: newTicketTypes });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.imageUrl) {
      toast.error('Please upload an event image');
      return;
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to create an event');
      navigate('/login');
      return;
    }

    try {
      // Combine date and time for start and end dates
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const eventPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        venue: formData.location,
        address: formData.address,

        city: formData.address.split(',').pop()?.trim() || formData.location,
        latitude: formData.coordinates ? formData.coordinates[1] : null,
        longitude: formData.coordinates ? formData.coordinates[0] : null,
        image_url: formData.imageUrl,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        ticket_types: formData.ticketTypes.map(t => ({
          name: t.name,
          description: '',
          price: parseFloat(t.price),
          quantity: parseInt(t.quantity),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Authentication failed', {
            description: 'Please log in again to continue.',
          });
          navigate('/login');
        } else {
          toast.error('Failed to create event', {
            description: data.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      toast.success('Event created successfully!', {
        description: 'Your event has been created and is pending approval.',
      });
      navigate('/organizer/my-events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again later.',
      });
    }
  };

  const steps = [
    { number: 1, title: 'Event Details' },
    { number: 2, title: 'Date & Location' },
    { number: 3, title: 'Tickets' },
  ];

  const isStep1Valid = formData.title && formData.category && formData.description && formData.imageUrl;
  const isStep2Valid = formData.date && formData.startTime && formData.endTime && formData.location && formData.address;
  const isStep3Valid = formData.ticketTypes.every(t => t.name && t.price && t.quantity);

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Events
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-[#1E0A3C]">Create Event</h1>
              <p className="text-[#6F7287]">Fill in the details below to create your event</p>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                        step > s.number
                          ? 'bg-green-500 text-white'
                          : step === s.number
                          ? 'bg-[#F05537] text-white'
                          : 'bg-[#E6E5E8] text-[#6F7287]'
                      }`}
                    >
                      {step > s.number ? <Check className="w-4 h-4" /> : s.number}
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
                          step > s.number ? 'bg-green-500' : 'bg-[#E6E5E8]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold text-[#1E0A3C]">Event Details</h2>

                  {/* Event Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">
                      Event Image *
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {previewImage ? (
                      <div className="relative rounded-xl overflow-hidden">
                        <img
                          src={previewImage}
                          alt="Event preview"
                          className="w-full h-64 object-cover"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p>Uploading...</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFormData({ ...formData, image: null, imageUrl: '', imagePublicId: '' });
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50"
                          disabled={uploading}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#D2D2D6] rounded-xl p-8 text-center hover:border-[#F05537] transition-colors"
                      >
                        <Upload className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
                        <p className="text-[#39364F] font-medium mb-1">
                          Click to upload event image
                        </p>
                        <p className="text-sm text-[#A9A8B3]">
                          PNG, JPG or WebP (max. 5MB)
                        </p>
                      </button>
                    )}
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

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Event Tags
                    </label>
                    <div className="p-4 border border-[#D2D2D6] rounded-lg">
                      <TagsInput
                        tags={formData.tags}
                        onChange={(tags) => setFormData({ ...formData, tags })}
                      />
                    </div>
                    <p className="text-xs text-[#6F7287] mt-1">
                      Add tags to help attendees find your event (e.g., tech, conference, music, festival)
                    </p>
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
                      placeholder="Describe your event, what attendees can expect, and any important details..."
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
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                      />
                    </div>
                    <p className="text-xs text-[#6F7287] mt-1">Past dates are disabled</p>
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

                  {/* Map Location Picker */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pin Location on Map *
                    </label>
                    <div className="border border-[#D2D2D6] rounded-lg p-4">
                      <MapLocationPicker
                        initialCoordinates={formData.coordinates}
                        initialAddress={formData.address}
                        onLocationSelect={(location) => {
                          setFormData({
                            ...formData,
                            coordinates: location.coordinates,
                            address: location.address || formData.address,
                          });
                        }}
                        height="350px"
                      />
                    </div>
                    <p className="text-xs text-[#6F7287] mt-1">
                      Drop a pin on the map so attendees can find your event easily
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold text-[#1E0A3C]">Tickets</h2>
                  <p className="text-sm text-[#6F7287]">
                    Define your ticket types, prices, and quantities. You can add multiple ticket types (e.g., Early Bird, Regular, VIP).
                  </p>

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
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-[#6F7287] mb-1">Ticket Name *</label>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                            placeholder="e.g., VIP"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#6F7287] mb-1">Price (KES) *</label>
                          <input
                            type="number"
                            min="0"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#6F7287] mb-1">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTicketType}
                    className="flex items-center gap-2 text-[#F05537] font-medium hover:text-[#D94E32]"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Ticket Type
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                    className="bg-[#F05537] hover:bg-[#D94E32] disabled:opacity-50"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isStep3Valid}
                    className="bg-[#F05537] hover:bg-[#D94E32] disabled:opacity-50"
                  >
                    Create Event
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

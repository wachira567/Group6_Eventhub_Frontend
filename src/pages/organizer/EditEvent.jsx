import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Save,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CATEGORIES, API_BASE_URL } from '../../utils/constants';
import { uploadImage, validateImage } from '../../utils/cloudinary';
import { toast } from 'sonner';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import MapLocationPicker from '../../components/events/MapLocationPicker';
import TagsInput from '../../components/events/TagsInput';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
    imageUrl: '',
    imagePublicId: '',
    ticketTypes: [{ name: '', price: '', quantity: '' }],
  });

  // Fetch event data on mount
  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      const event = data.event;
      
      // Parse dates
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      // Format date for input (YYYY-MM-DD)
      const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      // Format time for input (HH:MM)
      const formatTimeForInput = (date) => {
        return date.toTimeString().slice(0, 5);
      };

      // Transform ticket types
      const ticketTypes = data.ticket_types?.map(tt => ({
        name: tt.name,
        price: tt.price.toString(),
        quantity: tt.quantity_total.toString(),
      })) || [{ name: '', price: '', quantity: '' }];

      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        tags: event.tags || [],
        date: formatDateForInput(startDate),
        startTime: formatTimeForInput(startDate),
        endTime: formatTimeForInput(endDate),
        location: event.location,
        address: event.venue_address || event.city || event.location,
        coordinates: event.coordinates,
        imageUrl: event.image_url,
        imagePublicId: '',
        ticketTypes: ticketTypes,
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      const result = await uploadImage(file, 'events');
      setFormData({
        ...formData,
        imageUrl: result.url,
        imagePublicId: result.publicId,
      });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
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
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Combine date and time
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        city: formData.address.split(',').pop()?.trim() || formData.location,
        category: formData.category,
        tags: formData.tags,
        coordinates: formData.coordinates,
        venue_address: formData.address,
        image_url: formData.imageUrl,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      toast.success('Event updated successfully!');
      navigate('/organizer/my-events');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Event Details' },
    { number: 2, title: 'Date & Location' },
    { number: 3, title: 'Tickets' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F05537] animate-spin" />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-[#1E0A3C]">Edit Event</h1>
              <p className="text-[#6F7287]">{formData.title}</p>
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
                    <span className="ml-2 text-sm font-medium hidden sm:block">{s.title}</span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${step > s.number ? 'bg-green-500' : 'bg-[#E6E5E8]'}`} />
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

                  {/* Event Image */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">
                      Event Image
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {(previewImage || formData.imageUrl) ? (
                      <div className="relative rounded-xl overflow-hidden">
                        <img
                          src={previewImage || formData.imageUrl}
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
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-sm font-medium"
                          disabled={uploading}
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#D2D2D6] rounded-xl p-8 text-center hover:border-[#F05537] transition-colors"
                      >
                        <Upload className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
                        <p className="text-[#39364F] font-medium">Click to upload event image</p>
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                      Add tags to help attendees find your event
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold text-[#1E0A3C]">Date & Location</h2>

                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#39364F] mb-2">Start Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#39364F] mb-2">End Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Venue Name *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2">Full Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={2}
                      className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none resize-none"
                    />
                  </div>

                  {/* Map Location Picker */}
                  <div>
                    <label className="block text-sm font-medium text-[#39364F] mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pin Location on Map
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
                      Adjust the pin location if needed
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold text-[#1E0A3C]">Tickets</h2>
                  <p className="text-sm text-[#6F7287]">
                    Note: Ticket types can only be edited before any tickets are sold.
                  </p>

                  {formData.ticketTypes.map((ticket, index) => (
                    <div key={index} className="border border-[#E6E5E8] rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#39364F]">Ticket Type {index + 1}</h3>
                        {formData.ticketTypes.length > 1 && (
                          <button type="button" onClick={() => removeTicketType(index)} className="text-red-500">
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

              {/* Navigation */}
              <div className="flex justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(step + 1)} className="bg-[#F05537] hover:bg-[#D94E32]">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving} className="bg-[#F05537] hover:bg-[#D94E32]">
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
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

export default EditEvent;
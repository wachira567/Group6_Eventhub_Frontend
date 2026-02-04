import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, Building2, User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../utils/constants';
import { toast } from 'sonner';
import { updateUser, logout } from '../../store/slices/authSlice';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';

const OrganizerSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    business_name: '',
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchOrganizerProfile();
  }, []);

  const fetchOrganizerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/organizer-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        dispatch(logout());
        toast.error('Session expired', {
          description: 'Please log in again.',
        });
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFormData({
          business_name: data.business_name || '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/organizer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update Redux store with new user data
      dispatch(updateUser({
        business_name: data.business_name,
        name: data.name,
        phone: data.phone,
      }));

      toast.success('Profile updated successfully!', {
        description: 'Your business name will now appear on all your events.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-[#E6E5E8]">
                <h1 className="text-2xl font-bold text-[#1E0A3C]">Organizer Settings</h1>
                <p className="text-[#6F7287] mt-1">
                  Manage your organizer profile and business information
                </p>
              </div>

              {fetching ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 text-[#F05537] animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Business Name */}
                  <div className="bg-[#F8F7FA] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#F05537]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#F05537]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1E0A3C]">Business Name</h3>
                        <p className="text-sm text-[#6F7287]">
                          This name will be displayed on all your events
                        </p>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      placeholder="e.g., Amazing Events Ltd"
                      className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                    />
                  </div>

                  {/* Personal Information */}
                  <div className="bg-[#F8F7FA] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1E0A3C]">Personal Information</h3>
                        <p className="text-sm text-[#6F7287]">
                          Your contact details
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#39364F] mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#39364F] mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-[#6F7287] mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#39364F] mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+254 7XX XXX XXX"
                            className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {formData.business_name && (
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">Preview</h3>
                      <p className="text-sm text-green-700">
                        Your events will be listed as:{' '}
                        <span className="font-semibold">{formData.business_name}</span>
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#F05537] hover:bg-[#D94E32] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSettings;
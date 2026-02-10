import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Heart, User, Settings, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { API_BASE_URL } from '../../utils/constants';
import { updateUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';

const sidebarItems = [
  { to: '/attendee', icon: User, label: 'Overview' },
  { to: '/attendee/tickets', icon: Ticket, label: 'My Tickets' },
  { to: '/attendee/saved', icon: Heart, label: 'Saved Events' },
  { to: '/attendee/settings', icon: Settings, label: 'Settings' },
];

const AttendeeSettings = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required to save changes';
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneRegex = /^[+]?[\d\s-()]{10,20}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Validate password fields if user wants to change password
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        current_password: formData.currentPassword,
      };

      // Only include new password if user wants to change it
      if (formData.newPassword) {
        payload.new_password = formData.newPassword;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update Redux store and localStorage with new user data
      dispatch(updateUser(data.user));

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveItem = () => {
    return sidebarItems.find((item) => item.to === location.pathname)?.to || '/attendee';
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              {/* User Profile Summary */}
              <div className="p-6 border-b border-[#E6E5E8]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#F05537] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">{user?.name || 'User'}</p>
                    <p className="text-sm text-[#6F7287]">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#F05537]/10 text-[#F05537] rounded text-xs capitalize">
                      {user?.role || 'Attendee'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      getActiveItem() === item.to
                        ? 'bg-[#F05537]/10 text-[#F05537]'
                        : 'text-[#6F7287] hover:bg-[#F8F7FA]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-[#E6E5E8]">
                <h1 className="text-xl font-semibold text-[#1E0A3C]">Account Settings</h1>
                <p className="text-sm text-[#6F7287] mt-1">
                  Manage your profile information and password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Information Section */}
                <div>
                  <h2 className="text-lg font-medium text-[#1E0A3C] mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#1E0A3C]">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`${
                          errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Field - Disabled */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1E0A3C]">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-[#6F7287]">
                        Email cannot be changed. Contact support for assistance.
                      </p>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#1E0A3C]">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g., +254 712 345 678"
                        className={`${
                          errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.phone ? (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      ) : (
                        <p className="text-xs text-[#6F7287]">
                          Include country code (e.g., +254 for Kenya)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E6E5E8]" />

                {/* Password Section */}
                <div>
                  <h2 className="text-lg font-medium text-[#1E0A3C] mb-4">Change Password</h2>
                  <p className="text-sm text-[#6F7287] mb-4">
                    Leave these fields empty if you don't want to change your password
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Password */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="currentPassword" className="text-[#1E0A3C]">
                        Current Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter your current password"
                          className={`pr-10 ${
                            errors.currentPassword
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287] hover:text-[#1E0A3C]"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-500">{errors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[#1E0A3C]">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password (optional)"
                          className={`pr-10 ${
                            errors.newPassword
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287] hover:text-[#1E0A3C]"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword ? (
                        <p className="text-sm text-red-500">{errors.newPassword}</p>
                      ) : (
                        <p className="text-xs text-[#6F7287]">
                          Minimum 6 characters
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[#1E0A3C]">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className={`pr-10 ${
                            errors.confirmPassword
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287] hover:text-[#1E0A3C]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-[#E6E5E8]">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#F05537] hover:bg-[#D94E32] text-white px-6"
                  >
                    {isLoading ? (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeSettings;

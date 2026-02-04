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
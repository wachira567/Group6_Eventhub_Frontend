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
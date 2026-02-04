import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Ticket, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { API_BASE_URL } from '../utils/constants';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'attendee',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('already registered')) {
          toast.error('Account exists', {
            description: data.error,
            action: {
              label: 'Log In',
              onClick: () => navigate('/login'),
            },
            duration: 8000,
          });
        } else {
          toast.error('Registration failed', {
            description: data.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      // Registration successful - show verification message
      setRegistrationSuccess(true);
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox and spam folder.',
        });
      } else {
        toast.error('Failed to resend', {
          description: data.error || 'Please try again later.',
        });
      }
    } catch (error) {
      toast.error('Network error', {
        description: 'Unable to send verification email. Please try again.',
      });
    }
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Show verification pending screen after successful registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-[#F05537] rounded-xl flex items-center justify-center">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1E0A3C]">EventHub</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E0A3C] mb-4">Verify Your Email</h2>
            <p className="text-[#6F7287] mb-6">
              We've sent a verification email to <strong>{formData.email}</strong>.
              Please check your inbox and click the verification link to complete your registration.
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
              >
                Resend Verification Email
              </Button>
              <p className="text-sm text-[#6F7287]">
                Already verified?{' '}
                <Link to="/login" className="text-[#F05537] hover:text-[#D94E32] font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-[#F05537] rounded-xl flex items-center justify-center">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1E0A3C]">EventHub</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-[#1E0A3C]">Create your account</h2>
          <p className="mt-2 text-[#6F7287]">Join thousands of event enthusiasts</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'attendee' })}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                formData.role === 'attendee'
                  ? 'border-[#F05537] bg-[#FFF5F3]'
                  : 'border-[#E6E5E8] hover:border-[#D2D2D6]'
              }`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'attendee' ? 'text-[#F05537]' : 'text-[#6F7287]'}`} />
              <p className={`font-medium ${formData.role === 'attendee' ? 'text-[#F05537]' : 'text-[#39364F]'}`}>Attendee</p>
              <p className="text-xs text-[#A9A8B3]">I want to attend events</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'organizer' })}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                formData.role === 'organizer'
                  ? 'border-[#F05537] bg-[#FFF5F3]'
                  : 'border-[#E6E5E8] hover:border-[#D2D2D6]'
              }`}
            >
              <Ticket className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'organizer' ? 'text-[#F05537]' : 'text-[#6F7287]'}`} />
              <p className={`font-medium ${formData.role === 'organizer' ? 'text-[#F05537]' : 'text-[#39364F]'}`}>Organizer</p>
              <p className="text-xs text-[#A9A8B3]">I want to host events</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
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
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9A8B3] hover:text-[#6F7287]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < strength ? strengthColors[strength - 1] : 'bg-[#E6E5E8]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strength > 0 ? 'text-[#6F7287]' : ''}`}>
                    Password strength: {strength > 0 ? strengthLabels[strength - 1] : 'Too short'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#39364F] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="w-5 h-5 text-[#F05537] focus:ring-[#F05537] rounded mt-0.5"
              />
              <span className="text-sm text-[#6F7287]">
                I agree to the{' '}
                <Link to="#" className="text-[#F05537] hover:text-[#D94E32]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-[#F05537] hover:text-[#D94E32]">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading || !agreeTerms}
              className="w-full bg-[#F05537] hover:bg-[#D94E32] text-white py-3 h-auto text-lg font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-[#6F7287]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F05537] hover:text-[#D94E32] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

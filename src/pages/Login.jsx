import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { loginSuccess, loginStart, loginFailure } from '../store/slices/authSlice';
import { API_BASE_URL } from '../utils/constants';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginStart());

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404 && data.userNotFound) {
          toast.error('Account not found', {
            description: 'No account exists with this email. Would you like to create one?',
            action: {
              label: 'Sign Up',
              onClick: () => navigate('/register'),
            },
            duration: 8000,
          });
        } else if (response.status === 403 && data.requiresVerification) {
          toast.info('Email verification required', {
            description: data.error,
            action: {
              label: 'Resend Email',
              onClick: () => handleResendVerification(data.email),
            },
            duration: 10000,
          });
        } else if (response.status === 401) {
          toast.error('Invalid password', {
            description: 'Please check your password and try again.',
          });
        } else {
          toast.error('Login failed', {
            description: data.error || 'Something went wrong. Please try again.',
          });
        }
        dispatch(loginFailure(data.error || 'Login failed'));
        return;
      }

      // Login successful
      dispatch(
        loginSuccess({
          user: data.user,
          token: data.access_token,
          refreshToken: data.refresh_token,
        })
      );

      toast.success('Welcome back!', {
        description: `Logged in as ${data.user.name}`,
      });

      // Redirect based on role
      switch (data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'organizer':
          navigate('/organizer');
          break;
        default:
          navigate('/attendee');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again later.',
      });
      dispatch(loginFailure('Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
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
          <h2 className="mt-6 text-3xl font-bold text-[#1E0A3C]">Welcome back</h2>
          <p className="mt-2 text-[#6F7287]">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full pl-10 pr-12 py-3 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9A8B3] hover:text-[#6F7287]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#F05537] focus:ring-[#F05537] rounded"
                />
                <span className="text-sm text-[#6F7287]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#F05537] hover:text-[#D94E32] font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F05537] hover:bg-[#D94E32] text-white py-3 h-auto text-lg font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-[#6F7287]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#F05537] hover:text-[#D94E32] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

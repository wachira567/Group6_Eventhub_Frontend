import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, CheckCircle, XCircle, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { loginSuccess } from '../store/slices/authSlice';
import { API_BASE_URL } from '../utils/constants';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        
        // Automatically log in the user
        dispatch(
          loginSuccess({
            user: data.user,
            token: data.access_token,
            refreshToken: data.refresh_token,
          })
        );

        toast.success('Email verified!', {
          description: `Welcome, ${data.user.name}! Your account is now active.`,
        });

        // Redirect based on role after a short delay
        setTimeout(() => {
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
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to verify email. The link may have expired.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  const handleResend = async () => {
    // Extract email from error message or redirect to login
    toast.info('Please log in to resend verification email', {
      description: 'Go to the login page and try to sign in.',
    });
    navigate('/login');
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
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E0A3C] mb-4">Verifying Your Email</h2>
              <p className="text-[#6F7287]">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E0A3C] mb-4">Email Verified!</h2>
              <p className="text-[#6F7287] mb-6">
                Your email has been successfully verified. You will be redirected to your dashboard shortly.
              </p>
              <div className="animate-pulse text-sm text-[#F05537]">
                Redirecting...
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E0A3C] mb-4">Verification Failed</h2>
              <p className="text-[#6F7287] mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
                <p className="text-sm text-[#6F7287]">
                  Need help?{' '}
                  <Link to="/" className="text-[#F05537] hover:text-[#D94E32] font-medium">
                    Contact Support
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

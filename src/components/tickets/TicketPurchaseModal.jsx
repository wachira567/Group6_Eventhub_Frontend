import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X, Minus, Plus, CreditCard, CheckCircle, AlertCircle, Loader2, Smartphone, Mail, User, Ticket, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, isValidKenyanPhone, isValidEmail } from '@/utils/helpers';
import { API_BASE_URL } from '@/utils/constants';

const TicketPurchaseModal = ({ isOpen, onClose, event }) => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  
  // State
  const [step, setStep] = useState('selection'); // 'selection', 'details', 'payment', 'processing', 'success', 'error'
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [ticketId, setTicketId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [guestToken, setGuestToken] = useState(null);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

    // Reset state when modal opens
  useEffect(() => {
    if (isOpen && event?.ticketTypes?.length > 0) {
      setSelectedTicketType(event.ticketTypes[0]);
      setQuantity(1);
      setStep('selection');
      setError(null);
      setEmailError('');
      setNameError('');
      setPhoneNumber(user?.phoneNumber || '');
      setEmail(user?.email || '');
      setGuestName(user?.name || '');
    }
  }, [isOpen, event, user]);

    // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Countdown timer for payment
  useEffect(() => {
    if (step === 'processing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

   const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxAvailable = selectedTicketType?.available || 10;
    if (newQuantity >= 1 && newQuantity <= Math.min(10, maxAvailable)) {
      setQuantity(newQuantity);
    }
  };

   const handleTicketTypeSelect = (ticketType) => {
    setSelectedTicketType(ticketType);
    // Reset quantity if it exceeds available
    if (quantity > ticketType.available) {
      setQuantity(1);
    }
  };

   const formatPhoneForDisplay = (phone) => {
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as 07XX XXX XXX
    if (cleaned.length === 10 && cleaned.startsWith('07')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

   const formatPhoneForApi = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('07')) {
      return '254' + cleaned.slice(1);
    }
    if (cleaned.startsWith('+')) {
      return cleaned.slice(1);
    }
    return cleaned;
  };

  // Step 1: Reserve ticket
  const handleReserveTicket = async () => {
    setError(null);
    
    if (!selectedTicketType) {
      setError('Please select a ticket type');
      return;
    }

        // If not authenticated, show details step first
    if (!isAuthenticated) {
      setStep('details');
      return;
    }

    // For authenticated users, proceed directly to payment step
    await proceedToReserve();
  };

   // Validate guest details and proceed
  const handleGuestDetailsSubmit = async () => {
    setError(null);
    setEmailError('');
    setNameError('');

    let hasError = false;

     // Validate email
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // Validate name
    if (!guestName || guestName.trim().length < 2) {
      setNameError('Please enter your full name');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    await proceedToReserve();
  };

   // Proceed to reserve ticket
  const proceedToReserve = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body = {
        event_id: event.id,
        ticket_type_id: selectedTicketType.id,
        quantity: quantity,
      };

      // Add guest details if not authenticated
      if (!isAuthenticated) {
        body.email = email;
        body.name = guestName;
      }
      
      const response = await fetch(`${API_BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reserve ticket');
      }

      setTicketId(data.ticket.id);
      
      // Store guest token if provided
      if (data.guest_token) {
        setGuestToken(data.guest_token);
        // Store in session storage for persistence
        sessionStorage.setItem(`guest_token_${data.ticket.id}`, data.guest_token);
      }
      
      setStep('payment');
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: Initiate MPESA STK Push
  const handleInitiatePayment = async () => {
    setError(null);

    if (!isValidKenyanPhone(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number (07XX XXX XXX or 2547XX XXX XXX)');
      return;
    }

    if (!ticketId) {
      setError('Ticket not reserved. Please try again.');
      setStep('selection');
      return;
    }

    setStep('processing');
    setCountdown(60);

    try {
      const formattedPhone = formatPhoneForApi(phoneNumber);
      
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/mpesa/stkpush`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ticket_id: ticketId,
          phone_number: formattedPhone,
          guest_token: guestToken || sessionStorage.getItem(`guest_token_${ticketId}`),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setCheckoutRequestId(data.checkout_request_id);
      
      // Start polling for payment status
      startPolling(data.checkout_request_id);
    } catch (err) {
      setStep('payment');
      setError(err.message);
    }
  };

  // Poll for payment status
  const startPolling = useCallback((checkoutId) => {
    let pollCount = 0;
    const maxPolls = 24; // 2 minutes (5 seconds * 24)
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const headers = {};
        
        // Add auth or guest token
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let url = `${API_BASE_URL}/mpesa/status/${checkoutId}`;
        
        // For guest users, use guest status endpoint
        if (!isAuthenticated && guestToken) {
          url = `${API_BASE_URL}/mpesa/guest-status/${checkoutId}?guest_token=${guestToken}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (response.ok && data.transaction) {
          const status = data.transaction.status;
          const paymentCompleted = data.payment_completed;
          
          // Check both transaction status and ticket payment status
          if (status === 'completed' || paymentCompleted === true) {
            clearInterval(pollInterval);
            setPollingInterval(null);
            setStep('success');
            
            // Auto-redirect after success
            setTimeout(() => {
              onClose();
              if (isAuthenticated) {
                navigate('/attendee/my-tickets');
              }
            }, 5000);
          } else if (status === 'failed' || status === 'cancelled') {
            clearInterval(pollInterval);
            setPollingInterval(null);
            setStep('error');
            setError(data.transaction.result_desc || 'Payment failed or was cancelled');
          }
          // If status is still 'pending' or 'processing', continue polling
        }
        
        // If transaction not found yet, continue polling (might still be processing)
        if (response.status === 404 && pollCount < maxPolls) {
          console.log('Transaction not found yet, continuing to poll...');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      
      // Stop polling after max attempts
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setPollingInterval(null);
        setStep('payment');
        setError('Payment confirmation timed out. If you completed the payment, please check your tickets or email. Otherwise, please try again.');
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(pollInterval);

    // Safety timeout - stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPollingInterval((current) => {
        if (current === pollInterval) {
          return null;
        }
        return current;
      });
    }, 125000);
  }, [token, guestToken, isAuthenticated, navigate, onClose]);





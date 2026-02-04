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

  const handleClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    onClose();
  };

  // Handle ticket download for guests
  const handleDownloadTicket = async () => {
    try {
      const storedToken = guestToken || sessionStorage.getItem(`guest_token_${ticketId}`);
      let url = `${API_BASE_URL}/tickets/download/${ticketId}`;
      
      // Add guest token or email as query parameter
      const params = new URLSearchParams();
      if (storedToken) {
        params.append('guest_token', storedToken);
      } else if (email) {
        params.append('email', email);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download ticket');
      }
      
      // Create a blob from the PDF response
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `EventHub_Ticket_${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download ticket: ' + err.message);
    }
  };

  const totalPrice = (selectedTicketType?.price || 0) * quantity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#1E0A3C]">
              {step === 'selection' && 'Select Tickets'}
              {step === 'details' && 'Your Details'}
              {step === 'payment' && 'Payment Details'}
              {step === 'processing' && 'Processing Payment'}
              {step === 'success' && 'Payment Successful!'}
              {step === 'error' && 'Payment Failed'}
            </h2>
            <p className="text-sm text-[#6F7287] mt-1">{event?.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={step === 'processing'}
          >
            <X className="w-5 h-5 text-[#6F7287]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Ticket Selection */}
          {step === 'selection' && (
            <div className="space-y-6">
              {/* Guest Checkout Notice */}
              {!isAuthenticated && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Guest Checkout:</strong> You're purchasing as a guest. 
                    No account required! Your ticket will be emailed to you.
                  </p>
                </div>
              )}

              {/* Ticket Types */}
              <div className="space-y-3">
                <Label className="text-[#1E0A3C] font-semibold">Select Ticket Type</Label>
                {event?.ticketTypes?.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketTypeSelect(ticket)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTicketType?.id === ticket.id
                        ? 'border-[#F05537] bg-[#FFF5F3]'
                        : 'border-gray-200 hover:border-[#F05537]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1E0A3C]">{ticket.name}</p>
                        <p className="text-sm text-[#6F7287]">
                          {ticket.available} tickets available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#F05537] text-lg">
                          {formatCurrency(ticket.price)}
                        </p>
                        {selectedTicketType?.id === ticket.id && (
                          <CheckCircle className="w-5 h-5 text-[#F05537] ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label className="text-[#1E0A3C] font-semibold">Quantity</Label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#F05537] transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center text-2xl font-bold text-[#1E0A3C]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(10, selectedTicketType?.available || 10)}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#F05537] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F7287]">
                    {selectedTicketType?.name} x {quantity}
                  </span>
                  <span className="font-medium text-[#1E0A3C]">
                    {formatCurrency(selectedTicketType?.price * quantity || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-[#1E0A3C]">Total</span>
                  <span className="font-bold text-[#F05537] text-xl">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleReserveTicket}
                className="w-full bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto text-lg font-semibold"
              >
                {isAuthenticated ? 'Continue to Payment' : 'Continue as Guest'}
              </Button>
            </div>
          )}

          {/* Step 2: Guest Details (for non-authenticated users) */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Please enter your details. Your ticket will be sent to your email address.
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">{selectedTicketType?.name}</p>
                    <p className="text-sm text-[#6F7287]">Quantity: {quantity}</p>
                  </div>
                  <p className="font-bold text-[#F05537] text-xl">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              {/* Guest Details Form */}
              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="text-[#1E0A3C] font-semibold">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="guest-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-12 py-6"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7287]">
                      <User className="w-5 h-5" />
                    </span>
                  </div>
                  {nameError && (
                    <p className="text-sm text-red-500">{nameError}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="guest-email" className="text-[#1E0A3C] font-semibold">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="guest-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 py-6"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7287]">
                      <Mail className="w-5 h-5" />
                    </span>
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                  <p className="text-xs text-[#6F7287]">
                    Your ticket PDF will be sent to this email address
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('selection')}
                  className="flex-1 py-6 h-auto"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGuestDetailsSubmit}
                  className="flex-1 bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto text-lg font-semibold"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {step === 'payment' && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#1E0A3C]">{selectedTicketType?.name}</p>
                    <p className="text-sm text-[#6F7287]">Quantity: {quantity}</p>
                  </div>
                  <p className="font-bold text-[#F05537] text-xl">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              {/* Email Confirmation for Guests */}
              {!isAuthenticated && email && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Ticket will be sent to:</p>
                    <p className="text-sm text-green-700">{email}</p>
                  </div>
                </div>
              )}

              {/* MPESA Payment Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">MPESA STK Push</p>
                    <p className="text-sm text-green-600">
                      Enter your MPESA number to receive a payment prompt
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#1E0A3C] font-semibold">
                    MPESA Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 py-6 text-lg"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7287] font-medium">
                      🇰🇪
                    </span>
                  </div>
                  <p className="text-xs text-[#6F7287]">
                    Enter number in format: 07XX XXX XXX or 254XXX XXX XXX
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-amber-800 text-sm">What happens next?</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">1.</span>
                      You'll receive an STK Push notification on your phone
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">2.</span>
                      Enter your MPESA PIN to confirm payment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">3.</span>
                      Your ticket will be confirmed and emailed to you automatically
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(isAuthenticated ? 'selection' : 'details')}
                  className="flex-1 py-6 h-auto"
                >
                  Back
                </Button>
                <Button
                  onClick={handleInitiatePayment}
                  disabled={!phoneNumber}
                  className="flex-1 bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto text-lg font-semibold"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay with MPESA
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8 space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#F05537] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#F05537] animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1E0A3C]">Processing Payment...</h3>
                <p className="text-[#6F7287]">
                  Please check your phone and enter your MPESA PIN
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#6F7287]">Phone:</span>
                  <span className="font-medium text-[#1E0A3C]">
                    {formatPhoneForDisplay(phoneNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6F7287]">Amount:</span>
                  <span className="font-bold text-[#F05537]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="text-sm text-[#6F7287]">
                Waiting for confirmation...
                <span className="block mt-1 font-mono">{countdown}s</span>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <p className="text-sm text-blue-700">
                  <strong>Did you complete the payment?</strong><br/>
                  If you entered your MPESA PIN and received a confirmation SMS, 
                  click "Check Status" below.
                </p>
              </div>
              
              {/* Development-only: Simulate Payment button */}
              {import.meta.env.DEV && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
                  <p className="text-xs text-purple-600 font-medium mb-2">🛠️ DEVELOPMENT MODE</p>
                  <p className="text-sm text-purple-700 mb-3">
                    Since M-Pesa callbacks can't reach localhost, use this button to simulate a successful payment.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const headers = {'Content-Type': 'application/json'};
                        if (token) headers['Authorization'] = `Bearer ${token}`;
                        
                        const response = await fetch(`${API_BASE_URL}/mpesa/simulate-complete/${checkoutRequestId}`, {
                          method: 'POST',
                          headers
                        });
                        
                        if (response.ok) {
                          clearInterval(pollingInterval);
                          setPollingInterval(null);
                          setStep('success');
                        } else {
                          const data = await response.json();
                          setError(data.error || 'Simulation failed');
                        }
                      } catch (err) {
                        setError('Simulation error: ' + err.message);
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Simulate Successful Payment
                  </Button>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (pollingInterval) {
                      clearInterval(pollingInterval);
                      setPollingInterval(null);
                    }
                    setStep('payment');
                    setError('Payment was cancelled. You can try again.');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    // Manual status check
                    try {
                      const headers = {};
                      if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                      }
                      
                      let url = `${API_BASE_URL}/mpesa/status/${checkoutRequestId}`;
                      if (!isAuthenticated && guestToken) {
                        url = `${API_BASE_URL}/mpesa/guest-status/${checkoutRequestId}?guest_token=${guestToken}`;
                      }
                      
                      const response = await fetch(url, { headers });
                      const data = await response.json();
                      
                      if (response.ok && (data.transaction?.status === 'completed' || data.payment_completed)) {
                        clearInterval(pollingInterval);
                        setPollingInterval(null);
                        setStep('success');
                        setTimeout(() => {
                          onClose();
                          if (isAuthenticated) navigate('/attendee/my-tickets');
                        }, 3000);
                      } else if (data.transaction?.status === 'failed') {
                        clearInterval(pollingInterval);
                        setPollingInterval(null);
                        setStep('error');
                        setError(data.transaction.result_desc || 'Payment failed');
                      } else {
                        setError('Payment still processing. Please wait a moment and try again.');
                        setTimeout(() => setError(null), 3000);
                      }
                    } catch (err) {
                      setError('Unable to check status. Please try again.');
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Check Status
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1E0A3C]">Payment Successful!</h3>
                <p className="text-[#6F7287]">
                  Your tickets have been confirmed and sent to your email
                </p>
                {!isAuthenticated && email && (
                  <p className="text-sm font-medium text-green-600">
                    📧 Check your inbox: {email}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-w-xs mx-auto text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F7287]">Event:</span>
                  <span className="font-medium text-[#1E0A3C] truncate max-w-[150px]">
                    {event?.title}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F7287]">Ticket:</span>
                  <span className="font-medium text-[#1E0A3C]">{selectedTicketType?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F7287]">Quantity:</span>
                  <span className="font-medium text-[#1E0A3C]">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-[#6F7287]">Total Paid:</span>
                  <span className="font-bold text-[#F05537]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-left">
                <p className="text-sm font-medium text-amber-800 mb-2">📱 Your Ticket</p>
                <p className="text-sm text-amber-700">
                  A PDF ticket with a QR code has been sent to your email. 
                  Please present it at the event entrance for scanning.
                </p>
              </div>

              {isAuthenticated ? (
                <>
                  <p className="text-sm text-[#6F7287]">
                    Redirecting to your tickets...
                  </p>
                  <Button
                    onClick={() => {
                      onClose();
                      navigate('/attendee/my-tickets');
                    }}
                    className="w-full bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto text-lg font-semibold"
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    View My Tickets
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  {/* Download Ticket Button for Guests */}
                  <Button
                    onClick={handleDownloadTicket}
                    variant="outline"
                    className="w-full py-6 h-auto border-[#F05537] text-[#F05537] hover:bg-[#FFF5F3]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Ticket PDF
                  </Button>
                  
                  <p className="text-sm text-[#6F7287]">
                    Want to keep track of your tickets? Create an account!
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 py-6 h-auto"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        onClose();
                        navigate('/register');
                      }}
                      className="flex-1 bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Error */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1E0A3C]">Payment Failed</h3>
                <p className="text-[#6F7287]">{error || 'Something went wrong with your payment'}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 py-6 h-auto"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setStep('payment')}
                  className="flex-1 bg-[#F05537] hover:bg-[#D94E32] text-white py-6 h-auto text-lg font-semibold"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPurchaseModal;

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



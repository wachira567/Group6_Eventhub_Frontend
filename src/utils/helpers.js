// Date formatting
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString) => {
  return `${formatDate(dateString)}, ${formatTime(dateString)}`;
};

// Currency formatting (Kenyan Shilling)
export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Price formatting for display
export const formatPrice = (price) => {
  if (price === 0 || price === null || price === undefined) {
    return 'Free';
  }
  return formatCurrency(price);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Slug generation
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateString);
};

// Check if event is upcoming
export const isUpcoming = (eventDate) => {
  return new Date(eventDate) > new Date();
};

// Check if event is sold out
export const isSoldOut = (ticketsSold, totalTickets) => {
  return ticketsSold >= totalTickets;
};

// Get ticket availability status
export const getAvailabilityStatus = (ticketsSold, totalTickets) => {
  const percentage = (ticketsSold / totalTickets) * 100;
  if (percentage >= 100) return { label: 'Sold Out', variant: 'destructive' };
  if (percentage >= 90) return { label: 'Almost Full', variant: 'warning' };
  if (percentage >= 75) return { label: 'Going Fast', variant: 'warning' };
  return { label: 'Available', variant: 'success' };
};

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Capitalize first letter
export const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Format phone number (Kenyan format)
export const formatPhoneNumber = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as +254 XXX XXX XXX
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
};

// Validate Kenyan phone number
export const isValidKenyanPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Accepts 2547XXXXXXXX or 07XXXXXXXX or +2547XXXXXXXX
  return /^(2547\d{8}|07\d{8}|\+2547\d{8})$/.test(cleaned);
};

// Validate email address
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get category color
export const getCategoryColor = (categoryId) => {
  const colors = {
    music: '#F05537',
    nightlife: '#8B5CF6',
    arts: '#EC4899',
    holidays: '#10B981',
    dating: '#EF4444',
    hobbies: '#F59E0B',
    business: '#3B82F6',
    food: '#84CC16',
  };
  return colors[categoryId] || '#6B7280';
};
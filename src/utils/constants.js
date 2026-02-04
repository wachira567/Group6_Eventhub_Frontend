// App Config
export const APP_NAME = import.meta.env.VITE_APP_NAME || "EventHub";
export const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE || "Discover events that match your passion";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// User Roles
export const ROLES = {
  ADMIN: "admin",
  ORGANIZER: "organizer",
  ATTENDEE: "attendee",
};

// Event Categories
export const CATEGORIES = [
  { id: "music", name: "Music", icon: "Headphones", color: "#F05537" },
  { id: "nightlife", name: "Nightlife", icon: "Sparkles", color: "#8B5CF6" },
  {
    id: "arts",
    name: "Performing & Visual Arts",
    icon: "Palette",
    color: "#EC4899",
  },
  { id: "holidays", name: "Holidays", icon: "Calendar", color: "#10B981" },
  { id: "dating", name: "Dating", icon: "Heart", color: "#EF4444" },
  { id: "hobbies", name: "Hobbies", icon: "Gamepad2", color: "#F59E0B" },
  { id: "business", name: "Business", icon: "Briefcase", color: "#3B82F6" },
  {
    id: "food",
    name: "Food & Drink",
    icon: "UtensilsCrossed",
    color: "#84CC16",
  },
];

// Ticket Types
export const TICKET_TYPES = {
  EARLY_BIRD: "early_bird",
  VIP: "vip",
  REGULAR: "regular",
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Date Filters
export const DATE_FILTERS = {
  ALL: "all",
  TODAY: "today",
  TOMORROW: "tomorrow",
  THIS_WEEK: "this_week",
  THIS_WEEKEND: "this_weekend",
  NEXT_WEEK: "next_week",
  THIS_MONTH: "this_month",
};

// Popular Cities (Kenya focus for MPESA)
export const POPULAR_CITIES = [
  {
    id: "nairobi",
    name: "Nairobi",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062307/city-1_kkzmrc.jpg",
  },
  {
    id: "mombasa",
    name: "Mombasa",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062290/city-2_vibjiz.jpg",
  },
  {
    id: "kisumu",
    name: "Kisumu",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062291/city-3_gaaeez.jpg",
  },
  {
    id: "nakuru",
    name: "Nakuru",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062290/city-4_lmbiz1.jpg",
  },
  {
    id: "eldoret",
    name: "Eldoret",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062289/city-5_tsuq9f.jpg",
  },
  {
    id: "thika",
    name: "Thika",
    image:
      "https://res.cloudinary.com/dtbe44muv/image/upload/v1770062288/city-6_jqior4.jpg",
  },
];

// How It Works Steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Discover Events",
    description:
      "Browse through thousands of events in your area. Filter by category, date, or location to find exactly what you're looking for.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Book with MPESA",
    description:
      "Secure your tickets in seconds with our seamless MPESA integration. Fast, secure, and convenient payment processing.",
    icon: "CreditCard",
  },
  {
    step: 3,
    title: "Attend & Enjoy",
    description:
      "Receive your digital tickets instantly. Show up at the event and create unforgettable memories.",
    icon: "Ticket",
  },
];

// Navigation Links
export const NAV_LINKS = {
  public: [
    { name: "Find Events", href: "/events" },
    { name: "Create Events", href: "/create-event" },
  ],
  authenticated: [
    { name: "My Tickets", href: "/dashboard/tickets" },
    { name: "Saved Events", href: "/dashboard/saved" },
  ],
  organizer: [
    { name: "My Events", href: "/dashboard/events" },
    { name: "Analytics", href: "/dashboard/analytics" },
  ],
  admin: [
    { name: "Users", href: "/admin/users" },
    { name: "Events", href: "/admin/events" },
    { name: "Reports", href: "/admin/reports" },
  ],
};

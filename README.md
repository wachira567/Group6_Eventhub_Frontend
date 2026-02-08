# EventHub Frontend

A React-based frontend for the EventHub event ticketing and management platform, built with Vite.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Running Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🛠 Technologies Used

### Core Framework

- **React 19.2.0** - UI library for building user interfaces
- **Vite 7.2.4** - Fast build tool and development server
- **React Router DOM 7.13.0** - Client-side routing

### State Management

- **Redux Toolkit 2.11.2** - State management with slices for auth, events, tickets, and UI

### UI Components & Styling

- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, reusable components built with Radix UI:
  - Button, Card, Dialog, Sheet, Tabs
  - Select, Table, Form, Input
  - Avatar, Badge, Progress, Tooltip
  - And more...
- **Lucide React 0.562.0** - Beautiful icon set
- **clsx 2.1.1** - Utility for constructing className strings
- **tailwind-merge 3.4.0** - Merge Tailwind CSS classes

### Forms & Validation

- **React Hook Form 7.70.0** - Performant form management
- **Zod 4.3.5** - Schema validation
- **@hookform/resolvers 5.2.2** - Zod resolver for React Hook Form

### Data Visualization

- **Recharts 2.15.4** - Composable charting library for React

### Maps & Location

- **Mapbox GL 3.18.1** - Interactive maps and location picker

### QR Code & Scanning

- **qrcode 7.4.2** - QR code generation
- **html5-qrcode 2.3.8** - QR code scanning in browser

### Date & Time

- **date-fns 4.1.0** - Modern JavaScript date utility library
- **React Day Picker 9.13.0** - Accessible date picker

### Animation

- **Framer Motion** - Animation library (via tw-animate-css)
- **embla-carousel-react 8.6.0** - Carousel/slider component
- **sonner 2.0.7** - Toast notifications

### Development Tools

- **ESLint 9.39.1** - Code linting
- **PostCSS 8.5.6** - CSS transformation
- **Autoprefixer 10.4.23** - PostCSS plugin for vendor prefixes

---

## 📁 Project Structure

```
group_frontend/
├── index.html              # Entry HTML file
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── .env                    # Environment variables
│
├── public/                 # Static assets
│   └── images/             # Static images
│
└── src/
    ├── main.jsx           # Application entry point
    ├── App.jsx           # Root component with routing
    ├── index.css          # Global styles
    │
    ├── components/        # Reusable components
    │   ├── ui/           # Base UI components (shadcn/ui)
    │   │   ├── button.jsx
    │   │   ├── card.jsx
    │   │   ├── dialog.jsx
    │   │   ├── input.jsx
    │   │   ├── label.jsx
    │   │   ├── select.jsx
    │   │   ├── table.jsx
    │   │   ├── tabs.jsx
    │   │   └── ... (30+ more components)
    │   │
    │   ├── layout/       # Layout components
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── Sidebar.jsx
    │   │
    │   ├── events/       # Event-related components
    │   │   ├── EventCard.jsx
    │   │   ├── EventMap.jsx
    │   │   └── MapLocationPicker.jsx
    │   │
    │   ├── tickets/      # Ticket-related components
    │   │   ├── TicketPurchaseModal.jsx
    │   │   └── TicketScanner.jsx
    │   │
    │   └── organizer/    # Organizer components
    │       └── OrganizerSidebar.jsx
    │
    ├── pages/            # Route pages
    │   ├── Home.jsx              # Landing page
    │   ├── Events.jsx            # Browse events
    │   ├── EventDetail.jsx       # Event details
    │   ├── Login.jsx             # Login page
    │   ├── Register.jsx          # Registration page
    │   ├── VerifyEmail.jsx       # Email verification
    │   │
    │   ├── attendee/       # Attendee dashboard pages
    │   │   ├── Dashboard.jsx     # Overview & stats
    │   │   ├── MyTickets.jsx     # View tickets
    │   │   ├── SavedEvents.jsx   # Saved events
    │   │   └── Settings.jsx      # Account settings
    │   │
    │   ├── organizer/     # Organizer pages
    │   │   ├── Dashboard.jsx     # Overview
    │   │   ├── MyEvents.jsx      # Manage events
    │   │   ├── CreateEvent.jsx   # Create new event
    │   │   ├── EditEvent.jsx     # Edit event
    │   │   ├── Analytics.jsx     # Event analytics
    │   │   ├── AttendeeList.jsx  # Attendee management
    │   │   ├── TicketScanner.jsx # QR scanner
    │   │   └── Settings.jsx      # Organizer settings
    │   │
    │   └── admin/         # Admin pages
    │       ├── Dashboard.jsx      # Platform overview
    │       ├── UserManagement.jsx # User management
    │       ├── EventModeration.jsx # Event approval
    │       ├── PlatformAnalytics.jsx # Analytics
    │       └── Reports.jsx        # Reports
    │
    ├── store/            # Redux state management
    │   ├── store.js     # Store configuration
    │   └── slices/
    │       ├── authSlice.js     # Authentication state
    │       ├── eventsSlice.js   # Events state
    │       ├── ticketsSlice.js  # Tickets state
    │       └── uiSlice.js       # UI state
    │
    ├── hooks/           # Custom React hooks
    │   └── use-mobile.js
    │
    ├── lib/             # Utility libraries
    │   └── utils.js
    │
    └── utils/           # Helper functions
        ├── api.js           # Axios API configuration
        ├── constants.js     # App constants
        ├── helpers.js       # Helper functions
        └── cloudinary.js    # Cloudinary upload utility
```

---

## 📱 Available Pages

### Public Pages

| Route           | Description                                              |
| --------------- | -------------------------------------------------------- |
| `/`             | Home page with hero section, featured events, categories |
| `/events`       | Browse and search all events with filters                |
| `/events/:id`   | Event details with ticket purchase modal                 |
| `/login`        | User login page                                          |
| `/register`     | User registration with role selection                    |
| `/verify-email` | Email verification page                                  |

### Attendee Pages (Authenticated)

| Route                    | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `/attendee`              | Personal dashboard with upcoming tickets, stats |
| `/attendee/tickets`      | View and manage purchased tickets               |
| `/attendee/saved-events` | Saved/favorite events                           |
| `/attendee/settings`     | Account settings and profile                    |

### Organizer Pages (Authenticated - Organizer role)

| Route                        | Description                             |
| ---------------------------- | --------------------------------------- |
| `/organizer`                 | Organizer overview dashboard            |
| `/organizer/events`          | List of created events                  |
| `/organizer/events/create`   | Create new event with ticket types      |
| `/organizer/events/:id/edit` | Edit event details                      |
| `/organizer/analytics`       | Event performance charts and stats      |
| `/organizer/attendees`       | View and export attendee lists          |
| `/organizer/ticket-scanner`  | QR code scanner for ticket verification |
| `/organizer/settings`        | Organizer profile settings              |

### Admin Pages (Authenticated - Admin role)

| Route              | Description                    |
| ------------------ | ------------------------------ |
| `/admin`           | Platform-wide overview         |
| `/admin/users`     | User management and moderation |
| `/admin/events`    | Event moderation queue         |
| `/admin/analytics` | Platform analytics             |
| `/admin/reports`   | Generate and export reports    |

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `group_frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Integration

API calls are managed through `src/utils/api.js` using Axios:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required for CORS with authentication
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## 🎨 Styling & Theming

### Tailwind CSS

The project uses Tailwind CSS with custom color scheme:

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E0A3C", // Deep purple
        accent: "#F05537", // Coral/orange
        background: "#F8F7FA", // Light gray background
        muted: "#6F7287", // Muted text
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Component Library

Built on **shadcn/ui** principles with custom components in `src/components/ui/`. All components are:

- Accessible (WCAG compliant)
- Themeable via Tailwind
- Built on Radix UI primitives

Example usage:

```jsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Button variant="outline">Click me</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 🔐 Authentication Flow

### Redux Auth Slice

Authentication state is managed via Redux:

```javascript
// Login
dispatch(login({ email, password }));

// Logout
dispatch(logout());

// Check auth state
const { isAuthenticated, user, token, role } = useSelector(
  (state) => state.auth,
);
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```jsx
<Route
  path="/attendee"
  element={
    <ProtectedRoute roles={["attendee", "organizer", "admin"]}>
      <AttendeeDashboard />
    </ProtectedRoute>
  }
/>
```

### JWT Token Storage

Tokens are stored in localStorage and included in API requests via the Authorization header.

---

## 💳 Payment Integration (M-Pesa)

### Payment Flow

1. User selects ticket type and quantity
2. Enters phone number for M-Pesa payment
3. Backend initiates STK Push to user's phone
4. User enters PIN on their phone
5. M-Pesa processes and sends callback to backend
6. Backend confirms payment and generates ticket
7. Email sent with ticket details

### Development Mode

For testing without real M-Pesa:

- Use the "Simulate Payment" button in the purchase modal
- Backend provides simulation endpoint

---

## 📊 Features Implemented

### For Attendees

- [x] Browse events by category, city, date
- [x] Search events by name, location
- [x] View event details with location map
- [x] Purchase tickets with M-Pesa
- [x] Guest checkout (without registration)
- [x] View purchased tickets
- [x] Save/favorite events
- [x] Email verification
- [x] Password reset

### For Organizers

- [x] Create events with multiple ticket types
- [x] Upload event images
- [x] Set early bird pricing
- [x] Manage ticket inventory
- [x] View event analytics (sales, revenue)
- [x] Export attendee lists
- [x] QR code scanner for ticket verification
- [x] Event moderation status

### For Admins

- [x] Platform analytics dashboard
- [x] User management
- [x] Event moderation queue
- [x] Platform-wide reports

---

## 📦 Building for Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder, ready for deployment.

---

## 🧪 Development Guidelines

### Code Style

- ESLint configured for code quality
- Follow React best practices and hooks rules
- Use functional components with hooks

### Adding New Components

1. Create component in appropriate folder:
   - `src/components/ui/` for base components
   - `src/components/events/` for event-related
   - `src/components/tickets/` for ticket-related

2. Export from parent index if shared

3. Use in pages as needed

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add protected route wrapper if authenticated:
   ```jsx
   <Route
     path="/protected-page"
     element={
       <ProtectedRoute>
         <ProtectedPage />
       </ProtectedRoute>
     }
   />
   ```

### Redux Pattern

Use slices for state management:

```javascript
// Create slice
const someSlice = createSlice({
  name: "some",
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = someSlice.actions;
export default someSlice.reducer;
```

---

## 🐛 Debugging Tips

### React Dev Tools

Install React Developer Tools browser extension for debugging:

- View component hierarchy
- Inspect Redux state
- Debug hooks

### Network Debugging

- Check API responses in browser DevTools Network tab
- Verify CORS headers
- Check token validity

### Backend Logs

Run backend with debug mode to see detailed logs:

```bash
PIPENV_IGNORE_VIRTUALENVS=1 pipenv run flask run --debug
```

---

## 📄 License

MIT License

# EventHub Frontend - React Application

React frontend for the EventHub event management platform, built with Vite.

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

## 📁 Project Structure

```
Frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
│
├── public/
│   └── images/          # Static images
│
└── src/
    ├── main.jsx         # App entry point
    ├── App.jsx          # Root component
    ├── index.css        # Global styles
    │
    ├── components/      # Reusable components
    │   ├── ui/          # Base UI components
    │   ├── layout/      # Layout components
    │   ├── events/      # Event-related
    │   ├── tickets/     # Ticket-related
    │   └── organizer/   # Organizer components
    │
    ├── pages/           # Route pages
    │   ├── Home.jsx
    │   ├── Events.jsx
    │   ├── EventDetail.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── VerifyEmail.jsx
    │   ├── attendee/    # Attendee pages
    │   ├── organizer/   # Organizer pages
    │   └── admin/       # Admin pages
    │
    ├── store/           # Redux state
    │   ├── store.js
    │   └── slices/
    │       ├── authSlice.js
    │       ├── eventsSlice.js
    │       ├── ticketsSlice.js
    │       └── uiSlice.js
    │
    ├── hooks/           # Custom React hooks
    ├── lib/             # Utility libraries
    └── utils/           # Helper functions
        ├── api.js       # API calls
        ├── constants.js # Constants
        ├── helpers.js   # Helper functions
        └── cloudinary.js
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **shadcn/ui** - UI component library
- **Axios** - HTTP client

## 📱 Available Pages

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Home page with hero section and featured events |
| `/events` | Browse and search all events |
| `/events/:id` | Event details with ticket purchase |
| `/login` | User login page |
| `/register` | User registration |
| `/verify-email` | Email verification |

### Attendee Pages (Authenticated)
| Route | Description |
|-------|-------------|
| `/attendee/dashboard` | Personal dashboard |
| `/attendee/my-tickets` | View purchased tickets |
| `/attendee/saved-events` | Saved/favorite events |
| `/attendee/settings` | Account settings |

### Organizer Pages (Authenticated)
| Route | Description |
|-------|-------------|
| `/organizer/dashboard` | Organizer overview |
| `/organizer/events` | Manage created events |
| `/organizer/events/create` | Create new event |
| `/organizer/events/:id/edit` | Edit event |
| `/organizer/analytics` | Event performance |
| `/organizer/attendees` | Event attendees list |
| `/organizer/ticket-scanner` | QR code scanner |
| `/organizer/settings` | Organizer settings |

### Admin Pages (Authenticated - Admin role only)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Platform overview |
| `/admin/users` | User management |
| `/admin/events` | Event moderation |
| `/admin/analytics` | Platform analytics |
| `/admin/reports` | Reports & exports |

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Integration

API calls are made through `src/utils/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration in `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E0A3C',
        accent: '#F05537',
      },
    },
  },
  plugins: [],
}
```

### Component Library

Uses shadcn/ui components located in `src/components/ui/`:

- Button, Input, Label
- Card, Dialog, Sheet
- Table, Tabs, Select
- And more...

## 📦 Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` folder.

## 🧪 Development

### Code Style

- ESLint configured for code quality
- Prettier for code formatting
- Follow React best practices

### Adding New Components

1. Create component in `src/components/`
2. Export from `src/components/index.js` (if shared)
3. Use in pages as needed

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```

## 🔐 Authentication

Authentication is handled through Redux auth slice:

```javascript
// Login
dispatch(login({ email, password }));

// Logout
dispatch(logout());

// Check auth state
const { isAuthenticated, user } = useSelector((state) => state.auth);
```

Protected routes are wrapped with `ProtectedRoute` component.

## 💳 Payment Integration

MPESA STK Push integration for payments:

1. User selects ticket and enters phone number
2. Backend initiates STK Push
3. User receives prompt on phone
4. Payment confirmation via callback
5. Ticket generated and emailed

For development, use the "Simulate Payment" button.

## 📄 License

MIT License

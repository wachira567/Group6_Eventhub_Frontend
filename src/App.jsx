import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Toaster } from 'sonner'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import CreateEvent from './pages/CreateEvent'

// Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute'

// Role-based pages
import AttendeeDashboard from './pages/attendee/Dashboard'
import MyTickets from './pages/attendee/MyTickets'
import SavedEvents from './pages/attendee/SavedEvents'
import AttendeeSettings from './pages/attendee/Settings'

import OrganizerDashboard from './pages/organizer/Dashboard'
import OrganizerMyEvents from './pages/organizer/MyEvents'
import OrganizerCreateEvent from './pages/organizer/CreateEvent'
import OrganizerEditEvent from './pages/organizer/EditEvent'
import OrganizerEventAnalytics from './pages/organizer/EventAnalytics'
import AttendeeList from './pages/organizer/AttendeeList'
import OrganizerTicketScanner from './pages/organizer/TicketScanner'
import OrganizerSettings from './pages/organizer/Settings'

import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import EventModeration from './pages/admin/EventModeration'
import PlatformAnalytics from './pages/admin/PlatformAnalytics'
import Reports from './pages/admin/Reports'

import './App.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#F8F7FA]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Protected Routes - Any authenticated user */}
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />

              {/* Attendee Routes */}
              <Route
                path="/attendee"
                element={
                  <ProtectedRoute allowedRoles={['attendee']}>
                    <AttendeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendee/tickets"
                element={
                  <ProtectedRoute allowedRoles={['attendee']}>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendee/saved"
                element={
                  <ProtectedRoute allowedRoles={['attendee']}>
                    <SavedEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendee/settings"
                element={
                  <ProtectedRoute allowedRoles={['attendee']}>
                    <AttendeeSettings />
                  </ProtectedRoute>
                }
              />

              {/* Organizer Routes */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/my-events"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerMyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/create-event"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerCreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/edit-event/:id"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerEditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/analytics/:id"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerEventAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/attendees/:id"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <AttendeeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/scan-tickets/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerTicketScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/settings"
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerSettings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EventModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PlatformAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </Provider>
  )
}

export default App
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, QrCode, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TicketScanner from '@/components/tickets/TicketScanner';
import { API_BASE_URL } from '@/utils/constants';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';

const OrganizerTicketScanner = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      const data = await response.json();
      
      // Check if user is the organizer
      if (data.event.organizer_id !== user?.id && user?.role !== 'admin') {
        setError('You are not authorized to scan tickets for this event');
        setLoading(false);
        return;
      }
      
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F05537] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/organizer/my-events')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/organizer/my-events')}
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Events
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <OrganizerSidebar />

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F05537] rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1E0A3C]">
                    Ticket Scanner
                  </h1>
                  <p className="text-[#6F7287]">{event?.title}</p>
                </div>
              </div>
            </div>

            {/* Scanner Component */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <TicketScanner 
                eventId={parseInt(eventId)} 
                eventTitle={event?.title} 
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-800 mb-2">How to Verify Tickets</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span><strong>Manual Entry:</strong> Type the ticket number (e.g., TKT-A1B2C3D4) and click Verify</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span><strong>QR Code:</strong> Use any QR scanner app on your phone to scan the ticket's QR code, then paste the scanned data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Green checkmark = Valid ticket, Red X = Invalid or already used ticket</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Valid tickets are automatically marked as "used" after verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerTicketScanner;
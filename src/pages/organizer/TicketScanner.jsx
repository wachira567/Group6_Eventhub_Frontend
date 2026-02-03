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
        <button
          onClick={() => navigate('/organizer/my-events')}
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Events
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <OrganizerSidebar />
          <div className="flex-1 max-w-3xl">
             {/* Main content will go here in Part 3 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerTicketScanner;
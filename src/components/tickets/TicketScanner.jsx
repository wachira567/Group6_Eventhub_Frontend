import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  QrCode, CheckCircle, XCircle, AlertCircle, Search,
  Users, Ticket, ScanLine, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/utils/constants';

const TicketScanner = ({ eventId, eventTitle }) => {
  const { token } = useSelector((state) => state.auth);
  const [scanMode, setScanMode] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [ticketNumber, setTicketNumber] = useState('');
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/verification-stats/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">Scanner for: {eventTitle}</div>
    </div>
  );
};

export default TicketScanner;

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

  useEffect(() => { if (eventId) fetchStats(); }, [eventId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/verification-stats/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) { console.error('Error fetching stats:', err); }
  };

  const verifyTicket = async (ticketIdentifier, isQrData = false) => {
    setLoading(true); setError(null); setVerificationResult(null);
    try {
      let response;
      if (isQrData) {
        response = await fetch(`${API_BASE_URL}/tickets/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ qr_data: ticketIdentifier, mark_as_used: true }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/tickets/verify/${ticketIdentifier}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Verification failed');
      setVerificationResult({ success: data.valid, ...data });
      if (data.valid) setRecentVerifications(prev => [data.ticket, ...prev].slice(0, 10));
      fetchStats();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!ticketNumber.trim()) { setError('Please enter a ticket number'); return; }
    await verifyTicket(ticketNumber.trim());
  };

  const handleQrVerify = async (e) => {
    e.preventDefault();
    if (!qrData.trim()) { setError('Please enter QR code data'); return; }
    await verifyTicket(qrData.trim(), true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setError('File upload scanning requires a QR code decoding library.');
  };

  const resetVerification = () => {
    setVerificationResult(null); setError(null); setTicketNumber(''); setQrData('');
  };

  return (
    <div className="space-y-6">
      {stats && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowStats(!showStats)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-[#F05537]" />
                Check-in Statistics
              </CardTitle>
              {showStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showStats && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.total_attendees}</p>
                  <p className="text-sm text-blue-700">Total Attendees</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.checked_in}</p>
                  <p className="text-sm text-green-700">Checked In</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.pending_check_in}</p>
                  <p className="text-sm text-amber-700">Pending</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-600">{stats.pending_payment}</p>
                  <p className="text-sm text-gray-700">Unpaid</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Check-in Progress</span>
                  <span className="font-medium">
                    {stats.total_attendees > 0 ? Math.round((stats.checked_in / stats.total_attendees) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#F05537] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.total_attendees > 0 ? (stats.checked_in / stats.total_attendees) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default TicketScanner;
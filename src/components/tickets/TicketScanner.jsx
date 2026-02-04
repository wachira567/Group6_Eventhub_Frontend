import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Users,
  Ticket,
  ScanLine,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/utils/constants';

const TicketScanner = ({ eventId, eventTitle }) => {
  const { token } = useSelector((state) => state.auth);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [ticketNumber, setTicketNumber] = useState('');
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch verification stats on mount
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

  const verifyTicket = async (ticketIdentifier, isQrData = false) => {
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      let response;
      
      if (isQrData) {
        // Verify using QR code data
        response = await fetch(`${API_BASE_URL}/tickets/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            qr_data: ticketIdentifier,
            mark_as_used: true
          }),
        });
      } else {
        // Verify using ticket number
        response = await fetch(`${API_BASE_URL}/tickets/verify/${ticketIdentifier}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Verification failed');
      }

      setVerificationResult({
        success: data.valid,
        ...data
      });

      // Add to recent verifications
      if (data.valid) {
        setRecentVerifications(prev => [data.ticket, ...prev].slice(0, 10));
      }

      // Refresh stats
      fetchStats();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!ticketNumber.trim()) {
      setError('Please enter a ticket number');
      return;
    }
    await verifyTicket(ticketNumber.trim());
  };

  const handleQrVerify = async (e) => {
    e.preventDefault();
    if (!qrData.trim()) {
      setError('Please enter QR code data');
      return;
    }
    await verifyTicket(qrData.trim(), true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // In a real implementation, you would decode the QR code from the image
        // For now, we'll just show an alert that this would use a QR code library
        setError('File upload scanning requires a QR code decoding library. Please use manual entry or paste QR data.');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setError(null);
    setTicketNumber('');
    setQrData('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {stats && (
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowStats(!showStats)}
          >
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
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Check-in Progress</span>
                  <span className="font-medium">
                    {stats.total_attendees > 0 
                      ? Math.round((stats.checked_in / stats.total_attendees) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#F05537] h-2.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.total_attendees > 0 
                        ? (stats.checked_in / stats.total_attendees) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScanLine className="w-5 h-5 text-[#F05537]" />
            Verify Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className={scanMode === 'manual' ? 'bg-[#F05537] hover:bg-[#D94E32]' : ''}
            >
              <Search className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setScanMode('camera')}
              className={scanMode === 'camera' ? 'bg-[#F05537] hover:bg-[#D94E32]' : ''}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Data
            </Button>
          </div>

          {/* Manual Entry Form */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-number">Ticket Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="ticket-number"
                    placeholder="e.g., TKT-A1B2C3D4"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#F05537] hover:bg-[#D94E32]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter the ticket number found on the PDF ticket
                </p>
              </div>
            </form>
          )}

          {/* QR Code Form */}
          {scanMode === 'camera' && (
            <form onSubmit={handleQrVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-data">QR Code Data</Label>
                <textarea
                  id="qr-data"
                  placeholder="Paste scanned QR code data here..."
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  className="w-full min-h-[100px] p-3 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Use a QR code scanner app to read the code, then paste the data here
                </p>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  Upload QR Image
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#F05537] hover:bg-[#D94E32]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4 mr-2" />
                      Verify QR
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              verificationResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  verificationResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {verificationResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${
                    verificationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.success ? 'Ticket Verified!' : 'Verification Failed'}
                  </h3>
                  <p className={`text-sm ${
                    verificationResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.message}
                  </p>
                  
                  {verificationResult.ticket && (
                    <div className="mt-4 space-y-2 bg-white/50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ticket #:</span>
                        <span className="font-medium">{verificationResult.ticket.ticket_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Attendee:</span>
                        <span className="font-medium">{verificationResult.ticket.attendee_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="font-medium">{verificationResult.ticket.ticket_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-medium">{verificationResult.ticket.quantity}</span>
                      </div>
                      {verificationResult.ticket.attendee_email && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="font-medium text-sm">{verificationResult.ticket.attendee_email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={resetVerification}
                variant="outline"
                className="mt-4 w-full"
              >
                Verify Another Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Verifications */}
      {recentVerifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recentVerifications.map((ticket, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-[#F05537]" />
                    <div>
                      <p className="font-medium text-sm">{ticket.ticket_number}</p>
                      <p className="text-xs text-gray-500">{ticket.attendee_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{ticket.ticket_type}</p>
                    <p className="text-xs text-gray-500">Qty: {ticket.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketScanner;

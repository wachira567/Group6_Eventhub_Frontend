import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiPost } from "../../utils/api";
import { format } from "date-fns";

const TicketScanner = ({ eventId, onScanComplete }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const [error, setError] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [manualTicketNumber, setManualTicketNumber] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Audio context for beep sound
  const audioContextRef = useRef(null);

  const playBeep = useCallback(
    (success = true) => {
      if (!audioEnabled) return;

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = success ? 1000 : 400;
        oscillator.start();

        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          ctx.currentTime + 0.3,
        );
        oscillator.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.error("Audio play failed:", e);
      }
    },
    [audioEnabled],
  );

  const verifyTicketByNumber = async (ticketNumber) => {
    console.log("verifyTicketByNumber called with:", ticketNumber);
    try {
      setError("");

      // First search for the ticket by number
      console.log("Searching for ticket...");
      const searchResponse = await apiPost(`/tickets/event/${eventId}/search`, {
        search: ticketNumber.toUpperCase(),
      });
      
      // Parse the JSON response
      const searchData = await searchResponse.json();
      console.log("Search response:", searchData);

      if (
        !searchData.tickets ||
        searchData.tickets.length === 0
      ) {
        console.log("No tickets found");
        setScanResult({
          success: false,
          message: "Ticket not found",
          ticket: null,
          scanTime: new Date(),
        });
        playBeep(false);
        return;
      }

      const ticket = searchData.tickets[0];
      console.log("Found ticket:", ticket);

      // Now verify the ticket
      const verifyResponse = await apiPost(`/tickets/verify`, {
        qr_data: ticket.qr_data || ticket.ticket_number,
        event_id: parseInt(eventId),
      });
      
      // Parse the JSON response
      const verifyData = await verifyResponse.json();
      console.log("Verify response:", verifyData);

      if (verifyData.valid) {
        const scanTime = new Date();
        const newScan = {
          ticket: verifyData.ticket,
          timestamp: scanTime,
          formattedTime: format(scanTime, "HH:mm:ss"),
          status: "valid",
        };

        setScanResult({
          success: true,
          message: "✓ Ticket verified successfully!",
          ticket: verifyData.ticket,
          scanTime: scanTime,
        });

        setLastScanned({
          ticket: verifyData.ticket,
          timestamp: scanTime,
          formattedTime: format(scanTime, "MMM dd, yyyy HH:mm:ss"),
        });

        setRecentScans((prev) => [newScan, ...prev].slice(0, 10));
        playBeep(true);

        if (onScanComplete) {
          onScanComplete(verifyData.ticket);
        }
      } else {
        const scanTime = new Date();
        // Enhanced error message for already used tickets
        let errorMessage = verifyData.error || "Invalid ticket";
        let displayTime = scanTime;
        if (verifyData.ticket?.is_used && verifyData.ticket?.used_at) {
          errorMessage = `Already scanned at ${format(new Date(verifyData.ticket.used_at), "MMM dd, yyyy HH:mm:ss")}`;
          displayTime = new Date(verifyData.ticket.used_at);
        }
        setScanResult({
          success: false,
          message: errorMessage,
          ticket: verifyData.ticket,
          scanTime: displayTime,
        });
        playBeep(false);
      }
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      const scanTime = new Date();
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Verification failed";
      setError(errorMsg);
      setScanResult({
        success: false,
        message: errorMsg,
        scanTime: scanTime,
      });
      playBeep(false);
    }
    setManualTicketNumber("");
  };

  const verifyTicket = async (qrData) => {
    console.log("verifyTicket called with:", qrData);
    try {
      setError("");
      console.log("Making API request to /api/tickets/verify...");

      const response = await apiPost(`/tickets/verify`, {
        qr_data: qrData,
        event_id: parseInt(eventId),
      });

      console.log("API response status:", response.status);
      
      // Parse the JSON response
      const data = await response.json();
      console.log("API response data:", data);

      if (data.valid) {
        console.log("Ticket is valid, updating state...");
        const scanTime = new Date();
        const newScan = {
          ticket: data.ticket,
          timestamp: scanTime,
          formattedTime: format(scanTime, "HH:mm:ss"),
          status: "valid",
        };

        setScanResult({
          success: true,
          message: "✓ Ticket verified successfully!",
          ticket: data.ticket,
          scanTime: scanTime,
        });

        setLastScanned({
          ticket: data.ticket,
          timestamp: scanTime,
          formattedTime: format(scanTime, "MMM dd, yyyy HH:mm:ss"),
        });

        setRecentScans((prev) => [newScan, ...prev].slice(0, 10));
        playBeep(true);

        // Notify parent component
        if (onScanComplete) {
          onScanComplete(data.ticket);
        }
      } else {
        console.log("Ticket is invalid, response:", data);
        const scanTime = new Date();
        // Enhanced error message for already used tickets
        let errorMessage = data.error || "Invalid ticket";
        let displayTime = scanTime;
        if (data.ticket?.is_used && data.ticket?.used_at) {
          errorMessage = `Already scanned at ${format(new Date(data.ticket.used_at), "MMM dd, yyyy HH:mm:ss")}`;
          displayTime = new Date(data.ticket.used_at);
        }
        setScanResult({
          success: false,
          message: errorMessage,
          ticket: data.ticket,
          scanTime: displayTime,
        });
        playBeep(false);
      }
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      const scanTime = new Date();
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Verification failed";
      setError(errorMsg);
      setScanResult({
        success: false,
        message: errorMsg,
        ticket: err.response?.data?.ticket,
        scanTime: scanTime,
      });
      playBeep(false);
    }
  };

  const onScanSuccess = useCallback(
    (decodedText, decodedResult) => {
      // Prevent duplicate scans within 3 seconds
      const lastScanTime = scannerRef.current?.lastScanTime || 0;
      if (Date.now() - lastScanTime < 3000) return;

      scannerRef.current = { lastScanTime: Date.now() };

      console.log("QR Code scanned:", decodedText);
      verifyTicket(decodedText);
    },
    [eventId],
  );

  const onScanFailure = useCallback((error) => {
    // Suppress frequent scan failures (normal during scanning)
    if (Math.random() < 0.01) {
      console.debug("Scan attempt - QR code not detected yet");
    }
  }, []);

  const startScanner = async () => {
    try {
      setError("");
      setIsScanning(true);

      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        verbose: false,
        preferredCamera: "environment",
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure,
      );
    } catch (err) {
      console.error("Scanner error:", err);
      try {
        if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            config,
            onScanSuccess,
            onScanFailure,
          );
        }
      } catch (fallbackErr) {
        console.error("Fallback scanner error:", fallbackErr);
        setError(
          "Could not start camera. Please ensure camera permissions are granted.",
        );
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
    setIsScanning(false);
  };

  const scanNewTicket = () => {
    setScanResult(null);
    setLastScanned(null);
    setError("");
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    setManualTicketNumber("");
    setError("");
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualTicketNumber.trim()) {
      verifyTicketByNumber(manualTicketNumber.trim());
    }
  };

  // Log scanResult changes for debugging
  useEffect(() => {
    if (scanResult) {
      console.log("scanResult updated:", scanResult);
    }
  }, [scanResult]);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          id="qr-reader"
          className="w-full rounded-lg overflow-hidden"
          style={{ minHeight: isScanning ? "300px" : "0" }}
        />

        {!isScanning && (
          <div className="p-6 text-center bg-gray-50 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={startScanner}
                className="px-6 py-3 bg-[#F05537] text-white rounded-lg font-medium hover:bg-[#E04429] transition-colors flex items-center justify-center gap-2"
              >
                📷 Start Camera Scanner
              </button>
              <button
                onClick={toggleManualInput}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  showManualInput
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                ⌨️ Manual Entry
              </button>
            </div>

            {showManualInput && (
              <form onSubmit={handleManualSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTicketNumber}
                    onChange={(e) => setManualTicketNumber(e.target.value)}
                    placeholder="Enter ticket number (e.g., C6CAF7A5-E29C-4D)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F05537] font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!manualTicketNumber.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enter the ticket number printed on the ticket (e.g.,
                  C6CAF7A5-E29C-4D)
                </p>
              </form>
            )}
          </div>
        )}

        {isScanning && (
          <div className="p-4 text-center border-t bg-white flex gap-3 justify-center">
            <button
              onClick={scanNewTicket}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              🔄 Scan New Ticket
            </button>
            <button
              onClick={stopScanner}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              ⏹ Stop Scanner
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {scanResult && (
        <div
          className={`rounded-lg border ${
            scanResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div
            className={`p-4 border-b ${
              scanResult.success ? "border-green-200" : "border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`text-4xl ${scanResult.success ? "text-green-600" : "text-red-600"}`}
              >
                {scanResult.success ? "✓" : "✗"}
              </div>
              <div>
                <p
                  className={`text-xl font-bold ${scanResult.success ? "text-green-800" : "text-red-800"}`}
                >
                  {scanResult.message}
                </p>
                {scanResult.scanTime && (
                  <p className="text-sm text-gray-500 mt-1">
                    Scanned at:{" "}
                    {format(scanResult.scanTime, "MMM dd, yyyy HH:mm:ss")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {scanResult.ticket && (
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Ticket Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Ticket Number</p>
                  <p className="font-mono font-medium">
                    {scanResult.ticket.ticket_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p
                    className={`font-medium ${
                      scanResult.ticket.is_used
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {scanResult.ticket.is_used ? "Already Used" : "Valid"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <p className="font-medium">
                    {scanResult.ticket.payment_status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium">{scanResult.ticket.quantity}</p>
                </div>
                {scanResult.ticket.guest_name && (
                  <>
                    <div>
                      <p className="text-gray-500">Guest Name</p>
                      <p className="font-medium">
                        {scanResult.ticket.guest_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Guest Email</p>
                      <p className="font-medium">
                        {scanResult.ticket.guest_email}
                      </p>
                    </div>
                  </>
                )}
                {scanResult.ticket.used_at && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Used At</p>
                    <p className="font-medium text-red-600">
                      {format(
                        new Date(scanResult.ticket.used_at),
                        "MMM dd, yyyy HH:mm:ss",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {scanResult.success && (
            <div className="p-4 border-t border-green-200 bg-green-100 rounded-b-lg">
              <button
                onClick={scanNewTicket}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>📷</span>
                <span>Scan Next Ticket</span>
              </button>
            </div>
          )}
        </div>
      )}

      {lastScanned && !scanResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-blue-800">
              Last Verified Ticket
            </h4>
            <span className="text-sm text-blue-600">
              {lastScanned.formattedTime}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-blue-600">Ticket Number</p>
              <p className="font-mono font-medium">
                {lastScanned.ticket.ticket_number}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Status</p>
              <p className="font-medium text-green-600">✓ Valid</p>
            </div>
          </div>
          <button
            onClick={scanNewTicket}
            className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            📷 Scan Next Ticket
          </button>
        </div>
      )}

      {recentScans.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Recent Scans ({recentScans.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  scan.status === "valid" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div>
                  <p className="font-medium text-sm">
                    {scan.ticket?.ticket_number || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">{scan.formattedTime}</p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    scan.status === "valid" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scan.status === "valid" ? "✓ Valid" : "✗ Invalid"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded-full ${
            audioEnabled
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
          title={audioEnabled ? "Sound On" : "Sound Off"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </button>
      </div>
    </div>
  );
};

export default TicketScanner;

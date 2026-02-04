import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Heart, Calendar, MapPin, Ticket, Loader2 } from "lucide-react";
import {
  formatDate,
  formatPrice,
  formatCurrency,
  truncateText,
} from "../../utils/helpers";
import { API_BASE_URL } from "../../utils/constants";

const EventCard = ({
  event,
  showBadge = true,
  onGetTickets,
  isSaved: initialSaved = false,
  onSaveChange,
}) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Update local state when prop changes
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Revert on error
        setIsSaved(!newSavedState);
        throw new Error("Failed to save event");
      }

      const data = await response.json();
      // Sync with server response
      setIsSaved(data.saved);

      // Notify parent component if callback provided
      if (onSaveChange) {
        onSaveChange(event.id, data.saved);
      }
    } catch (err) {
      console.error("Error saving event:", err);
      // Revert UI on error
      setIsSaved(!newSavedState);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetTickets = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow guest checkout - no authentication required
    if (onGetTickets) {
      onGetTickets(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  // Helper function to get min/max price from ticket types
  const getPriceInfo = () => {
    // Check if event has ticket types array
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map((tt) => tt.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return { minPrice, maxPrice, hasMultiple: prices.length > 1 };
    }
    // Fallback to simple price property
    const price = event.price || 0;
    return { minPrice: price, maxPrice: price, hasMultiple: false };
  };

  // Determine badge based on ticket availability
  const getBadge = () => {
    if (event.ticketsSold >= event.totalTickets) {
      return { text: "Sold Out", className: "bg-gray-500" };
    }
    if (event.ticketsSold / event.totalTickets >= 0.9) {
      return { text: "Almost Full", className: "bg-orange-500" };
    }
    if (event.ticketsSold / event.totalTickets >= 0.75) {
      return { text: "Going Fast", className: "bg-yellow-500" };
    }
    // Default badge for available events
    return { text: "Sales end soon", className: "bg-gray-400" };
  };

  const badge = showBadge ? getBadge() : null;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={event.image}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-3 left-3 ${badge.className} text-white text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {badge.text}
          </div>
        )}

        {/* Save Button - Only show for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            aria-label={isSaved ? "Remove from saved" : "Save event"}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 text-[#6F7287] animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? "fill-[#F05537] text-[#F05537]" : "text-[#6F7287]"
                }`}
              />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date */}
        <p className="text-[#F05537] text-xs font-semibold uppercase tracking-wide mb-2">
          {formatDate(event.date)}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-[#1E0A3C] text-lg mb-2 line-clamp-2 group-hover:text-[#F05537] transition-colors">
          {truncateText(event.title, 60)}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#6F7287] text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Get Tickets Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleGetTickets}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F05537] text-white text-sm font-medium rounded-lg hover:bg-[#D94E32] transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            Get Tickets
          </button>
        </div>

        {/* Organizer */}
        <div className="mt-3 pt-3 border-t border-[#E6E5E8] flex items-center gap-2">
          <div className="w-6 h-6 bg-[#F05537] rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {(event.organizer_name || event.organizer || "E").charAt(0)}
          </div>
          <span className="text-sm text-[#6F7287] truncate">
            {event.organizer_name || event.organizer || "Event Organizer"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
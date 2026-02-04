import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, ExternalLink, Route } from 'lucide-react';
import { Button } from '../ui/button';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const EventMap = ({ coordinates, address, eventTitle, height = '300px' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!coordinates || map.current) return;

    const [lng, lat] = coordinates;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for event location
    const marker = new mapboxgl.Marker({ color: '#F05537' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Add popup
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<strong>${eventTitle}</strong><br/>${address}`);
    
    marker.setPopup(popup);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, address, eventTitle]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation([userLng, userLat]);
        
        // Calculate distance to event
        if (coordinates) {
          const [eventLng, eventLat] = coordinates;
          const dist = calculateDistance(userLat, userLng, eventLat, eventLng);
          setDistance(dist);
          
          // Add user marker to map
          if (map.current) {
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([userLng, userLat])
              .setPopup(new mapboxgl.Popup().setHTML('<strong>You are here</strong>'))
              .addTo(map.current);
            
            // Fit bounds to show both markers
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([userLng, userLat]);
            bounds.extend([eventLng, eventLat]);
            map.current.fitBounds(bounds, { padding: 50 });
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const openInGoogleMaps = () => {
    if (!coordinates) return;
    const [lng, lat] = coordinates;
    const destination = encodeURIComponent(address || `${lat},${lng}`);
    
    let url;
    if (userLocation) {
      // Directions from user location to event
      const [userLng, userLat] = userLocation;
      url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
    } else {
      // Just show event location
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    
    window.open(url, '_blank');
  };

  if (!coordinates) {
    return (
      <div 
        className="w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p>No location specified for this event</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
      />

      {/* Location Info */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-[#F05537] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm">Event Location</p>
            <p className="text-sm text-gray-600 truncate">{address}</p>
          </div>
        </div>

        {distance !== null && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Route className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 text-sm">Distance</p>
              <p className="text-sm text-blue-600">
                {distance < 1 
                  ? `${(distance * 1000).toFixed(0)} m` 
                  : `${distance.toFixed(1)} km`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isLocating ? 'Locating...' : 'Show Distance'}
        </Button>
        
        <Button
          onClick={openInGoogleMaps}
          className="flex-1 sm:flex-none bg-[#F05537] hover:bg-[#D94E32]"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {userLocation ? 'Get Directions' : 'Open in Maps'}
        </Button>
      </div>
    </div>
  );
};

export default EventMap;

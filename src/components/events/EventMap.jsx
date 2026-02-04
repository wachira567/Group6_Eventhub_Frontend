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
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14
    });
    const marker = new mapboxgl.Marker({ color: '#F05537' })
      .setLngLat([lng, lat])
      .addTo(map.current);
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
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
        
        if (coordinates) {
          const [eventLng, eventLat] = coordinates;
          const dist = calculateDistance(userLat, userLng, eventLat, eventLng);
          setDistance(dist);
          
          if (map.current) {
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([userLng, userLat])
              .setPopup(new mapboxgl.Popup().setHTML('<strong>You are here</strong>'))
              .addTo(map.current);
            
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
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      <div ref={mapContainer} style={{ height }} className="w-full rounded-lg border border-gray-200 overflow-hidden" />
    </div>
  );
};

export default EventMap;
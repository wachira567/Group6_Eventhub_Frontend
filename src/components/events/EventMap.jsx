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

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
      <div 
        ref={mapContainer} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
      />
    </div>
  );
};

export default EventMap;
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { Button } from '../ui/button';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapLocationPicker = ({ 
  initialCoordinates = null, 
  initialAddress = '',
  onLocationSelect,
  height = '400px'
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({
    coordinates: initialCoordinates,
    address: initialAddress
  });
  const [isSearching, setIsSearching] = useState(false);

  // Default center (Nairobi, Kenya)
  const defaultCenter = [36.8219, -1.2921];

  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCoordinates || defaultCenter,
      zoom: initialCoordinates ? 15 : 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'top-right'
    );

    // Handle map click
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      await updateMarker([lng, lat]);
    });

    // Add initial marker if coordinates exist
    if (initialCoordinates) {
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat(initialCoordinates)
        .addTo(map.current);
      
      marker.current.on('dragend', async () => {
        const lngLat = marker.current.getLngLat();
        await updateMarker([lngLat.lng, lngLat.lat], false);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const updateMarker = async (coordinates, updateMap = true) => {
    const [lng, lat] = coordinates;
    
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new draggable marker
    marker.current = new mapboxgl.Marker({ draggable: true, color: '#F05537' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.current.on('dragend', async () => {
      const lngLat = marker.current.getLngLat();
      await reverseGeocode(lngLat.lng, lngLat.lat);
    });

    // Fly to location
    if (updateMap) {
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
    }

    // Reverse geocode to get address
    await reverseGeocode(lng, lat);
  };

  const reverseGeocode = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        const location = {
          coordinates: [lng, lat],
          address: address
        };
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const [lng, lat] = result.center;
    updateMarker([lng, lat]);
    setSearchQuery(result.place_name);
    setSearchResults([]);
  };

  const clearLocation = () => {
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    setSelectedLocation({ coordinates: null, address: '' });
    setSearchQuery('');
    onLocationSelect({ coordinates: null, address: '' });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search for a venue or address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05537] focus:border-[#F05537] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={searchLocation}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-[#F05537] hover:bg-[#D94E32]"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectSearchResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <p className="font-medium text-gray-800">{result.text}</p>
                <p className="text-sm text-gray-500">{result.place_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation.address && (
        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <MapPin className="w-5 h-5 text-[#F05537] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800">Selected Location</p>
            <p className="text-sm text-gray-600 truncate">{selectedLocation.address}</p>
            {selectedLocation.coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Lat: {selectedLocation.coordinates[1].toFixed(6)}, 
                Lng: {selectedLocation.coordinates[0].toFixed(6)}
              </p>
            )}
          </div>
          <button
            onClick={clearLocation}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Instructions */}
      {!selectedLocation.coordinates && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Navigation className="w-4 h-4" />
          <span>Click on the map or search to drop a pin at the event location</span>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
      />
    </div>
  );
};

export default MapLocationPicker;

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  width?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude = 48.8566, // Default to Paris coordinates
  longitude = 2.3522,
  zoom = 12,
  height = '400px',
  width = '100%'
}) => {
  const { googleMapsApiKey } = useAuth();
  
  // Create the Google Maps URL with the API key
  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${latitude},${longitude}&zoom=${zoom}`;

  return (
    <div className="rounded-lg overflow-hidden shadow-md" style={{ height, width }}>
      <iframe
        title="Google Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>
    </div>
  );
};

export default GoogleMap;

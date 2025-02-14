import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/maps';
import type { Deal } from '@shared/schema';
import { AlertCircle } from 'lucide-react';

interface DealMapProps {
  deals: Deal[];
  center: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

export default function DealMap({ deals, center, onLocationChange }: DealMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    async function initMap() {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key is missing');
        }

        console.log('Starting Google Maps initialization...');
        await loadGoogleMaps(apiKey);
        console.log('Google Maps API loaded, creating map...');

        if (!mapRef.current) {
          throw new Error('Map container not found');
        }

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        googleMapRef.current = map;

        map.addListener('center_changed', () => {
          const newCenter = map.getCenter();
          if (newCenter && onLocationChange) {
            onLocationChange({
              lat: newCenter.lat(),
              lng: newCenter.lng()
            });
          }
        });

        console.log('Map created successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    }

    initMap();
  }, [center]);

  // Update markers when deals change
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    deals.forEach(deal => {
      const location = deal.location as { type: string; coordinates: [number, number] };
      const [lng, lat] = location.coordinates;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current,
        title: deal.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4338ca",
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: "#ffffff",
        }
      });

      // Show deal info on click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${deal.title}</h3>
            <p class="text-sm">${deal.description}</p>
            <p class="text-sm font-medium mt-1">${deal.discountPercent}% off</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [deals]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full" 
      style={{ minHeight: '400px' }}
    />
  );
}
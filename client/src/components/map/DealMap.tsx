import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { loadGoogleMaps } from "@/lib/maps";
import type { Deal } from "@shared/schema";
import { AlertCircle } from "lucide-react";

interface DealMapProps {
  deals: Deal[];
  center: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

export default function DealMap({
  deals,
  center,
  onLocationChange,
}: DealMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // UseLayoutEffect to ensure the DOM is ready
  useLayoutEffect(() => {
    const initMap = async () => {
      if (mapRef.current) {
        console.log("Map container is available, initializing map...");
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) throw new Error("Google Maps API key is missing");

          console.log("Loading Google Maps script...");
          await loadGoogleMaps(apiKey);
          console.log("Google Maps script loaded!");

          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
          });

          googleMapRef.current = map;

          map.addListener("center_changed", () => {
            const newCenter = map.getCenter();
            if (newCenter && onLocationChange) {
              onLocationChange({
                lat: newCenter.lat(),
                lng: newCenter.lng(),
              });
            }
          });

          setIsLoading(false);
        } catch (err) {
          console.error("Map initialization failed:", err);
          setError(err instanceof Error ? err.message : "Failed to load map");
          setIsLoading(false);
        }
      } else {
        console.log("Map container not found, retrying...");
        setTimeout(initMap, 100000); // Retry every 100ms if the container is not ready
      }
    };

    initMap(); // Start map initialization

    return () => {
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }
    };
  }, [center, onLocationChange]);

  useEffect(() => {
    if (!googleMapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    deals.forEach((deal) => {
      try {
        const location = deal.location as {
          type: string;
          coordinates: [number, number];
        };
        if (!location || !location.coordinates) {
          console.error("Invalid deal location:", deal);
          return;
        }

        const [lng, lat] = location.coordinates;
        console.log("Adding marker at:", { lat, lng });

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current!,
          title: deal.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4338ca",
            fillOpacity: 0.8,
            strokeWeight: 1,
            strokeColor: "#ffffff",
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${deal.title}</h3>
              <p class="text-sm">${deal.description}</p>
              <p class="text-sm font-medium mt-1">${deal.discountPercent}% off</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(googleMapRef.current!, marker);
        });

        markersRef.current.push(marker);
      } catch (error) {
        console.error("Error adding marker for deal:", deal, error);
      }
    });
  }, [deals]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
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
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DealMap from "@/components/map/DealMap";
import DealCard from "@/components/deals/DealCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Deal } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius] = useState(5);

  // Only fetch deals when we have a valid location
  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals', location?.lat, location?.lng, radius],
    enabled: !!location,
    queryFn: async () => {
      if (!location) return [];
      console.log('Fetching deals with params:', { location, radius }); // Debug log
      const response = await fetch(`/api/deals?lat=${location.lat}&lng=${location.lng}&radius=${radius}`);
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data;
    },
    staleTime: 30000, // Prevent frequent refetches
  });

  useEffect(() => {
    // Try to get user's location on mount
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got user location:', position.coords); // Debug log
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Set default location if geolocation fails
        setLocation({ lat: 40.7128, lng: -74.0060 });
      }
    );
  }, []); // Only run once on mount

  const handleLocationUpdate = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Updating location:', position.coords); // Debug log
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            className="pl-9"
            // In a real app, integrate with Google Places Autocomplete
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleLocationUpdate}
          disabled={isLoading}
        >
          Use my location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg overflow-hidden h-[400px] md:h-[600px]">
            <DealMap 
              deals={deals || []}
              center={location || { lat: 40.7128, lng: -74.0060 }}
              onLocationChange={(newLocation) => {
                // Only update if significantly different to prevent loops
                if (!location || 
                    Math.abs(location.lat - newLocation.lat) > 0.0001 ||
                    Math.abs(location.lng - newLocation.lng) > 0.0001) {
                  setLocation(newLocation);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Nearby Deals</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !deals?.length ? (
            <p className="text-muted-foreground">No deals found in this area yet.</p>
          ) : (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
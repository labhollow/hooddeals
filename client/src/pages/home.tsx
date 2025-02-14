import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DealMap from "@/components/map/DealMap";
import DealCard from "@/components/deals/DealCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Deal } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [radius, setRadius] = useState(5);

  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals', location, radius],
    queryFn: () => 
      fetch(`/api/deals?lat=${location.lat}&lng=${location.lng}&radius=${radius}`)
        .then(r => r.json())
  });

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
        <Button variant="outline" onClick={() => {
          // In a real app, get user's location
          navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          });
        }}>
          Use my location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg overflow-hidden h-[400px] md:h-[600px]">
            <DealMap 
              deals={deals || []}
              center={location}
              onLocationChange={setLocation}
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
          ) : deals?.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  );
}

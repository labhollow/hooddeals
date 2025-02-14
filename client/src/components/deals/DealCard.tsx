import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Timer } from "lucide-react";
import type { Deal } from "@shared/schema";
import DealProgress from "./DealProgress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookDeal = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bookings', {
        dealId: deal.id,
        userId: 1, // In a real app, get from auth context
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      toast({
        title: "Success!",
        description: "You've successfully joined this deal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const discountedPrice = deal.originalPrice * (1 - deal.discountPercent / 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{deal.title}</h3>
            <p className="text-sm text-muted-foreground">{deal.description}</p>
          </div>
          <Badge variant="secondary">{deal.serviceType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              ${discountedPrice}
              <span className="text-sm text-muted-foreground line-through ml-2">
                ${deal.originalPrice}
              </span>
            </p>
            <p className="text-sm text-green-600 font-medium">
              Save {deal.discountPercent}%
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(deal.startDate), 'MMM d')} - {format(new Date(deal.endDate), 'MMM d')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Service area available on map</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>{deal.minCustomers} customers needed</span>
          </div>
        </div>

        <DealProgress current={deal.currentCustomers} target={deal.minCustomers} />
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => bookDeal.mutate()}
          disabled={bookDeal.isPending}
        >
          {bookDeal.isPending ? "Joining..." : "Join this deal"}
        </Button>
      </CardFooter>
    </Card>
  );
}

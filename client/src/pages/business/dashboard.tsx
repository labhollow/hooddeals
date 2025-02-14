import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import type { Deal } from "@shared/schema";
import DealProgress from "@/components/deals/DealProgress";

export default function Dashboard() {
  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/business/1/deals'], // In real app, get ID from auth context
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <Link href="/business/create-deal">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))
        ) : deals?.map((deal) => (
          <Card key={deal.id}>
            <CardHeader>
              <CardTitle className="text-lg">{deal.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(deal.startDate).toLocaleDateString()} -{" "}
                {new Date(deal.endDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Progress</p>
                <DealProgress 
                  current={deal.currentCustomers} 
                  target={deal.minCustomers} 
                />
              </div>

              <div className="flex justify-between text-sm">
                <span>Original Price: ${deal.originalPrice}</span>
                <span>Discount: {deal.discountPercent}%</span>
              </div>

              <div className="text-sm text-muted-foreground">
                Service Area: {deal.serviceArea.type}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

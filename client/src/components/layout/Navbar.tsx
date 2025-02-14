import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg hover:opacity-80">
          Neighborhood Deals
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href="/business/create-deal">
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/business/dashboard">
              <User className="mr-2 h-4 w-4" />
              Business Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
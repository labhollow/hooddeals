import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="font-semibold text-lg hover:opacity-80">
            Neighborhood Deals
          </a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/business/create-deal">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </Link>
          <Link href="/business/dashboard">
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Business Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

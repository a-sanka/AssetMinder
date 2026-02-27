"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Map,
  MapPin,
  QrCode,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/floor-plan", label: "Floor Plans", icon: Map },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/qr-codes", label: "QR Codes", icon: QrCode },
  { href: "/facilities", label: "Facilities", icon: Building2 },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="flex h-16 items-center gap-2 px-6 border-b">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AssetMinder</span>
          </SheetTitle>
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <Link
              href="/scan"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"
            >
              <ScanLine className="h-4 w-4" />
              Open Scanner
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <span className="font-bold">AssetMinder</span>
      </div>
    </header>
  );
}

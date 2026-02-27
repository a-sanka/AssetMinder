import Link from "next/link";
import { ScanWorkflow } from "@/components/scanner/ScanWorkflow";
import { ArrowLeft, Package } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-bold">AssetMinder</span>
        </div>
      </header>

      {/* Scanner content */}
      <div className="flex-1 p-4">
        <ScanWorkflow />
      </div>
    </div>
  );
}

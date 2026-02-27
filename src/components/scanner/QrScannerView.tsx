"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerViewProps {
  onScan: (data: string) => void;
  active: boolean;
  borderColor?: string;
}

export function QrScannerView({
  onScan,
  active,
  borderColor = "border-blue-500",
}: QrScannerViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!active) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      return;
    }

    const scannerId = "qr-scanner-element";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        () => {
          // QR code scan error (no code found in frame) — ignore
        }
      )
      .catch((err) => {
        console.error("Scanner start error:", err);
        setError(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      });

    return () => {
      scanner
        .stop()
        .catch(() => {})
        .then(() => scanner.clear());
    };
  }, [active]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive font-medium mb-2">Camera Error</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`border-4 ${borderColor} rounded-xl overflow-hidden transition-colors`}
      >
        <div id="qr-scanner-element" className="w-full" />
      </div>
    </div>
  );
}

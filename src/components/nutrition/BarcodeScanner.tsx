"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const TEAL = "#14B8A6";
const CREAM = "#F5F0E8";

interface BarcodeScannerProps {
  onResult: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const containerId = "barcode-reader";

  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  const startScanning = useCallback(async () => {
    cleanup();
    setError("");
    setScanning(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 150 }, aspectRatio: 1.0 },
        (decodedText) => {
          scanner.stop().catch(() => {});
          setScanning(false);
          onResult(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setScanning(false);
      const msg = err?.message || "";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Camera access blocked. Allow camera in browser settings, or type the barcode below.");
      } else {
        setError(`Camera could not start. Type the barcode number below instead.`);
      }
      setTimeout(() => manualInputRef.current?.focus(), 200);
    }
  }, [cleanup, onResult]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2500,
      background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "min(400px, 100%)", background: "#fff", borderRadius: 20, padding: 24,
        maxHeight: "calc(100vh - 48px)", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 400, color: "#1A1A1A",
          }}>
            Scan Barcode
          </h3>
          <button onClick={() => { cleanup(); onClose(); }} style={{
            background: "none", border: "none", fontSize: 22, color: "rgba(0,0,0,0.3)", cursor: "pointer",
          }}>
            &times;
          </button>
        </div>

        {/* Camera area */}
        <div
          id={containerId}
          style={{
            width: "100%", borderRadius: 14, overflow: "hidden",
            marginBottom: scanning ? 16 : 0,
            minHeight: scanning ? 250 : 0,
            height: scanning ? "auto" : 0,
          }}
        />

        {!scanning && (
          <button onClick={startScanning} style={{
            width: "100%", padding: "40px 20px", borderRadius: 14,
            border: `2px dashed rgba(0,0,0,0.12)`, background: CREAM,
            color: "#1A1A1A", fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", marginBottom: 16,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
              <path d="M1 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M23 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
            Open Camera to Scan
          </button>
        )}

        {scanning && (
          <button onClick={cleanup} style={{
            width: "100%", padding: 12, borderRadius: 12,
            border: "none", background: "#EF4444", color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", marginBottom: 16,
          }}>
            Stop Scanning
          </button>
        )}

        {/* Manual entry */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "rgba(0,0,0,0.45)", marginBottom: 8, display: "block",
          }}>
            {scanning ? "Or type barcode:" : "Enter barcode number:"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={manualInputRef}
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. 0049000042566"
              inputMode="numeric"
              style={{
                flex: 1, padding: "14px 14px", borderRadius: 10,
                border: "2px solid rgba(0,0,0,0.08)", background: CREAM,
                fontSize: 15, fontFamily: "'Inter', sans-serif",
                outline: "none", color: "#1A1A1A", fontWeight: 500,
              }}
              onKeyDown={e => { if (e.key === "Enter" && manualCode) { cleanup(); onResult(manualCode); } }}
            />
            <button
              onClick={() => { cleanup(); onResult(manualCode); }}
              disabled={!manualCode}
              style={{
                padding: "14px 18px", borderRadius: 10, border: "none",
                background: manualCode ? TEAL : "rgba(0,0,0,0.08)",
                color: manualCode ? "#fff" : "rgba(0,0,0,0.3)",
                fontSize: 14, fontWeight: 700, cursor: manualCode ? "pointer" : "not-allowed",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Look Up
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            color: "#EF4444", fontSize: 13, fontFamily: "'Inter', sans-serif",
            lineHeight: 1.5, padding: "12px 14px",
            background: "#FEF2F2", borderRadius: 10,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

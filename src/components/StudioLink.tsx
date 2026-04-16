"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudioLink() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/studio")) return null;

  const href = `/studio?route=${encodeURIComponent(pathname)}`;

  return (
    <Link
      href={href}
      aria-label="Open SAVY Studio for this page"
      style={{
        position: "fixed",
        right: "calc(14px + env(safe-area-inset-right))",
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px 8px 10px",
        background: "rgba(10,10,10,0.82)",
        color: "#fff",
        textDecoration: "none",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: "#DC143C",
          boxShadow: "0 0 0 3px rgba(220,20,60,0.18)",
        }}
      />
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          letterSpacing: 0,
          textTransform: "none",
          fontSize: 15,
          color: "#DC143C",
        }}
      >
        studio
      </span>
      <span style={{ opacity: 0.55, fontSize: 10 }}>↗</span>
    </Link>
  );
}

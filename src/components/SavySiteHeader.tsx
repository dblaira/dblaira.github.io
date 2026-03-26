"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { SavyMobileMenu } from "./SavyMobileMenu";

export function SavySiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const initial = user?.email?.[0]?.toUpperCase() ?? null;

  return (
    <>
      <div
        style={{
          background: "#0A0A0A",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src="/savy-icon-header.png"
              alt="SAVY"
              style={{ height: 40, width: 40, borderRadius: "50%" }}
            />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {initial && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {initial}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.85)",
                padding: "0.5rem",
                marginRight: "-0.5rem",
                cursor: "pointer",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <SavyMobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} onSignOut={signOut} />
    </>
  );
}

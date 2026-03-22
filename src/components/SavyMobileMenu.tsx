"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const CRIMSON = "#DC143C";

const NAV_ITEMS: { href: string; label: string; hint?: string }[] = [
  { href: "/", label: "Home", hint: "Experiments" },
  { href: "/sleep", label: "Sleep", hint: "Dashboard" },
  { href: "/mood", label: "Mood", hint: "Emotion Check-in" },
  { href: "/ontology", label: "Ontology", hint: "Adam's Ontology" },
  { href: "/inbox", label: "Inbox", hint: "Workflow" },
  { href: "/beliefs", label: "Beliefs", hint: "Belief Library" },
];

export interface SavyMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSignOut?: () => void;
}

export function SavyMobileMenu({ isOpen, onClose, user, onSignOut }: SavyMobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000000",
        animation: "savyMenuFadeIn 0.2s ease-out",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        style={{
          position: "absolute",
          top: "calc(1rem + env(safe-area-inset-top, 0px))",
          right: "1rem",
          background: "transparent",
          border: "none",
          color: "#FFFFFF",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "0.1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem",
          zIndex: 10,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        CLOSE
        <span style={{ fontSize: "1.25rem" }} aria-hidden>
          ✕
        </span>
      </button>

      <nav
        style={{
          paddingTop: "calc(4rem + env(safe-area-inset-top, 0px))",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "10rem",
          height: "100%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Brand anchor */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src="/savy-icon-header.png"
            alt="SAVY"
            style={{ width: 40, height: 40, borderRadius: "50%", opacity: 0.9 }}
          />
        </div>

        <div
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.15rem",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Navigate
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "1rem 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: active ? CRIMSON : "#FFFFFF",
                    fontSize: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.12rem",
                    textTransform: "uppercase",
                    textAlign: "left",
                    textDecoration: "none",
                    fontFamily: "'Inter', sans-serif",
                    transition: "color 0.2s ease",
                    boxSizing: "border-box",
                  }}
                >
                  <span>
                    {item.label}
                    {item.hint ? (
                      <span
                        style={{
                          display: "block",
                          marginTop: "0.25rem",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          letterSpacing: "0.06rem",
                          textTransform: "none",
                          color: active ? "rgba(220, 20, 60, 0.85)" : "rgba(255, 255, 255, 0.45)",
                        }}
                      >
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                  {active ? (
                    <span style={{ color: CRIMSON, flexShrink: 0 }} aria-hidden>
                      ●
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom-fixed section */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.5rem",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          background: "#000000",
        }}
      >
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.35)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </span>
          </div>
        )}
        {user ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut?.();
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "0.875rem 1.5rem",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "4px",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            style={{
              display: "block",
              width: "100%",
              padding: "0.875rem 1.5rem",
              background: CRIMSON,
              border: "none",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              textAlign: "center",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              boxSizing: "border-box",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

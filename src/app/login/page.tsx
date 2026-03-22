"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const CRIMSON = "#DC143C";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authErr) throw authErr;
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password.");
      } else {
        setError(msg);
      }
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/savy-icon-header.png"
            alt="SAVY"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              opacity: 0.9,
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
            fontWeight: 400,
            fontStyle: "italic",
            color: "#FFFFFF",
            textAlign: "center",
            margin: "0 0 40px 0",
          }}
        >
          Sign In
        </h1>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 24,
              padding: "12px 16px",
              background: "rgba(220, 20, 60, 0.1)",
              border: "1px solid rgba(220, 20, 60, 0.3)",
              borderRadius: 8,
              color: CRIMSON,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 20,
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 32,
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          />

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "14px",
              background: CRIMSON,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

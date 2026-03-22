"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const CRIMSON = "#DC143C";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      setDone(true);
      setTimeout(() => router.replace("/"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#22C55E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 32 }}>&#10003;</span>
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          Password updated. Redirecting...
        </span>
      </div>
    );
  }

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
            style={{ width: 56, height: 56, borderRadius: "50%", opacity: 0.9 }}
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
          New Password
        </h1>

        {!ready && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
            }}
          >
            Verifying reset link...
          </div>
        )}

        {ready && (
          <>
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
                htmlFor="new-password"
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
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
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
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? "Updating..." : "Set Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

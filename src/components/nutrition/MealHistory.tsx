"use client";

import { useState, useEffect } from "react";
import { getMealHistory, relogMeal, calculateDayTotals } from "@/lib/nutrition-actions";
import type { Meal } from "@/lib/nutrition-actions";

const SUN = "#FFE15D";
const OCEAN = "#1D5D9B";
const CHARCOAL = "#2C2C2C";
const GLASS = "rgba(44,44,44,0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.1)";

interface MealHistoryProps { onRelog: () => void; }

export function MealHistory({ onRelog }: MealHistoryProps) {
  const [history, setHistory] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [relogging, setRelogging] = useState<string | null>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => { setLoading(true); const meals = await getMealHistory(30); setHistory(meals); setLoading(false); };

  const handleRelog = async (mealId: string) => {
    setRelogging(mealId);
    try { await relogMeal(mealId); onRelog(); } catch (err) { console.error(err); }
    setRelogging(null);
  };

  const dateGroups: Record<string, Meal[]> = {};
  for (const meal of history) { if (!dateGroups[meal.date]) dateGroups[meal.date] = []; dateGroups[meal.date].push(meal); }
  const dates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split("T")[0];

  if (loading) return <div style={{ textAlign: "center", padding: 40, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(44,44,44,0.5)" }}>Loading meal history...</div>;
  if (dates.length === 0) return <div style={{ textAlign: "center", padding: 40, background: GLASS, borderRadius: 14, border: `1px solid ${GLASS_BORDER}`, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", backdropFilter: "blur(16px)" }}>No meals logged yet.</div>;

  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: CHARCOAL, marginBottom: 4, marginTop: 0 }}>Meal History</h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(44,44,44,0.5)", marginBottom: 16, marginTop: 0 }}>Tap a meal to re-log it today. Full food lists, not just totals.</p>

      {dates.map(date => {
        const dayMeals = dateGroups[date];
        const dayTotals = calculateDayTotals(dayMeals);
        const isExpanded = expandedDate === date;
        const isToday = date === today;
        const label = isToday ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        return (
          <div key={date} style={{ background: GLASS, borderRadius: 12, marginBottom: 8, border: `1px solid ${GLASS_BORDER}`, overflow: "hidden", backdropFilter: "blur(16px)" }}>
            <div onClick={() => setExpandedDate(isExpanded ? null : date)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{dayTotals.calories} cal · {dayTotals.protein}p · {dayTotals.carbs}c · {dayTotals.fat}f</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>
            {isExpanded && (
              <div style={{ padding: "0 16px 12px" }}>
                {dayMeals.map(meal => {
                  if (!meal.meal_entries || meal.meal_entries.length === 0) return null;
                  const mealCal = meal.meal_entries.reduce((sum, e) => sum + (e.foods?.calories || 0) * (e.quantity || 1), 0);
                  return (
                    <div key={meal.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>{meal.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: SUN, fontWeight: 700 }}>{Math.round(mealCal)} cal</span>
                          {!isToday && (
                            <button onClick={(e) => { e.stopPropagation(); handleRelog(meal.id); }} disabled={relogging === meal.id}
                              style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: OCEAN, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: relogging === meal.id ? 0.5 : 1, letterSpacing: "0.05em" }}>
                              {relogging === meal.id ? "..." : "RE-LOG"}
                            </button>
                          )}
                        </div>
                      </div>
                      {meal.meal_entries.map(entry => (
                        <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 4px 12px" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                            {entry.foods?.name}{entry.quantity !== 1 && <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>x{entry.quantity}</span>}
                          </span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                            {Math.round((entry.foods?.calories || 0) * (entry.quantity || 1))} · {Math.round((entry.foods?.protein || 0) * (entry.quantity || 1))}p
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

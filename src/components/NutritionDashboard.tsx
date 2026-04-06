"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { MacroRings } from "@/components/nutrition/MacroRings";
import { MealLogger } from "@/components/nutrition/MealLogger";
import { MealHistory } from "@/components/nutrition/MealHistory";
import { FoodEditor } from "@/components/nutrition/FoodEditor";
import {
  getMealsForDate, getMacroGoals, calculateDayTotals,
  getRotationFoods, createFood, searchFoods,
} from "@/lib/nutrition-actions";
import type { Meal, MacroGoals, Food } from "@/lib/nutrition-actions";
import { useAuth } from "@/lib/useAuth";

const CREAM = "#F5F0E8";
const TEAL = "#14B8A6";

type Tab = "today" | "history" | "library";

export default function NutritionDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<MacroGoals>({
    calorie_goal: 2400, protein_goal: 150, carbs_goal: 250, fat_goal: 80,
  });
  const [loading, setLoading] = useState(true);

  // Library tab state
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryResults, setLibraryResults] = useState<Food[]>([]);
  const [rotationFoods, setRotationFoods] = useState<Food[]>([]);
  const [showFoodEditor, setShowFoodEditor] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<Food> | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [m, g] = await Promise.all([getMealsForDate(date), getMacroGoals()]);
    setMeals(m);
    setGoals(g);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const totals = calculateDayTotals(meals);

  const loadLibrary = useCallback(async () => {
    const rotation = await getRotationFoods();
    setRotationFoods(rotation);
  }, []);

  useEffect(() => {
    if (tab === "library" && user) loadLibrary();
  }, [tab, user, loadLibrary]);

  const handleLibrarySearch = async (query: string) => {
    setLibrarySearch(query);
    if (query.length >= 2) {
      setLibraryResults(await searchFoods(query));
    } else {
      setLibraryResults([]);
    }
  };

  const handleSaveNewFood = async (food: Partial<Food>) => {
    await createFood(food);
    setShowFoodEditor(false);
    setEditingFood(undefined);
    await loadLibrary();
  };

  // Date navigation
  const shiftDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const isToday = date === new Date().toISOString().split("T")[0];
  const dateLabel = isToday ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  if (authLoading) {
    return (
      <div style={{ background: CREAM, minHeight: "100vh" }}>
        <SavySiteHeader />
        <div style={{ textAlign: "center", padding: 80, fontFamily: "'Inter', sans-serif", color: "rgba(0,0,0,0.3)" }}>
          Loading...
        </div>
      </div>
    );
  }


  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      <SavySiteHeader />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        {/* Page title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400,
          color: "#1A1A1A", marginBottom: 4, marginTop: 8,
        }}>
          Nutrition
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "rgba(0,0,0,0.3)", marginBottom: 20, marginTop: 0,
        }}>
          Every ounce, every macro
        </p>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 20,
          background: "#fff", borderRadius: 10, padding: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {([
            { key: "today" as Tab, label: "Today" },
            { key: "history" as Tab, label: "History" },
            { key: "library" as Tab, label: "Library" },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                border: "none", background: tab === t.key ? TEAL : "transparent",
                color: tab === t.key ? "#fff" : "rgba(0,0,0,0.5)",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.03em",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {tab === "today" && (
          <>
            {/* Date navigator */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16,
            }}>
              <button onClick={() => shiftDate(-1)} style={{
                background: "none", border: "none", fontSize: 18,
                color: "rgba(0,0,0,0.3)", cursor: "pointer", padding: "8px 12px",
              }}>
                ‹
              </button>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1A1A1A",
              }}>
                {dateLabel}
              </span>
              <button onClick={() => shiftDate(1)} disabled={isToday} style={{
                background: "none", border: "none", fontSize: 18,
                color: isToday ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.3)",
                cursor: isToday ? "not-allowed" : "pointer", padding: "8px 12px",
              }}>
                ›
              </button>
            </div>

            {/* Macro rings */}
            {!loading && (
              <div style={{
                background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16,
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <MacroRings
                  calories={totals.calories}
                  protein={totals.protein}
                  carbs={totals.carbs}
                  fat={totals.fat}
                  goals={goals}
                />
                {totals.fiber > 0 && (
                  <div style={{
                    textAlign: "center", fontFamily: "'Inter', sans-serif",
                    fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 4,
                  }}>
                    Fiber: {totals.fiber}g
                  </div>
                )}
              </div>
            )}

            {/* Meal logger */}
            <MealLogger meals={meals} date={date} onUpdate={loadData} />
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <MealHistory onRelog={loadData} />
        )}

        {/* LIBRARY TAB */}
        {tab === "library" && (
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16,
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif", fontSize: 18,
                fontWeight: 400, color: "#1A1A1A", margin: 0,
              }}>
                Food Library
              </h3>
              <button onClick={() => { setEditingFood(undefined); setShowFoodEditor(true); }} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: TEAL, color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}>
                + New Food
              </button>
            </div>

            <input
              value={librarySearch}
              onChange={e => handleLibrarySearch(e.target.value)}
              placeholder="Search your foods..."
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "2px solid rgba(0,0,0,0.08)", background: "#fff",
                fontSize: 14, fontFamily: "'Inter', sans-serif",
                outline: "none", color: "#1A1A1A", boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            {/* Search results */}
            {librarySearch && libraryResults.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(0,0,0,0.35)", display: "block", marginBottom: 8,
                }}>
                  Search Results
                </span>
                {libraryResults.map(food => (
                  <FoodRow key={food.id} food={food} />
                ))}
              </div>
            )}

            {/* Rotation foods */}
            {!librarySearch && rotationFoods.length > 0 && (
              <div>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: TEAL, display: "block", marginBottom: 8,
                }}>
                  Rotation Foods ({rotationFoods.length})
                </span>
                {rotationFoods.map(food => (
                  <FoodRow key={food.id} food={food} />
                ))}
              </div>
            )}

            {!librarySearch && rotationFoods.length === 0 && (
              <div style={{
                textAlign: "center", padding: 30, fontFamily: "'Inter', sans-serif",
                fontSize: 13, color: "rgba(0,0,0,0.35)",
              }}>
                No rotation foods yet. Add foods and mark them as rotation to build your superfood library.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Food editor modal */}
      {showFoodEditor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{ width: "min(440px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <FoodEditor
              initial={editingFood}
              onSave={handleSaveNewFood}
              onCancel={() => { setShowFoodEditor(false); setEditingFood(undefined); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FoodRow({ food }: { food: Food }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 14px", background: "#fff", borderRadius: 10, marginBottom: 4,
      border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A1A1A" }}>
          {food.name}
        </span>
        {food.brand && (
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginLeft: 6 }}>
            {food.brand}
          </span>
        )}
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 2 }}>
          {food.serving_size || food.serving_unit}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1A1A",
        }}>
          {food.calories} cal
        </span>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(0,0,0,0.35)" }}>
          {food.protein}p · {food.carbs}c · {food.fat}f
        </div>
      </div>
    </div>
  );
}

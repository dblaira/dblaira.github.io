"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { MacroRings } from "@/components/nutrition/MacroRings";
import { MealLogger } from "@/components/nutrition/MealLogger";
import { MealHistory } from "@/components/nutrition/MealHistory";
import { FoodEditor } from "@/components/nutrition/FoodEditor";
import { BarcodeScanner } from "@/components/nutrition/BarcodeScanner";
import {
  getMealsForDate, getMacroGoals, calculateDayTotals,
  getRotationFoods, createFood, searchFoods,
  lookupBarcode, getFoodByBarcode, logFoodToMeal,
} from "@/lib/nutrition-actions";
import type { Meal, MacroGoals, Food } from "@/lib/nutrition-actions";
import { useAuth } from "@/lib/useAuth";

// Bold palette from Nutrition App
const SUN = "#F4D160";
const OCEAN = "#1D5D9B";
const CHARCOAL = "#2C2C2C";
const GLASS = "rgba(44,44,44,0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.1)";
const ORANGE = "#F49D1A";
const GREEN = "#27AE60";

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

  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryResults, setLibraryResults] = useState<Food[]>([]);
  const [rotationFoods, setRotationFoods] = useState<Food[]>([]);
  const [showFoodEditor, setShowFoodEditor] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<Food> | undefined>();
  const [showFabScanner, setShowFabScanner] = useState(false);
  const [fabMeal, setFabMeal] = useState<string | null>(null);

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
    const saved = await createFood(food);
    setShowFoodEditor(false);
    setEditingFood(undefined);
    // If triggered from FAB, log to selected meal
    if (fabMeal && fabMeal !== "pick") {
      await logFoodToMeal(saved.id, fabMeal, 1, date);
      setFabMeal(null);
      await loadData();
    }
    await loadLibrary();
  };

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
      <div style={{ background: SUN, minHeight: "100vh" }}>
        <SavySiteHeader />
        <div style={{ textAlign: "center", padding: 80, fontFamily: "'Inter', sans-serif", color: CHARCOAL }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: SUN, minHeight: "100vh" }}>
      <SavySiteHeader />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        {/* Page title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
          color: CHARCOAL, marginBottom: 4, marginTop: 8,
        }}>
          Nutrition
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "rgba(44,44,44,0.5)", marginBottom: 20, marginTop: 0,
        }}>
          Every ounce, every macro
        </p>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 20,
          background: GLASS, borderRadius: 12, padding: 3,
          border: `1px solid ${GLASS_BORDER}`,
          backdropFilter: "blur(16px)",
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
                flex: 1, padding: "10px 0", borderRadius: 9,
                border: "none",
                background: tab === t.key ? OCEAN : "transparent",
                color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.05em",
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
                background: "none", border: "none", fontSize: 20,
                color: CHARCOAL, cursor: "pointer", padding: "8px 12px", fontWeight: 700,
              }}>
                ‹
              </button>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: CHARCOAL,
              }}>
                {dateLabel}
              </span>
              <button onClick={() => shiftDate(1)} disabled={isToday} style={{
                background: "none", border: "none", fontSize: 20,
                color: isToday ? "rgba(44,44,44,0.2)" : CHARCOAL,
                cursor: isToday ? "not-allowed" : "pointer", padding: "8px 12px", fontWeight: 700,
              }}>
                ›
              </button>
            </div>

            {/* Macro rings */}
            {!loading && (
              <div style={{
                background: GLASS, borderRadius: 16, padding: 16, marginBottom: 16,
                border: `1px solid ${GLASS_BORDER}`,
                backdropFilter: "blur(16px)",
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
                    fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4,
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
                fontWeight: 700, color: CHARCOAL, margin: 0,
              }}>
                Food Library
              </h3>
              <button onClick={() => { setEditingFood(undefined); setShowFoodEditor(true); }} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: OCEAN, color: "#fff",
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
                border: `1px solid ${GLASS_BORDER}`, background: GLASS,
                fontSize: 14, fontFamily: "'Inter', sans-serif",
                outline: "none", color: "#fff", boxSizing: "border-box",
                marginBottom: 16, backdropFilter: "blur(16px)",
              }}
            />

            {librarySearch && libraryResults.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(44,44,44,0.5)", display: "block", marginBottom: 8,
                }}>
                  Search Results
                </span>
                {libraryResults.map(food => (
                  <FoodRow key={food.id} food={food} />
                ))}
              </div>
            )}

            {!librarySearch && rotationFoods.length > 0 && (
              <div>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: ORANGE, display: "block", marginBottom: 8,
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
                textAlign: "center", padding: 30,
                background: GLASS, borderRadius: 14,
                border: `1px solid ${GLASS_BORDER}`,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13, color: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(16px)",
              }}>
                No rotation foods yet. Add foods and mark them as rotation to build your superfood library.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setFabMeal("pick")}
        style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          width: 64, height: 64, borderRadius: 32, border: "none",
          background: OCEAN, color: "#fff",
          fontSize: 32, fontWeight: 300, cursor: "pointer",
          boxShadow: "0 6px 20px rgba(29,93,155,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, transition: "transform 0.15s",
        }}
      >
        +
      </button>

      {/* Meal picker from FAB */}
      {fabMeal === "pick" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1500,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 16px 100px",
        }}
          onClick={() => setFabMeal(null)}
        >
          <div style={{
            background: GLASS, borderRadius: 16, padding: 16, width: "100%", maxWidth: 400,
            border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(24px)",
          }}
            onClick={e => e.stopPropagation()}
          >
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 12,
            }}>
              Add to which meal?
            </span>
            {["Breakfast", "Lunch", "Dinner", "Snack"].map(m => {
              const colors: Record<string, string> = { Breakfast: "#B01E68", Lunch: "#1D5D9B", Dinner: "#F49D1A", Snack: "#DC3535" };
              return (
                <button key={m} onClick={() => { setFabMeal(m); setShowFabScanner(true); }} style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "none",
                  background: colors[m], color: "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", marginBottom: 6,
                }}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FAB barcode scanner */}
      {showFabScanner && fabMeal && fabMeal !== "pick" && (
        <BarcodeScanner
          onResult={async (barcode) => {
            setShowFabScanner(false);
            const existing = await getFoodByBarcode(barcode);
            if (existing) {
              setEditingFood(existing);
              setShowFoodEditor(true);
              return;
            }
            const result = await lookupBarcode(barcode);
            setEditingFood(result || { barcode });
            setShowFoodEditor(true);
          }}
          onClose={() => { setShowFabScanner(false); setFabMeal(null); }}
        />
      )}

      {/* Food editor modal */}
      {showFoodEditor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.6)",
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
      padding: "12px 14px", background: GLASS, borderRadius: 10, marginBottom: 4,
      border: `1px solid ${GLASS_BORDER}`,
      backdropFilter: "blur(16px)",
    }}>
      <div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff" }}>
          {food.name}
        </span>
        {food.brand && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>
            {food.brand}
          </span>
        )}
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
          {food.serving_size || food.serving_unit}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: SUN,
        }}>
          {food.calories} cal
        </span>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {food.protein}p · {food.carbs}c · {food.fat}f
        </div>
      </div>
    </div>
  );
}

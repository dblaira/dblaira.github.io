"use client";

import { useState, useCallback } from "react";
import type { Food, Meal } from "@/lib/nutrition-actions";
import {
  searchFoods, getRotationFoods, logFoodToMeal, removeMealEntry,
  lookupBarcode, createFood, getFoodByBarcode,
} from "@/lib/nutrition-actions";
import { FoodEditor } from "./FoodEditor";
import { BarcodeScanner } from "./BarcodeScanner";

const TEAL = "#14B8A6";
const CREAM = "#F5F0E8";
const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"];

interface MealLoggerProps {
  meals: Meal[];
  date: string;
  onUpdate: () => void;
}

export function MealLogger({ meals, date, onUpdate }: MealLoggerProps) {
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [rotationFoods, setRotationFoods] = useState<Food[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<Food> | undefined>();
  const [showScanner, setShowScanner] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [quantity, setQuantity] = useState("1");

  const loadRotation = useCallback(async () => {
    const foods = await getRotationFoods();
    setRotationFoods(foods);
  }, []);

  const handleOpenMeal = async (mealName: string) => {
    setActiveMeal(mealName);
    setSearchQuery("");
    setSearchResults([]);
    await loadRotation();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchFoods(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleLogFood = async (food: Food) => {
    if (!activeMeal) return;
    await logFoodToMeal(food.id, activeMeal, parseFloat(quantity) || 1, date);
    setQuantity("1");
    onUpdate();
  };

  const handleRemoveEntry = async (entryId: string) => {
    await removeMealEntry(entryId);
    onUpdate();
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setScanLoading(true);

    // Check local DB first
    const existing = await getFoodByBarcode(barcode);
    if (existing) {
      setEditingFood(existing);
      setShowEditor(true);
      setScanLoading(false);
      return;
    }

    // Look up online
    const result = await lookupBarcode(barcode);
    if (result) {
      setEditingFood(result);
      setShowEditor(true);
    } else {
      // Not found anywhere — manual entry with barcode pre-filled
      setEditingFood({ barcode });
      setShowEditor(true);
    }
    setScanLoading(false);
  };

  const handleSaveFood = async (food: Partial<Food>) => {
    const saved = await createFood(food);
    setShowEditor(false);
    setEditingFood(undefined);
    if (activeMeal) {
      await logFoodToMeal(saved.id, activeMeal, parseFloat(quantity) || 1, date);
      onUpdate();
    }
    await loadRotation();
  };

  const getMealEntries = (mealName: string) => {
    const meal = meals.find(m => m.name === mealName);
    return meal?.meal_entries || [];
  };

  return (
    <div>
      {/* Meal sections */}
      {MEAL_ORDER.map(mealName => {
        const entries = getMealEntries(mealName);
        const isActive = activeMeal === mealName;
        const mealCal = entries.reduce((sum, e) => sum + (e.foods?.calories || 0) * (e.quantity || 1), 0);

        return (
          <div key={mealName} style={{
            background: "#fff", borderRadius: 14, padding: 16,
            marginBottom: 10, border: "1px solid rgba(0,0,0,0.06)",
          }}>
            {/* Meal header */}
            <div
              onClick={() => isActive ? setActiveMeal(null) : handleOpenMeal(mealName)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer",
              }}
            >
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: 17,
                fontWeight: 400, color: "#1A1A1A",
              }}>
                {mealName}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {mealCal > 0 && (
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    fontWeight: 600, color: TEAL,
                  }}>
                    {Math.round(mealCal)} cal
                  </span>
                )}
                <span style={{ fontSize: 18, color: "rgba(0,0,0,0.2)" }}>
                  {isActive ? "−" : "+"}
                </span>
              </div>
            </div>

            {/* Logged entries */}
            {entries.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {entries.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderTop: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <div>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1A1A1A" }}>
                        {entry.foods?.name}
                      </span>
                      {entry.quantity !== 1 && (
                        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginLeft: 6 }}>
                          x{entry.quantity}
                        </span>
                      )}
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.35)",
                        marginLeft: 8,
                      }}>
                        {Math.round((entry.foods?.calories || 0) * (entry.quantity || 1))} cal
                        {" · "}
                        {Math.round((entry.foods?.protein || 0) * (entry.quantity || 1))}p
                      </span>
                    </div>
                    <button onClick={() => handleRemoveEntry(entry.id)} style={{
                      background: "none", border: "none", fontSize: 16,
                      color: "rgba(0,0,0,0.2)", cursor: "pointer", padding: "4px 8px",
                    }}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add food panel */}
            {isActive && (
              <div style={{ marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12 }}>
                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setShowScanner(true)} style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    border: `1px solid ${TEAL}`, background: "transparent",
                    color: TEAL, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Scan Barcode
                  </button>
                  <button onClick={() => { setEditingFood(undefined); setShowEditor(true); }} style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.1)", background: "transparent",
                    color: "#1A1A1A", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Create New
                  </button>
                </div>

                {/* Search */}
                <input
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search foods..."
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "2px solid rgba(0,0,0,0.08)", background: CREAM,
                    fontSize: 14, fontFamily: "'Inter', sans-serif",
                    outline: "none", color: "#1A1A1A", boxSizing: "border-box",
                    marginBottom: 8,
                  }}
                />

                {/* Quantity */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                    color: "rgba(0,0,0,0.4)", letterSpacing: "0.05em",
                  }}>
                    QTY:
                  </span>
                  <input
                    value={quantity} onChange={e => setQuantity(e.target.value)}
                    type="number" inputMode="decimal" min="0.25" step="0.25"
                    style={{
                      width: 60, padding: "8px", borderRadius: 8, textAlign: "center",
                      border: "2px solid rgba(0,0,0,0.08)", background: CREAM,
                      fontSize: 14, fontFamily: "'Inter', sans-serif",
                      outline: "none", color: "#1A1A1A",
                    }}
                  />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.3)" }}>
                    servings
                  </span>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {searchResults.map(food => (
                      <div
                        key={food.id}
                        onClick={() => handleLogFood(food)}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                          marginBottom: 2, background: food.rotation ? "rgba(20,184,166,0.05)" : "transparent",
                        }}
                      >
                        <div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A1A1A" }}>
                            {food.name}
                          </span>
                          {food.brand && (
                            <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginLeft: 6 }}>
                              {food.brand}
                            </span>
                          )}
                          {food.rotation && (
                            <span style={{
                              fontSize: 9, color: TEAL, marginLeft: 6, fontWeight: 700,
                              letterSpacing: "0.05em",
                            }}>
                              ROTATION
                            </span>
                          )}
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
                          {food.calories}cal · {food.protein}p
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rotation foods (when no search) */}
                {!searchQuery && rotationFoods.length > 0 && (
                  <div>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: TEAL, display: "block", marginBottom: 6,
                    }}>
                      Rotation Foods
                    </span>
                    <div style={{ maxHeight: 180, overflowY: "auto" }}>
                      {rotationFoods.map(food => (
                        <div
                          key={food.id}
                          onClick={() => handleLogFood(food)}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                            marginBottom: 2, background: "rgba(20,184,166,0.04)",
                          }}
                        >
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1A1A1A" }}>
                            {food.name}
                          </span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
                            {food.calories}cal · {food.protein}p
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scanLoading && (
                  <div style={{
                    textAlign: "center", padding: 20, fontFamily: "'Inter', sans-serif",
                    fontSize: 13, color: "rgba(0,0,0,0.5)",
                  }}>
                    Looking up barcode...
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Barcode scanner modal */}
      {showScanner && (
        <BarcodeScanner
          onResult={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Food editor modal */}
      {showEditor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{ width: "min(440px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <FoodEditor
              initial={editingFood}
              onSave={handleSaveFood}
              onCancel={() => { setShowEditor(false); setEditingFood(undefined); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

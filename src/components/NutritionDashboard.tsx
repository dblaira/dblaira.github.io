"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { MacroRings } from "@/components/nutrition/MacroRings";
import { MealLogger } from "@/components/nutrition/MealLogger";
import { MealHistory } from "@/components/nutrition/MealHistory";
import { FoodEditor } from "@/components/nutrition/FoodEditor";
import { BarcodeScanner } from "@/components/nutrition/BarcodeScanner";
import { MealTemplateEditor } from "@/components/nutrition/MealTemplateEditor";
import { EditModeProvider } from "@/lib/useEditMode";
import { EditColorSheet } from "@/components/EditColorSheet";
import { EditToast } from "@/components/EditToast";
import { usePageEditing } from "@/lib/usePageEditing";
import { Editable } from "@/components/Editable";
import { fillStyle } from "@/lib/fills";
import {
  getMealsForDate, getMacroGoals, calculateDayTotals,
  getRotationFoods, createFood, searchFoods,
  lookupBarcode, getFoodByBarcode, logFoodToMeal,
  getMealTemplates, createMealTemplate, deleteMealTemplate,
  logMealTemplate, calculateTemplateTotals,
} from "@/lib/nutrition-actions";
import type { Meal, MacroGoals, Food, MealTemplate } from "@/lib/nutrition-actions";

// Bold palette from Nutrition App
const SUN = "#F4D160";
const OCEAN = "#1D5D9B";
const CHARCOAL = "#2C2C2C";
const GLASS = "rgba(176,30,104,0.9)";
const GLASS_BORDER = "rgba(255,255,255,0.15)";
const ORANGE = "#F49D1A";
const GREEN = "#27AE60";

type Tab = "today" | "history" | "library";

export default function NutritionDashboard() {
  return (
    <EditModeProvider>
      <NutritionDashboardBody />
      <EditColorSheet />
      <EditToast />
    </EditModeProvider>
  );
}

function NutritionDashboardBody() {
  const { colorFor, fillFor, saveOverride } = usePageEditing("/nutrition");
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
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [m, g] = await Promise.all([getMealsForDate(date), getMacroGoals()]);
    setMeals(m);
    setGoals(g);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = calculateDayTotals(meals);

  const loadLibrary = useCallback(async () => {
    const [rotation, tmpl] = await Promise.all([getRotationFoods(), getMealTemplates()]);
    setRotationFoods(rotation);
    setTemplates(tmpl);
  }, []);

  useEffect(() => {
    if (tab === "library") loadLibrary();
  }, [tab, loadLibrary]);

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


  return (
    <div style={{ ...fillStyle(fillFor("canvas", SUN), SUN), minHeight: "100vh" }}>
      <SavySiteHeader />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        {/* Page title */}
        <Editable
          id="nutrition-title"
          label="Nutrition Title"
          description="The big 'Nutrition' headline at the top of the page."
          value={colorFor("nutrition-title", CHARCOAL)}
          onChange={(v) => saveOverride("nutrition-title", "Nutrition Title", v)}
          allowFills={false}
        >
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
            color: colorFor("nutrition-title", CHARCOAL), marginBottom: 4, marginTop: 8,
          }}>
            Nutrition
          </h1>
        </Editable>
        <Editable
          id="nutrition-subtitle"
          label="Nutrition Subtitle"
          description="The small 'EVERY OUNCE, EVERY MACRO' line under the title."
          value={colorFor("nutrition-subtitle", "rgba(44,44,44,0.5)")}
          onChange={(v) => saveOverride("nutrition-subtitle", "Nutrition Subtitle", v)}
          allowFills={false}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: colorFor("nutrition-subtitle", "rgba(44,44,44,0.5)"), marginBottom: 20, marginTop: 0,
          }}>
            Every ounce, every macro
          </p>
        </Editable>

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

            {/* Saved Meals */}
            {!librarySearch && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 18,
                    fontWeight: 700, color: CHARCOAL, margin: 0,
                  }}>
                    Saved Meals
                  </h3>
                  <button onClick={() => setShowTemplateEditor(true)} style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: OCEAN, color: "#fff",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    + New Meal
                  </button>
                </div>

                {templates.length > 0 ? templates.map(t => {
                  const totals = calculateTemplateTotals(t);
                  return (
                    <div key={t.id} style={{
                      background: GLASS, borderRadius: 12, padding: 14, marginBottom: 6,
                      border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(16px)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            {t.name}
                          </span>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                            {t.meal_template_items?.length || 0} items · {totals.calories} cal · {totals.protein}p
                          </div>
                        </div>
                        <button onClick={async () => { await deleteMealTemplate(t.id); await loadLibrary(); }} style={{
                          background: "none", border: "none", fontSize: 14,
                          color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px 8px",
                        }}>&times;</button>
                      </div>
                      {t.meal_template_items && t.meal_template_items.length > 0 && (
                        <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6 }}>
                          {t.meal_template_items.map(item => (
                            <div key={item.id} style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "2px 0" }}>
                              {item.foods?.name}{item.quantity !== 1 ? ` x${item.quantity}` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{
                    textAlign: "center", padding: 24,
                    background: GLASS, borderRadius: 14,
                    border: `1px solid ${GLASS_BORDER}`,
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    color: "rgba(255,255,255,0.5)", backdropFilter: "blur(16px)",
                  }}>
                    No saved meals yet. Create one to log entire meals with one tap.
                  </div>
                )}
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
                <button key={m} onClick={() => setFabMeal(m)} style={{
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

      {/* FAB action picker — Scan Item or Log Saved Meal */}
      {fabMeal && fabMeal !== "pick" && !showFabScanner && !showTemplatePicker && (
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
              Add to {fabMeal}
            </span>
            <button onClick={() => setShowFabScanner(true)} style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: OCEAN, color: "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: "pointer", marginBottom: 6,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M1 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M23 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"/>
                <line x1="7" y1="12" x2="17" y2="12"/>
              </svg>
              Scan Item
            </button>
            <button onClick={async () => {
              const tmpl = await getMealTemplates();
              setTemplates(tmpl);
              setShowTemplatePicker(true);
            }} style={{
              width: "100%", padding: "14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
              color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}>
              Log Saved Meal
            </button>
          </div>
        </div>
      )}

      {/* Template picker from FAB */}
      {showTemplatePicker && fabMeal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1600,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 16px 100px",
        }}
          onClick={() => { setShowTemplatePicker(false); setFabMeal(null); }}
        >
          <div style={{
            background: GLASS, borderRadius: 16, padding: 16, width: "100%", maxWidth: 400,
            maxHeight: "60vh", overflowY: "auto",
            border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(24px)",
          }}
            onClick={e => e.stopPropagation()}
          >
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 12,
            }}>
              Pick a saved meal for {fabMeal}
            </span>
            {templates.length > 0 ? templates.map(t => {
              const totals = calculateTemplateTotals(t);
              return (
                <button key={t.id} onClick={async () => {
                  await logMealTemplate(t.id, fabMeal!, date);
                  setShowTemplatePicker(false);
                  setFabMeal(null);
                  await loadData();
                }} style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                  color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", marginBottom: 6, textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div>{t.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {t.meal_template_items?.length || 0} items
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#F4D160", fontWeight: 700 }}>
                    {totals.calories} cal
                  </span>
                </button>
              );
            }) : (
              <div style={{
                textAlign: "center", padding: 20, fontFamily: "'Inter', sans-serif",
                fontSize: 13, color: "rgba(255,255,255,0.4)",
              }}>
                No saved meals yet. Create one in the Library tab.
              </div>
            )}
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

      {/* Meal template editor modal */}
      {showTemplateEditor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{ width: "min(440px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <MealTemplateEditor
              onSave={async (templateName, items) => {
                await createMealTemplate(templateName, items);
                setShowTemplateEditor(false);
                await loadLibrary();
              }}
              onCancel={() => setShowTemplateEditor(false)}
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

"use client";

import { useState } from "react";
import type { Food } from "@/lib/nutrition-actions";
import { searchFoods, getRotationFoods } from "@/lib/nutrition-actions";

const OCEAN = "#1D5D9B";
const CHARCOAL = "#2C2C2C";
const GLASS = "rgba(44,44,44,0.92)";
const GLASS_BORDER = "rgba(255,255,255,0.1)";
const ORANGE = "#F49D1A";
const SUN_LIGHT = "#F4D160";

interface TemplateItem {
  food: Food;
  quantity: number;
}

interface MealTemplateEditorProps {
  onSave: (name: string, items: { food_id: string; quantity: number }[]) => void;
  onCancel: () => void;
}

export function MealTemplateEditor({ onSave, onCancel }: MealTemplateEditorProps) {
  const [name, setName] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [rotationFoods, setRotationFoods] = useState<Food[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setSearchResults(await searchFoods(query));
    } else {
      setSearchResults([]);
      if (!query) {
        const rotation = await getRotationFoods();
        setRotationFoods(rotation);
      }
    }
  };

  const addItem = (food: Food) => {
    // Don't add duplicates
    if (items.some(i => i.food.id === food.id)) return;
    setItems([...items, { food, quantity: 1 }]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const updateQuantity = (index: number, qty: string) => {
    const updated = [...items];
    updated[index].quantity = parseFloat(qty) || 1;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCal = items.reduce((sum, i) => sum + i.food.calories * i.quantity, 0);
  const totalProtein = items.reduce((sum, i) => sum + i.food.protein * i.quantity, 0);
  const canSave = name && items.length > 0;

  const handleSave = () => {
    onSave(name, items.map(i => ({ food_id: i.food.id, quantity: i.quantity })));
  };

  const openSearch = async () => {
    setShowSearch(true);
    setSearchQuery("");
    setSearchResults([]);
    const rotation = await getRotationFoods();
    setRotationFoods(rotation);
  };

  return (
    <div style={{
      background: GLASS, borderRadius: 16, padding: 20,
      border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(24px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
          New Saved Meal
        </h3>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 20, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>&times;</button>
      </div>

      {/* Meal name */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)", marginBottom: 4, display: "block",
        }}>
          Meal Name *
        </label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder='e.g. "Eggs" or "Protein Shake"'
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10,
            border: `1px solid ${GLASS_BORDER}`, background: "rgba(255,255,255,0.05)",
            fontSize: 15, fontFamily: "'Inter', sans-serif", color: "#fff",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8,
          }}>
            Items ({items.length})
          </span>
          {items.map((item, i) => (
            <div key={item.food.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#fff" }}>
                  {item.food.name}
                </span>
                {item.food.brand && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>
                    {item.food.brand}
                  </span>
                )}
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  {Math.round(item.food.calories * item.quantity)} cal · {Math.round(item.food.protein * item.quantity)}p
                </div>
              </div>
              <input
                value={item.quantity} onChange={e => updateQuantity(i, e.target.value)}
                type="number" inputMode="decimal" min="0.25" step="0.25"
                style={{
                  width: 50, padding: "6px", borderRadius: 6, textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                  fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#fff", outline: "none",
                }}
              />
              <button onClick={() => removeItem(i)} style={{
                background: "none", border: "none", fontSize: 16,
                color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px",
              }}>&times;</button>
            </div>
          ))}
          {/* Totals */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4,
            display: "flex", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
              Total
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: SUN_LIGHT }}>
              {Math.round(totalCal)} cal · {Math.round(totalProtein)}p
            </span>
          </div>
        </div>
      )}

      {/* Add item button / search */}
      {!showSearch ? (
        <button onClick={openSearch} style={{
          width: "100%", padding: "12px", borderRadius: 10,
          border: "1px dashed rgba(255,255,255,0.15)", background: "transparent",
          color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Inter', sans-serif", marginBottom: 16,
        }}>
          + Add Food Item
        </button>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <input
            value={searchQuery} onChange={e => handleSearch(e.target.value)}
            placeholder="Search your foods..."
            autoFocus
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              fontSize: 14, fontFamily: "'Inter', sans-serif",
              outline: "none", color: "#fff", boxSizing: "border-box", marginBottom: 6,
            }}
          />

          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {/* Search results */}
            {searchResults.map(food => (
              <div key={food.id} onClick={() => addItem(food)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                background: items.some(i => i.food.id === food.id) ? "rgba(255,255,255,0.05)" : "transparent",
                opacity: items.some(i => i.food.id === food.id) ? 0.4 : 1,
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#fff" }}>
                  {food.name}
                  {food.brand && <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 6, fontSize: 11 }}>{food.brand}</span>}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {food.calories}cal · {food.protein}p
                </span>
              </div>
            ))}

            {/* Rotation foods when no search */}
            {!searchQuery && rotationFoods.length > 0 && (
              <>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: ORANGE, display: "block", margin: "8px 0 4px",
                }}>
                  Rotation Foods
                </span>
                {rotationFoods.map(food => (
                  <div key={food.id} onClick={() => addItem(food)} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                    background: "rgba(244,161,26,0.06)",
                    opacity: items.some(i => i.food.id === food.id) ? 0.4 : 1,
                  }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#fff" }}>{food.name}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {food.calories}cal · {food.protein}p
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          <button onClick={() => setShowSearch(false)} style={{
            width: "100%", padding: "8px", borderRadius: 8, border: "none",
            background: "transparent", color: "rgba(255,255,255,0.3)",
            fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: 4,
          }}>
            Done adding
          </button>
        </div>
      )}

      {/* Save / Cancel */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)",
          background: "transparent", fontFamily: "'Inter', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff",
        }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={!canSave} style={{
          flex: 2, padding: "14px", borderRadius: 12, border: "none",
          background: canSave ? OCEAN : "rgba(255,255,255,0.08)",
          color: canSave ? "#fff" : "rgba(255,255,255,0.3)",
          fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
          cursor: canSave ? "pointer" : "not-allowed",
        }}>
          Save Meal
        </button>
      </div>
    </div>
  );
}

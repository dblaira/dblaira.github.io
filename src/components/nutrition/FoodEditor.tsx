"use client";

import { useState } from "react";
import type { Food } from "@/lib/nutrition-actions";

const CREAM = "#F5F0E8";
const TEAL = "#14B8A6";

interface FoodEditorProps {
  initial?: Partial<Food>;
  onSave: (food: Partial<Food>) => void;
  onCancel: () => void;
}

export function FoodEditor({ initial, onSave, onCancel }: FoodEditorProps) {
  const [name, setName] = useState(initial?.name || "");
  const [brand, setBrand] = useState(initial?.brand || "");
  const [calories, setCalories] = useState(initial?.calories?.toString() || "");
  const [protein, setProtein] = useState(initial?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(initial?.carbs?.toString() || "");
  const [fat, setFat] = useState(initial?.fat?.toString() || "");
  const [fiber, setFiber] = useState(initial?.fiber?.toString() || "0");
  const [servingSize, setServingSize] = useState(initial?.serving_size || "");
  const [servingUnit, setServingUnit] = useState(initial?.serving_unit || "serving");
  const [barcode, setBarcode] = useState(initial?.barcode || "");
  const [rotation, setRotation] = useState(initial?.rotation || false);

  const canSave = name && calories;

  const handleSave = () => {
    onSave({
      ...initial,
      name,
      brand: brand || null,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      serving_size: servingSize || null,
      serving_unit: servingUnit,
      barcode: barcode || null,
      rotation,
      external_source: initial?.external_source || "manual",
    });
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "2px solid rgba(0,0,0,0.08)", background: CREAM,
    fontSize: 15, fontFamily: "'Inter', sans-serif", color: "#1A1A1A",
    outline: "none",
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600 as const,
    letterSpacing: "0.08em", textTransform: "uppercase" as const,
    color: "rgba(0,0,0,0.45)", marginBottom: 4, display: "block",
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 20,
      border: "1px solid rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{
          margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 400, color: "#1A1A1A",
        }}>
          {initial?.id ? "Edit Food" : "New Food"}
        </h3>
        <button onClick={onCancel} style={{
          background: "none", border: "none", fontSize: 20, color: "rgba(0,0,0,0.3)", cursor: "pointer",
        }}>
          &times;
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Egg Whites" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Brand</label>
          <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Optional" style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Serving Size</label>
            <input value={servingSize} onChange={e => setServingSize(e.target.value)} placeholder="e.g. 46g" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Serving Unit</label>
            <input value={servingUnit} onChange={e => setServingUnit(e.target.value)} placeholder="e.g. cup" style={inputStyle} />
          </div>
        </div>

        <div style={{
          padding: 14, background: "rgba(20,184,166,0.05)", borderRadius: 12,
          border: "1px solid rgba(20,184,166,0.15)",
        }}>
          <span style={{ ...labelStyle, color: TEAL, marginBottom: 10 }}>Macros per Serving</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Calories *</label>
              <input value={calories} onChange={e => setCalories(e.target.value)}
                type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Protein (g)</label>
              <input value={protein} onChange={e => setProtein(e.target.value)}
                type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Carbs (g)</label>
              <input value={carbs} onChange={e => setCarbs(e.target.value)}
                type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Fat (g)</label>
              <input value={fat} onChange={e => setFat(e.target.value)}
                type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Fiber (g)</label>
              <input value={fiber} onChange={e => setFiber(e.target.value)}
                type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 9 }}>Barcode</label>
              <input value={barcode} onChange={e => setBarcode(e.target.value)}
                placeholder="Optional" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14 }} />
            </div>
          </div>
        </div>

        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          padding: "10px 14px", borderRadius: 10, background: rotation ? "rgba(20,184,166,0.08)" : "transparent",
          border: `1px solid ${rotation ? "rgba(20,184,166,0.3)" : "rgba(0,0,0,0.06)"}`,
        }}>
          <input type="checkbox" checked={rotation} onChange={e => setRotation(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: TEAL }} />
          <div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>
              Rotation Food
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.4)", display: "block" }}>
              Superfoods you eat regularly — shown first when logging
            </span>
          </div>
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)",
            background: "transparent", fontFamily: "'Inter', sans-serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#1A1A1A",
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave} style={{
            flex: 2, padding: "14px", borderRadius: 12, border: "none",
            background: canSave ? TEAL : "rgba(0,0,0,0.08)",
            color: canSave ? "#fff" : "rgba(0,0,0,0.3)",
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, cursor: canSave ? "pointer" : "not-allowed",
          }}>
          {initial?.id ? "Update Food" : "Save to Library"}
          </button>
        </div>
      </div>
    </div>
  );
}

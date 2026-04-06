"use client";

import { useState } from "react";
import type { Food } from "@/lib/nutrition-actions";

const SUN = "#FFE15D";
const OCEAN = "#1D5D9B";
const CHARCOAL = "#2C2C2C";
const GLASS = "rgba(44,44,44,0.92)";
const GLASS_BORDER = "rgba(255,255,255,0.1)";
const ORANGE = "#F49D1A";

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
      ...initial, name, brand: brand || null,
      calories: parseFloat(calories) || 0, protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0, fat: parseFloat(fat) || 0, fiber: parseFloat(fiber) || 0,
      serving_size: servingSize || null, serving_unit: servingUnit,
      barcode: barcode || null, rotation, external_source: initial?.external_source || "manual",
    });
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1px solid ${GLASS_BORDER}`, background: "rgba(255,255,255,0.05)",
    fontSize: 15, fontFamily: "'Inter', sans-serif", color: "#fff", outline: "none",
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700 as const,
    letterSpacing: "0.08em", textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.45)", marginBottom: 4, display: "block",
  };

  return (
    <div style={{ background: GLASS, borderRadius: 16, padding: 20, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(24px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
          {initial?.id ? "Edit Food" : "New Food"}
        </h3>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 20, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>&times;</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><label style={labelStyle}>Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Egg Whites" style={inputStyle} /></div>
        <div><label style={labelStyle}>Brand</label><input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Optional" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Serving Size</label><input value={servingSize} onChange={e => setServingSize(e.target.value)} placeholder="e.g. 46g" style={inputStyle} /></div>
          <div><label style={labelStyle}>Serving Unit</label><input value={servingUnit} onChange={e => setServingUnit(e.target.value)} placeholder="e.g. cup" style={inputStyle} /></div>
        </div>
        <div style={{ padding: 14, background: "rgba(29,93,155,0.15)", borderRadius: 12, border: "1px solid rgba(29,93,155,0.3)" }}>
          <span style={{ ...labelStyle, color: OCEAN, marginBottom: 10 }}>Macros per Serving</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            {[
              { label: "Calories *", value: calories, set: setCalories },
              { label: "Protein (g)", value: protein, set: setProtein },
              { label: "Carbs (g)", value: carbs, set: setCarbs },
              { label: "Fat (g)", value: fat, set: setFat },
            ].map(f => (
              <div key={f.label}><label style={{ ...labelStyle, fontSize: 9 }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} type="number" inputMode="decimal" placeholder="0"
                  style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} /></div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div><label style={{ ...labelStyle, fontSize: 9 }}>Fiber (g)</label><input value={fiber} onChange={e => setFiber(e.target.value)} type="number" inputMode="decimal" placeholder="0" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14, textAlign: "center" }} /></div>
            <div><label style={{ ...labelStyle, fontSize: 9 }}>Barcode</label><input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Optional" style={{ ...inputStyle, padding: "10px 8px", fontSize: 14 }} /></div>
          </div>
        </div>
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10,
          background: rotation ? "rgba(244,161,26,0.1)" : "transparent", border: `1px solid ${rotation ? "rgba(244,161,26,0.3)" : GLASS_BORDER}`,
        }}>
          <input type="checkbox" checked={rotation} onChange={e => setRotation(e.target.checked)} style={{ width: 18, height: 18, accentColor: ORANGE }} />
          <div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>Rotation Food</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block" }}>Superfoods you eat regularly — shown first when logging</span>
          </div>
        </label>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff" }}>Cancel</button>
          <button onClick={handleSave} disabled={!canSave} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: canSave ? OCEAN : "rgba(255,255,255,0.08)", color: canSave ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, cursor: canSave ? "pointer" : "not-allowed" }}>
            {initial?.id ? "Update Food" : "Save to Library"}
          </button>
        </div>
      </div>
    </div>
  );
}

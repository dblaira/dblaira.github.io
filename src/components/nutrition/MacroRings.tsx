"use client";

const CHARCOAL = "#2C2C2C";
const OCEAN = "#1D5D9B";
const OCEAN_LIGHT = "#75C2F6";
const ORANGE = "#F49D1A";
const GREEN = "#27AE60";
const MAGENTA = "#EC4899";
const SUN = "#FFE15D";
const RED = "#DC3535";

interface MacroRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
}

function MacroRing({ label, current, goal, unit, color, size = 100 }: MacroRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / goal, 1.5);
  const progress = pct * circumference;
  const overGoal = current > goal;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={overGoal ? RED : color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={`${Math.min(progress, circumference)} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: size * 0.28, fontWeight: 700, color: "#fff", lineHeight: 1,
          }}>
            {Math.round(current)}
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 500,
            letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginTop: 2,
          }}>
            {unit}
          </span>
        </div>
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)",
      }}>
        / {goal}{unit === "kcal" ? "" : "g"}
      </span>
    </div>
  );
}

interface MacroRingsProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number };
}

export function MacroRings({ calories, protein, carbs, fat, goals }: MacroRingsProps) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "flex-start",
      padding: "16px 0", gap: 8,
    }}>
      <MacroRing label="Calories" current={calories} goal={goals.calorie_goal} unit="kcal" color={SUN} size={110} />
      <MacroRing label="Protein" current={protein} goal={goals.protein_goal} unit="g" color={OCEAN_LIGHT} />
      <MacroRing label="Carbs" current={carbs} goal={goals.carbs_goal} unit="g" color={ORANGE} />
      <MacroRing label="Fat" current={fat} goal={goals.fat_goal} unit="g" color={MAGENTA} />
    </div>
  );
}

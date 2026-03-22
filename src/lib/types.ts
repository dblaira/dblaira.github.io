export interface InboxItemRow {
  id: string;
  text: string;
  created_at: string;
  processed: boolean;
  processed_at: string | null;
  destination: string | null;
}

export interface InboxItemDisplay {
  id: string;
  text: string;
  created_at: string;
  date: string;
  age: string;
  stale: boolean;
}

// --- Ontology & Correlation types (ported from Understood.app) ---

export interface CorrelationPair {
  categoryA: string;
  categoryB: string;
  coefficient: number;
  lag: number;
  type: "co-movement" | "inverse" | "leading";
}

export interface CategoryStats {
  category: string;
  mean: number;
  stdDev: number;
  weeksWithData: number;
  totalCount: number;
  coveragePercent: number;
}

export interface CorrelationAnalysis {
  id: string;
  user_id: string;
  created_at: string;
  date_range_start: string;
  date_range_end: string;
  total_weeks: number;
  total_extractions: number;
  correlations: CorrelationPair[];
  category_stats: CategoryStats[];
}

// --- Entry types (shared with Understood.app) ---

export type EntryType = "story" | "action" | "note" | "connection";
export type ConnectionType =
  | "identity_anchor"
  | "pattern_interrupt"
  | "validated_principle"
  | "process_anchor";

export interface BeliefEntry {
  id: string;
  headline: string;
  content: string;
  entry_type: EntryType;
  connection_type: ConnectionType | null;
  pinned_at: string | null;
  created_at: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  affect: "#8B5CF6",
  ambition: "#3B82F6",
  belief: "#7C3AED",
  exercise: "#10B981",
  health: "#F43F5E",
  insight: "#F59E0B",
  nutrition: "#14B8A6",
  purchase: "#EC4899",
  sleep: "#6366F1",
  social: "#F97316",
  work: "#0EA5E9",
  entertainment: "#D946EF",
  learning: "#06B6D4",
};

const FALLBACK_COLORS = [
  "#64748B", "#A855F7", "#06B6D4", "#84CC16",
  "#E11D48", "#0D9488", "#D946EF", "#EA580C",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getCategoryColor(category: string): string {
  const lower = category.toLowerCase();
  if (CATEGORY_COLORS[lower]) return CATEGORY_COLORS[lower];
  const idx = Math.abs(hashCode(lower)) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[idx];
}

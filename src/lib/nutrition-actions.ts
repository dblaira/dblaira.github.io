import { getSupabase } from "./supabase";

// --- Types ---

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  caffeine_mg: number | null;
  serving_size: string | null;
  serving_unit: string;
  barcode: string | null;
  rotation: boolean;
  is_recipe: boolean;
  external_source: string | null;
  created_at: string;
}

export interface MealEntry {
  id: string;
  meal_id: string;
  food_id: string;
  quantity: number;
  logged_at: string;
  foods: Food;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string;
  name: string;
  created_at: string;
  meal_entries: MealEntry[];
}

export interface MacroGoals {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// --- Food CRUD ---

export async function searchFoods(query: string): Promise<Food[]> {
  if (!query || query.length < 2) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("rotation", { ascending: false })
    .limit(20);
  return (data as Food[]) || [];
}

export async function getRotationFoods(): Promise<Food[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("rotation", true)
    .order("name");
  return (data as Food[]) || [];
}

export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", barcode)
    .single();
  return data as Food | null;
}

export async function createFood(food: Partial<Food>): Promise<Food> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("foods")
    .insert({
      created_by: user.id,
      name: food.name,
      brand: food.brand || null,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      caffeine_mg: food.caffeine_mg || null,
      serving_size: food.serving_size || null,
      serving_unit: food.serving_unit || "serving",
      barcode: food.barcode || null,
      rotation: food.rotation || false,
      is_recipe: food.is_recipe || false,
      external_source: food.external_source || "manual",
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create food: ${error.message}`);
  return data as Food;
}

export async function updateFood(id: string, updates: Partial<Food>): Promise<Food> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("foods")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update food: ${error.message}`);
  return data as Food;
}

export async function deleteFood(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("foods").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete food: ${error.message}`);
}

// --- Meal Logging ---

export async function logFoodToMeal(
  foodId: string,
  mealName: string,
  quantity: number = 1,
  date?: string
): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const targetDate = date || new Date().toISOString().split("T")[0];

  // Get or create meal slot
  let { data: meal } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", targetDate)
    .eq("name", mealName)
    .single();

  if (!meal) {
    const { data: newMeal, error } = await supabase
      .from("meals")
      .insert({ user_id: user.id, date: targetDate, name: mealName })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create meal slot: ${error.message}`);
    meal = newMeal;
  }

  // Add food entry
  const { error: entryError } = await supabase
    .from("meal_entries")
    .insert({
      meal_id: meal!.id,
      food_id: foodId,
      quantity,
      logged_at: new Date().toISOString(),
    });

  if (entryError) throw new Error(`Failed to log food: ${entryError.message}`);
}

export async function removeMealEntry(entryId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("meal_entries").delete().eq("id", entryId);
  if (error) throw new Error(`Failed to remove entry: ${error.message}`);
}

// --- Fetching Meals ---

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("meals")
    .select(`
      id, user_id, date, name, created_at,
      meal_entries (
        id, meal_id, food_id, quantity, logged_at,
        foods (*)
      )
    `)
    .eq("user_id", user.id)
    .eq("date", date)
    .order("created_at");

  return (data as unknown as Meal[]) || [];
}

export async function getMealHistory(days: number = 30): Promise<Meal[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("meals")
    .select(`
      id, user_id, date, name, created_at,
      meal_entries (
        id, meal_id, food_id, quantity, logged_at,
        foods (*)
      )
    `)
    .eq("user_id", user.id)
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: false })
    .order("created_at");

  return (data as unknown as Meal[]) || [];
}

// --- Re-log a past meal ---

export async function relogMeal(sourceMealId: string, targetDate?: string): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch source meal with entries
  const { data: sourceMeal } = await supabase
    .from("meals")
    .select(`name, meal_entries ( food_id, quantity )`)
    .eq("id", sourceMealId)
    .single();

  if (!sourceMeal) throw new Error("Source meal not found");

  const date = targetDate || new Date().toISOString().split("T")[0];

  // Create new meal slot
  let { data: meal } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .eq("name", sourceMeal.name)
    .single();

  if (!meal) {
    const { data: newMeal, error } = await supabase
      .from("meals")
      .insert({ user_id: user.id, date, name: sourceMeal.name })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create meal slot: ${error.message}`);
    meal = newMeal;
  }

  // Copy all entries
  const entries = (sourceMeal.meal_entries as any[]).map((e: any) => ({
    meal_id: meal!.id,
    food_id: e.food_id,
    quantity: e.quantity,
    logged_at: new Date().toISOString(),
  }));

  if (entries.length > 0) {
    const { error } = await supabase.from("meal_entries").insert(entries);
    if (error) throw new Error(`Failed to copy entries: ${error.message}`);
  }
}

// --- Goals & Totals ---

export async function getMacroGoals(): Promise<MacroGoals> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { calorie_goal: 2400, protein_goal: 150, carbs_goal: 250, fat_goal: 80 };

  const { data } = await supabase
    .from("profiles")
    .select("calorie_goal, protein_goal, carbs_goal, fat_goal")
    .eq("id", user.id)
    .single();

  return (data as MacroGoals) || { calorie_goal: 2400, protein_goal: 150, carbs_goal: 250, fat_goal: 80 };
}

export function calculateDayTotals(meals: Meal[]): DayTotals {
  const totals: DayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  for (const meal of meals) {
    for (const entry of meal.meal_entries || []) {
      const food = entry.foods;
      if (!food) continue;
      const q = entry.quantity || 1;
      totals.calories += food.calories * q;
      totals.protein += food.protein * q;
      totals.carbs += food.carbs * q;
      totals.fat += food.fat * q;
      totals.fiber += (food.fiber || 0) * q;
    }
  }

  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;

  return totals;
}

// --- Meal Templates ---

export interface MealTemplateItem {
  id: string;
  template_id: string;
  food_id: string;
  quantity: number;
  foods: Food;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  meal_template_items: MealTemplateItem[];
}

export async function getMealTemplates(): Promise<MealTemplate[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("meal_templates")
    .select(`
      id, user_id, name, created_at, updated_at,
      meal_template_items (
        id, template_id, food_id, quantity,
        foods (*)
      )
    `)
    .eq("user_id", user.id)
    .order("name");

  return (data as unknown as MealTemplate[]) || [];
}

export async function createMealTemplate(
  name: string,
  items: { food_id: string; quantity: number }[]
): Promise<MealTemplate> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: template, error } = await supabase
    .from("meal_templates")
    .insert({ user_id: user.id, name })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create template: ${error.message}`);

  if (items.length > 0) {
    const rows = items.map(i => ({
      template_id: template.id,
      food_id: i.food_id,
      quantity: i.quantity,
    }));
    const { error: itemError } = await supabase
      .from("meal_template_items")
      .insert(rows);
    if (itemError) throw new Error(`Failed to add template items: ${itemError.message}`);
  }

  return template as MealTemplate;
}

export async function deleteMealTemplate(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("meal_templates").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete template: ${error.message}`);
}

export async function logMealTemplate(
  templateId: string,
  mealName: string,
  date?: string
): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch template items
  const { data: items } = await supabase
    .from("meal_template_items")
    .select("food_id, quantity")
    .eq("template_id", templateId);

  if (!items || items.length === 0) return;

  const targetDate = date || new Date().toISOString().split("T")[0];

  // Get or create meal slot
  let { data: meal } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", targetDate)
    .eq("name", mealName)
    .single();

  if (!meal) {
    const { data: newMeal, error } = await supabase
      .from("meals")
      .insert({ user_id: user.id, date: targetDate, name: mealName })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create meal slot: ${error.message}`);
    meal = newMeal;
  }

  // Log all items
  const entries = items.map(i => ({
    meal_id: meal!.id,
    food_id: i.food_id,
    quantity: i.quantity,
    logged_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("meal_entries").insert(entries);
  if (error) throw new Error(`Failed to log template: ${error.message}`);
}

export function calculateTemplateTotals(template: MealTemplate): DayTotals {
  const totals: DayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const item of template.meal_template_items || []) {
    const food = item.foods;
    if (!food) continue;
    const q = item.quantity || 1;
    totals.calories += food.calories * q;
    totals.protein += food.protein * q;
    totals.carbs += food.carbs * q;
    totals.fat += food.fat * q;
    totals.fiber += (food.fiber || 0) * q;
  }
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;
  return totals;
}

// --- Barcode Lookup (via Open Food Facts) ---

export async function lookupBarcode(barcode: string): Promise<Partial<Food> | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}`,
      { headers: { "User-Agent": "MaterialHealth/1.0" } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};
    const servingSize = p.serving_size || p.quantity || "100g";

    return {
      name: p.product_name || p.product_name_en || "Unknown Product",
      brand: p.brands || null,
      calories: Math.round(n["energy-kcal_serving"] || n["energy-kcal_100g"] || 0),
      protein: Math.round((n.proteins_serving || n.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((n.carbohydrates_serving || n.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((n.fat_serving || n.fat_100g || 0) * 10) / 10,
      fiber: Math.round((n.fiber_serving || n.fiber_100g || 0) * 10) / 10,
      serving_size: servingSize,
      barcode,
      external_source: "open_food_facts",
    };
  } catch {
    return null;
  }
}

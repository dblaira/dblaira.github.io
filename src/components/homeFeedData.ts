import {
  calculateDayTotals,
  type Food,
  type MacroGoals,
  type Meal,
} from "../lib/nutrition-actions";

export type HomeFeedTile = {
  variant: "generic" | "macro-summary" | "meal" | "rotation-food";
  label: string;
  title: string;
  text?: string;
  href?: string;
  size: "tall" | "medium" | "short";
  background: string;
  foreground?: string;
  meta: string;
  graphic: "bars" | "grid" | "stack" | "circles" | "none";
  macroStats?: {
    calories: number;
    calorieGoal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealStats?: {
    calories: number;
    protein: number;
    itemCount: number;
    foods: string[];
  };
  foodStats?: {
    calories: number;
    protein: number;
    serving: string;
    brand?: string | null;
  };
};

const MEAL_STYLES: Record<string, Pick<HomeFeedTile, "background" | "foreground">> = {
  Breakfast: {
    background: "linear-gradient(180deg, #b01e68 0%, #db4fa1 100%)",
    foreground: "#ffffff",
  },
  Lunch: {
    background: "linear-gradient(180deg, #1d5d9b 0%, #4d8ed0 100%)",
    foreground: "#ffffff",
  },
  Dinner: {
    background: "linear-gradient(180deg, #f49d1a 0%, #ffd166 100%)",
    foreground: "#111111",
  },
  Snack: {
    background: "linear-gradient(180deg, #dc3535 0%, #ff6b6b 100%)",
    foreground: "#ffffff",
  },
};

const ROTATION_BACKGROUNDS = [
  "linear-gradient(180deg, #fff2c7 0%, #ffc655 100%)",
  "linear-gradient(180deg, #dceeff 0%, #9fc8ff 100%)",
  "linear-gradient(180deg, #e3d6ff 0%, #b396ff 100%)",
  "linear-gradient(180deg, #dbffe1 0%, #7be5a5 100%)",
];

function formatMealText(foods: string[]) {
  if (foods.length === 0) return "No foods logged yet.";
  if (foods.length === 1) return foods[0];
  if (foods.length === 2) return `${foods[0]} + ${foods[1]}`;
  return `${foods[0]} + ${foods.length - 1} more`;
}

export function buildNutritionTiles({
  meals,
  goals,
  rotationFoods,
}: {
  meals: Meal[];
  goals: MacroGoals;
  rotationFoods: Food[];
}): HomeFeedTile[] {
  const totals = calculateDayTotals(meals);

  const macroTile: HomeFeedTile = {
    variant: "macro-summary",
    label: "Nutrition",
    title: `${totals.calories}`,
    text: `${Math.round(totals.protein)}p · ${Math.round(totals.carbs)}c · ${Math.round(totals.fat)}f`,
    href: "/nutrition",
    size: "tall",
    background: "linear-gradient(180deg, #1c1c1c 0%, #3a3a3a 100%)",
    foreground: "#ffffff",
    meta: `${goals.calorie_goal} kcal goal`,
    graphic: "none",
    macroStats: {
      calories: totals.calories,
      calorieGoal: goals.calorie_goal,
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    },
  };

  const mealTiles: HomeFeedTile[] = meals
    .filter((meal) => meal.meal_entries && meal.meal_entries.length > 0)
    .slice(0, 3)
    .map((meal) => {
      const calories = meal.meal_entries.reduce(
        (sum, entry) => sum + (entry.foods?.calories || 0) * (entry.quantity || 1),
        0
      );
      const protein = meal.meal_entries.reduce(
        (sum, entry) => sum + (entry.foods?.protein || 0) * (entry.quantity || 1),
        0
      );
      const foods = meal.meal_entries
        .map((entry) => entry.foods?.name)
        .filter((name): name is string => Boolean(name))
        .slice(0, 3);
      const style = MEAL_STYLES[meal.name] ?? {
        background: "linear-gradient(180deg, #2f2f2f 0%, #505050 100%)",
        foreground: "#ffffff",
      };

      return {
        variant: "meal",
        label: meal.name,
        title: meal.name,
        text: formatMealText(foods),
        href: "/nutrition",
        size: "medium",
        background: style.background,
        foreground: style.foreground,
        meta: `${Math.round(calories)} cal`,
        graphic: "stack",
        mealStats: {
          calories: Math.round(calories),
          protein: Math.round(protein),
          itemCount: meal.meal_entries.length,
          foods,
        },
      } satisfies HomeFeedTile;
    });

  const rotationTiles: HomeFeedTile[] = rotationFoods.slice(0, 3).map((food, index) => ({
    variant: "rotation-food",
    label: "Rotation Food",
    title: food.name,
    text: `${food.calories} cal · ${food.protein}p`,
    href: "/nutrition",
    size: index === 0 ? "medium" : "short",
    background: ROTATION_BACKGROUNDS[index % ROTATION_BACKGROUNDS.length],
    foreground: "#111111",
    meta: food.brand || "Superfood",
    graphic: "grid",
    foodStats: {
      calories: food.calories,
      protein: food.protein,
      serving: food.serving_size || food.serving_unit,
      brand: food.brand,
    },
  }));

  return [macroTile, ...mealTiles, ...rotationTiles];
}

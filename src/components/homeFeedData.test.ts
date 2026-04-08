import { describe, expect, it } from "vitest";
import type { Food, MacroGoals, Meal } from "../lib/nutrition-actions";
import { buildNutritionTiles } from "./homeFeedData";

const goals: MacroGoals = {
  calorie_goal: 2400,
  protein_goal: 180,
  carbs_goal: 250,
  fat_goal: 80,
};

const foods: Food[] = [
  {
    id: "food-1",
    name: "Greek Yogurt",
    brand: "Fage",
    calories: 140,
    protein: 20,
    carbs: 6,
    fat: 4,
    fiber: 0,
    caffeine_mg: null,
    serving_size: "1 cup",
    serving_unit: "cup",
    barcode: null,
    rotation: true,
    is_recipe: false,
    external_source: null,
    created_at: "2026-04-08T00:00:00.000Z",
  },
  {
    id: "food-2",
    name: "Blueberries",
    brand: null,
    calories: 84,
    protein: 1,
    carbs: 21,
    fat: 0,
    fiber: 4,
    caffeine_mg: null,
    serving_size: "1 cup",
    serving_unit: "cup",
    barcode: null,
    rotation: true,
    is_recipe: false,
    external_source: null,
    created_at: "2026-04-08T00:00:00.000Z",
  },
];

const meals: Meal[] = [
  {
    id: "meal-1",
    user_id: "user-1",
    date: "2026-04-08",
    name: "Breakfast",
    created_at: "2026-04-08T08:00:00.000Z",
    meal_entries: [
      {
        id: "entry-1",
        meal_id: "meal-1",
        food_id: "food-1",
        quantity: 1,
        logged_at: "2026-04-08T08:00:00.000Z",
        foods: foods[0],
      },
      {
        id: "entry-2",
        meal_id: "meal-1",
        food_id: "food-2",
        quantity: 1,
        logged_at: "2026-04-08T08:00:00.000Z",
        foods: foods[1],
      },
    ],
  },
];

describe("buildNutritionTiles", () => {
  it("creates macro, meal, and rotation food cards from nutrition data", () => {
    const tiles = buildNutritionTiles({
      meals,
      goals,
      rotationFoods: foods,
    });

    expect(tiles.some((tile) => tile.variant === "macro-summary")).toBe(true);
    expect(tiles.some((tile) => tile.variant === "meal" && tile.title === "Breakfast")).toBe(true);
    expect(tiles.some((tile) => tile.variant === "rotation-food" && tile.title === "Greek Yogurt")).toBe(true);
  });
});

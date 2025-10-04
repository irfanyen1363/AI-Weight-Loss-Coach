export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum ActivityLevel {
  Sedentary = 'sedentary',
  LightlyActive = 'lightlyActive',
  ModeratelyActive = 'moderatelyActive',
  VeryActive = 'veryActive',
  ExtraActive = 'extraActive',
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  initialWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  activityLevel: ActivityLevel;
  dailyCalorieTarget: number;
  dailyCalorieBurnTarget: number;
}

export type LogType = 'food' | 'workout' | 'weight';

export interface LogEntry {
  id: number;
  date: string; // YYYY-MM-DD
  type: LogType;
  name: string;
  calories?: number; // for food (positive) and workouts (negative)
  weight?: number; // for weight logs
}

export type ModalType = 'food' | 'workout' | 'weight' | 'aiAnalyzer' | 'barcode';

export interface Meal {
    name: string;
    calories: number;
}

export interface MealPlan {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
    totalCalories: number;
}

export interface Exercise {
    name: string;
    sets: string | number;
    reps: string | number;
}

export interface WorkoutPlan {
    focus: string;
    estimatedCaloriesBurned: number;
    exercises: Exercise[];
}

export interface DailyTip {
  date: string;
  tip: {
    title: string;
    summary: string;
    focus_point: string;
    insightful_tip: string;
  };
}

export type Language = 'en' | 'tr';
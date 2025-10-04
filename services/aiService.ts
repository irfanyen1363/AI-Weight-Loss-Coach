import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealPlan, WorkoutPlan, LogEntry, Language, DailyTip } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const parseJsonFromResponse = <T,>(text: string): T | null => {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error("Failed to parse JSON from AI response:", error, "Raw text:", text);
    return null;
  }
};

export const generateMealPlan = async (calorieTarget: number, language: Language): Promise<MealPlan | null> => {
  try {
    const prompt = `Create a daily meal plan with a total calorie count around ${calorieTarget} calories. Include breakfast, lunch, dinner, and one snack. Please provide the response and all meal names in ${language === 'tr' ? 'Turkish' : 'English'}.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                    snack: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                    totalCalories: { type: Type.NUMBER }
                }
            }
        },
    });
    return parseJsonFromResponse<MealPlan>(response.text);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return null;
  }
};

export const generateWorkoutPlan = async (userProfile: UserProfile, language: Language): Promise<WorkoutPlan | null> => {
    try {
        const prompt = `Create a workout plan for a ${userProfile.age}-year-old ${userProfile.gender} weighing ${userProfile.currentWeight}kg. Their activity level is ${userProfile.activityLevel}. The goal is weight loss. Please provide the response and all exercise names in ${language === 'tr' ? 'Turkish' : 'English'}.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        focus: { type: Type.STRING, description: "Main focus of the workout, e.g., 'Full Body Strength & Cardio'" },
                        estimatedCaloriesBurned: { type: Type.NUMBER },
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.STRING },
                                    reps: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            },
        });
        return parseJsonFromResponse<WorkoutPlan>(response.text);
    } catch (error) {
        console.error("Error generating workout plan:", error);
        return null;
    }
};

export const estimateCaloriesFromText = async (type: 'food' | 'workout', text: string, weightKg: number, language: Language): Promise<number | null> => {
  try {
    const prompt = type === 'food'
      ? `Estimate the calories for this food: "${text}". The user's language is ${language}.`
      : `Estimate the calories burned for a ${weightKg}kg person doing this workout: "${text}". The user's language is ${language}.`;
      
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    calories: { type: Type.NUMBER }
                }
            }
        },
    });
    const result = parseJsonFromResponse<{ calories: number }>(response.text);
    return result ? Math.abs(result.calories) : null;
  } catch (error) {
    console.error("Error estimating calories:", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string, language: Language): Promise<{ name: string; calories: number } | null> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        };
        const textPart = { text: `Identify the food in this image and estimate its total calories. Provide the food name in ${language === 'tr' ? 'Turkish' : 'English'}.` };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The name of the food item(s)." },
                        calories: { type: Type.NUMBER, description: "The estimated total calories." }
                    }
                }
            },
        });

        return parseJsonFromResponse<{ name: string; calories: number }>(response.text);
    } catch (error) {
        console.error("Error analyzing food image:", error);
        return null;
    }
};

export const generateDailyTip = async (userProfile: UserProfile, recentLogs: LogEntry[], language: Language, adaptiveCalorieTarget: number): Promise<DailyTip['tip'] | null> => {
    try {
        const prompt = `
        You are an AI weight loss coach. Your tone is encouraging, insightful, and supportive.
        Analyze the user's profile, their logs from the last 7 days, and their dynamically adjusted calorie target for today.
        Provide a structured and detailed analysis with a title, a summary, a focus point for today, and an insightful tip.
        - The title should be short and motivational.
        - The summary should analyze their recent performance (calorie intake vs. target, weight trend).
        - The focus_point should be a concrete, actionable task for today, related to their adjusted target.
        - The insightful_tip should be a useful piece of advice about nutrition, fitness, or mindset.
        
        Respond in ${language === 'tr' ? 'Turkish' : 'English'}.

        User Profile:
        - Age: ${userProfile.age}, Gender: ${userProfile.gender}
        - Current Weight: ${userProfile.currentWeight} kg, Target Weight: ${userProfile.targetWeight} kg
        - Base Daily Calorie Target: ${userProfile.dailyCalorieTarget} kcal
        - Today's Adjusted Calorie Target: ${adaptiveCalorieTarget} kcal

        Recent Logs (JSON):
        ${JSON.stringify(recentLogs, null, 2)}

        Based on all this data, provide your structured analysis.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A short, motivational title." },
                  summary: { type: Type.STRING, description: "A brief summary of recent user performance." },
                  focus_point: { type: Type.STRING, description: "A concrete, actionable focus point for today." },
                  insightful_tip: { type: Type.STRING, description: "A useful tip about nutrition, fitness, or mindset." }
                }
              }
            }
        });

        return parseJsonFromResponse<DailyTip['tip']>(response.text);
    } catch (error) {
        console.error("Error generating daily tip:", error);
        return null;
    }
};
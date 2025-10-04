import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, LogEntry, MealPlan, WorkoutPlan, LogType, Meal, Exercise, DailyTip } from '../types';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as aiService from '../services/aiService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../contexts/I18nContext';

const GoalProgressCard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { t } = useI18n();
    const { initialWeight, currentWeight, targetWeight } = userProfile;

    if (!initialWeight) {
        return null; // Don't render if initial weight is not set
    }

    const totalToLose = initialWeight - targetWeight;
    const weightLost = initialWeight - currentWeight;
    
    let progress = 0;
    if (totalToLose > 0) {
        progress = Math.round((weightLost / totalToLose) * 100);
    } else if (currentWeight <= targetWeight) {
        progress = 100; // Goal met or exceeded
    }
    progress = Math.max(0, Math.min(progress, 100)); // Clamp between 0 and 100

    const weightToGo = Math.max(0, currentWeight - targetWeight).toFixed(1);

    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-3">{t('dashboard.goalProgressTitle')}</h3>
            <div className="w-full bg-slate-800 rounded-full h-4 relative">
                <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                     {t('dashboard.goalProgressComplete', { percent: progress })}
                </span>
            </div>
            <p className="text-center text-sm text-slate-400 mt-2">
                {progress >= 100 
                    ? t('dashboard.goalProgressAchieved')
                    : t('dashboard.goalProgressToGo', { amount: weightToGo })
                }
            </p>
        </div>
    );
};

const DailySummaryCard: React.FC<{ userProfile: UserProfile, todayLogs: LogEntry[], adaptiveCalorieTarget: number }> = ({ userProfile, todayLogs, adaptiveCalorieTarget }) => {
    const { t } = useI18n();
    const caloriesIn = useMemo(() => todayLogs.filter(l => l.type === 'food').reduce((sum, l) => sum + (l.calories || 0), 0), [todayLogs]);
    const caloriesOut = useMemo(() => todayLogs.filter(l => l.type === 'workout').reduce((sum, l) => sum + (l.calories || 0), 0), [todayLogs]);
    const caloriesLeft = adaptiveCalorieTarget - caloriesIn + caloriesOut;
    
    const intakeProgress = Math.min((caloriesIn / adaptiveCalorieTarget) * 100, 100);
    const burnProgress = Math.min((caloriesOut / userProfile.dailyCalorieBurnTarget) * 100, 100);
    
    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-4">{t('dashboard.summaryTitle')}</h3>
            <div className="text-center mb-4">
                <span className="text-5xl font-bold text-emerald-400">{Math.round(caloriesLeft)}</span>
                <p className="text-slate-400">{t('dashboard.caloriesLeft')}</p>
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>{t('dashboard.intake')}</span>
                        <span className="font-semibold">{caloriesIn} / {adaptiveCalorieTarget} kcal</span>
                    </div>
                     {adaptiveCalorieTarget !== userProfile.dailyCalorieTarget && (
                        <p className="text-xs text-emerald-400 text-right -mt-1">{t('dashboard.adjustedTarget')}</p>
                    )}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 mt-1">
                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${intakeProgress}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>{t('dashboard.burned')}</span>
                        <span className="font-semibold">{caloriesOut} / {userProfile.dailyCalorieBurnTarget} kcal</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${burnProgress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM8.22 19.222c-.655-.252-1.222-.69-1.615-1.23a1.532 1.532 0 0 1-.36-1.132c.033-.532.28-1.02.66-1.398.2-.195.424-.36.666-.5.18-.106.368-.204.558-.3.286-.145.58-.28.84-.455.237-.16.42-.38.565-.635.13-.225.21-.48.24-.75.06-.53.03-1.07-.09-1.59-.14-.6-.36-1.18-.66-1.72-.2-.35-.42-.68-.66-1-.26-.35-.54-.68-.84-1-.18-.19-.36-.38-.51-.58-.15-.2-.27-.42-.36-.66a1.5 1.5 0 0 1 .12-1.65c.33-.42.84-.69-1.38-.72.53-.03-1.05.15-1.47.48.28.22.54.48.78.75.24.27.48.57.69.87.3.42.57.87.81 1.32.24.45.45.93.63 1.41.12.33.21.66.27.99.06.33.09.66.09 1 .03.78-.15 1.55-.51 2.22-.21.41-.51.78-.87 1.08-.24.2-.51.36-.78.48-.3.12-.6.24-.87.36-.31.14-.54.36-.72.6-.15.21-.24.45-.27.72-.03.27-.03.54.03.78.06.24.15.48.27.69.12.21.27.42.42.6.18.21.36.42.54.6.21.21.42.39.63.54.3.21.57.36.81.45.51.18 1.05.21 1.56.09.51-.12.96-.42 1.29-.84.21-.27.36-.57.42-.87.09-.3.12-.6.09-.9l-.09-.9c-.03-.27-.03-.54.03-.78.06-.24.15-.48.27-.69.12-.21.27-.42.42.6.18-.21.36-.42.54-.6.21-.21.42-.39.63-.54.3-.21.57-.36.81-.45.51-.18 1.05-.21 1.56-.09.51.12.96-.42 1.29-.84a1.5 1.5 0 0 1 .12-1.65c-.09-.24-.21-.46-.36-.66-.15-.2-.36-.39-.51-.58-.3-.32-.58-.65-.84-1-.24-.32-.46-.65-.66-1-.3-.54-.52-1.12-.66-1.72-.12-.52-.15-1.06-.09-1.59.03-.27.11-.525.24-.75.145-.255.328-.475.565-.635.26-.175.554-.31.84-.455.19-.096.378-.194.558-.3-.242-.14-.466-.305-.666-.5-.38-.378-.627-.866-.66-1.398a1.532 1.532 0 0 1 .36-1.132c.393-.54.96-.978 1.615-1.23a2.94 2.94 0 0 0-1.875-.318c-.6.09-1.17.39-1.62.84-.27.27-.51.57-.72.87-.21.3-.39.63-.54.96-.15.33-.27.66-.36.99-.12.3-.21.6-.27.9-.09.33-.15.66-.18.99-.03.33-.03.66 0 .99.03.33.09.66.18.99.09.33.21.66.36.99.15.33.33.66.54.96.21.3.45.57.72.87.45.45.99.75 1.62.84.675.12 1.35.03 1.95-.27.655-.252 1.222-.69 1.615-1.23a1.532 1.532 0 0 1 .36-1.132c-.033-.532-.28-1.02-.66-1.398-.2-.195-.424-.36-.666-.5-.18-.106.368-.204-.558-.3-.286-.145-.58-.28-.84-.455-.237-.16-.42-.38-.565-.635-.13-.225-.21-.48-.24-.75-.06-.53-.03-1.07.09-1.59.14-.6.36-1.18.66-1.72.2-.35.42-.68.66-1 .26-.35.54-.68.84-1 .18-.19.36-.38.51-.58.15-.2.27-.42-.36-.66a1.5 1.5 0 0 1-.12-1.65c-.33-.42-.84-.69-1.38-.72-.53-.03-1.05.15-1.47.48-.28.22-.54.48-.78.75-.24.27-.48.57-.69.87-.3.42-.57.87-.81 1.32-.24.45-.45.93-.63 1.41-.12.33-.21.66-.27.99-.06.33-.09.66-.09 1-.03.78.15 1.55.51 2.22.21.41-.51.78-.87 1.08-.24.2-.51.36-.78.48-.3.12-.6.24-.87.36-.31.14-.54.36-.72.6-.15.21-.24.45-.27.72-.03.27-.03.54.03.78.06.24.15.48.27.69.12.21.27.42.42.6.18.21.36.42.54.6.21.21.42.39.63.54.3.21.57.36.81.45.51.18 1.05.21 1.56.09.51-.12.96-.42 1.29-.84.21-.27.36-.57.42-.87.09-.3.12-.6.09-.9l-.09-.9c.03-.27.03-.54-.03-.78-.06-.24-.15-.48-.27-.69-.12-.21-.27-.42-.42-.6-.18-.21-.36-.42-.54-.6-.21-.21-.42-.39-.63-.54-.3-.21-.57-.36-.81-.45-.51-.18-1.05-.21-1.56-.09-.51.12-.96-.42-1.29-.84a1.5 1.5 0 0 1-.12-1.65c.09-.24.21-.46.36-.66.15-.2.36-.39.51-.58.3-.32.58-.65.84-1 .24-.32.46-.65-.66-1 .3-.54.52-1.12.66-1.72.12-.52.15-1.06.09-1.59-.03-.27-.11-.525-.24-.75-.145-.255-.328-.475-.565-.635-.26-.175-.554-.31-.84-.455-.19-.096-.378-.194-.558-.3-.242-.14-.466-.305-.666-.5-.38-.378-.627-.866-.66-1.398a1.532 1.532 0 0 1 .36-1.132c.393-.54.96-.978 1.615-1.23a2.94 2.94 0 0 0 1.875-.318c.6.09 1.17.39 1.62.84.27.27.51.57.72.87.21.3.39.63.54.96.15.33.27.66-.36.99-.12.3-.21.6-.27.9-.09.33-.15.66-.18.99-.03.33-.03.66 0 .99.03.33.09.66.18.99.09.33.21.66.36.99.15.33.33.66.54.96.21.3.45.57.72.87.45.45.99.75 1.62.84.675.12 1.35.03 1.95-.27Z" />
    </svg>
);


const AICoachCard: React.FC<{ userProfile: UserProfile; logs: LogEntry[], adaptiveCalorieTarget: number }> = ({ userProfile, logs, adaptiveCalorieTarget }) => {
    const { t, language } = useI18n();
    const today = new Date().toISOString().split('T')[0];
    const [dailyTip, setDailyTip] = useLocalStorage<DailyTip | null>(`dailyTip_${language}`, null);
    const [isLoading, setIsLoading] = useState(false);

    const hasTipForToday = dailyTip?.date === today;

    const handleGenerateTip = async () => {
        setIsLoading(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const last7DaysLogs = logs.filter(log => new Date(log.date) >= sevenDaysAgo);

        const tipData = await aiService.generateDailyTip(userProfile, last7DaysLogs, language, adaptiveCalorieTarget);
        if (tipData) {
            setDailyTip({ date: today, tip: tipData });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!hasTipForToday && !isLoading) {
            handleGenerateTip();
        }
    }, [hasTipForToday, language]);

    return (
        <div className="bg-aurora p-4 rounded-xl shadow-lg relative overflow-hidden min-h-[220px] flex flex-col">
            <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2 rounded-full">
                    <BrainIcon className="w-8 h-8 text-emerald-300" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{t('dashboard.aiCoach.title')}</h3>
                </div>
            </div>
             <div className="flex-1 flex items-center justify-center mt-2">
                 {isLoading ? (
                    <div className="w-full text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-300 mx-auto"></div>
                        <p className="text-emerald-200 text-sm mt-2">{t('dashboard.aiCoach.thinking')}</p>
                    </div>
                ) : hasTipForToday ? (
                     <div className="text-left w-full space-y-3">
                        <h4 className="font-bold text-white">{dailyTip!.tip.title}</h4>
                        <div className="text-sm space-y-2">
                            <div>
                                <p className="font-semibold text-emerald-200 text-xs uppercase tracking-wider">{t('dashboard.aiCoach.summary')}</p>
                                <p className="text-slate-200">{dailyTip!.tip.summary}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-emerald-200 text-xs uppercase tracking-wider">{t('dashboard.aiCoach.focusPoint')}</p>
                                <p className="text-slate-200">{dailyTip!.tip.focus_point}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-emerald-200 text-xs uppercase tracking-wider">{t('dashboard.aiCoach.insightfulTip')}</p>
                                <p className="text-slate-200">{dailyTip!.tip.insightful_tip}</p>
                            </div>
                        </div>
                     </div>
                ) : (
                     <p className="text-slate-300 text-center">{t('dashboard.aiCoach.getTipPrompt')}</p>
                )}
            </div>
            {!isLoading && (
                 <button 
                    onClick={handleGenerateTip}
                    className="absolute bottom-2 right-2 text-xs bg-white/10 px-2 py-1 rounded-md text-emerald-300 hover:bg-white/20"
                 >
                    {t('dashboard.aiCoach.regenerateButton')}
                 </button>
            )}
        </div>
    );
};


const ProgressChartsCard: React.FC<{ userProfile: UserProfile; logs: LogEntry[] }> = ({ userProfile, logs }) => {
    const { t, language } = useI18n();
    const [activeTab, setActiveTab] = useState<'calories' | 'weight'>('calories');
    const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'six_months'>('weekly');

    const chartData = useMemo(() => {
        const locale = language === 'tr' ? 'tr-TR' : 'en-US';
        const data: { name: string; calories: number; weight: number | null; date: Date }[] = [];

        if (timeRange === 'weekly') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLogs = logs.filter(log => log.date === dateStr);
                const totalCalories = dayLogs.filter(l => l.type === 'food').reduce((sum, l) => sum + (l.calories || 0), 0);
                const lastWeightLog = dayLogs.filter(l => l.type === 'weight').pop();
                data.push({
                    date: d,
                    name: d.toLocaleDateString(locale, { weekday: 'short' }),
                    calories: totalCalories,
                    weight: lastWeightLog?.weight || null,
                });
            }
        } else if (timeRange === 'monthly') {
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLogs = logs.filter(log => log.date === dateStr);
                const totalCalories = dayLogs.filter(l => l.type === 'food').reduce((sum, l) => sum + (l.calories || 0), 0);
                const lastWeightLog = dayLogs.filter(l => l.type === 'weight').pop();
                data.push({
                    date: d,
                    name: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
                    calories: totalCalories,
                    weight: lastWeightLog?.weight || null,
                });
            }
        } else if (timeRange === 'six_months') {
            const today = new Date();
            today.setHours(0,0,0,0);
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const month = d.getMonth();
                const year = d.getFullYear();

                const logsForMonth = logs.filter(log => {
                    const logDate = new Date(log.date);
                    return logDate.getMonth() === month && logDate.getFullYear() === year;
                });

                const foodLogs = logsForMonth.filter(l => l.type === 'food' && l.calories);
                const weightLogs = logsForMonth.filter(l => l.type === 'weight' && l.weight);
                
                const uniqueDaysWithFood = new Set(foodLogs.map(l => l.date)).size;

                const totalCalories = foodLogs.reduce((sum, l) => sum + l.calories!, 0);
                const avgCalories = uniqueDaysWithFood > 0 ? totalCalories / uniqueDaysWithFood : 0;

                const totalWeight = weightLogs.reduce((sum, l) => sum + l.weight!, 0);
                const avgWeight = weightLogs.length > 0 ? totalWeight / weightLogs.length : null;

                data.push({
                    date: d,
                    name: d.toLocaleDateString(locale, { month: 'short' }),
                    calories: Math.round(avgCalories),
                    weight: avgWeight ? parseFloat(avgWeight.toFixed(1)) : null,
                });
            }
        }

        const startDate = data.length > 0 ? data[0].date : new Date();
        const historicalLogs = logs.filter(l => l.type === 'weight' && new Date(l.date) < startDate)
                                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let lastKnownWeight = historicalLogs[0]?.weight || userProfile.currentWeight;

        for (let i = 0; i < data.length; i++) {
            if (data[i].weight !== null) {
                lastKnownWeight = data[i].weight!;
            } else {
                data[i].weight = lastKnownWeight;
            }
        }
        
        return data;
    }, [logs, userProfile.currentWeight, language, timeRange]);
    
    const CustomTooltip = (props: { active?: boolean; payload?: any[]; label?: string; }) => {
        const { active, payload, label } = props;
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-800 p-2 border border-slate-700 rounded-md shadow-lg text-sm">
                    <p className="font-bold text-slate-200">{label}</p>
                    {data.calories > 0 && <p className="text-emerald-400">{t('dashboard.charts.tooltipCalories', { value: data.calories })}</p>}
                    {data.weight !== undefined && data.weight !== null && <p className="text-emerald-400">{t('dashboard.charts.tooltipWeight', { value: data.weight.toFixed(1) })}</p>}
                </div>
            );
        }
        return null;
    };
    
    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-700 mb-4 gap-2 pb-2">
                <div className="flex">
                    <button onClick={() => setActiveTab('calories')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'calories' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>{t('dashboard.charts.calories')}</button>
                    <button onClick={() => setActiveTab('weight')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'weight' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>{t('dashboard.charts.weight')}</button>
                </div>
                <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg self-start sm:self-center">
                    {(['weekly', 'monthly', 'six_months'] as const).map((range) => (
                            <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === range ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            {t(`dashboard.charts.${range}`)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-60">
                {activeTab === 'calories' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                            <YAxis tick={{ fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.5)' }} />
                            <Bar dataKey="calories" fill="#34d399" />
                            <ReferenceLine y={userProfile.dailyCalorieTarget} label={{ value: t('dashboard.charts.target'), fill: '#F6E05E', position: 'insideTopLeft' }} stroke="#F6E05E" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(51, 65, 85, 0.5)', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="weight" stroke="#34d399" fillOpacity={1} fill="url(#colorWeight)" />
                             <ReferenceLine y={userProfile.targetWeight} label={{ value: t('dashboard.charts.target'), fill: '#F6E05E', position: 'insideTopLeft' }} stroke="#F6E05E" strokeDasharray="3 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

const AIPlannerCard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { t, language } = useI18n();
    const [activeTab, setActiveTab] = useState<'meal' | 'workout'>('meal');
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        if (activeTab === 'meal') {
            const plan = await aiService.generateMealPlan(userProfile.dailyCalorieTarget, language);
            setMealPlan(plan);
        } else {
            const plan = await aiService.generateWorkoutPlan(userProfile, language);
            setWorkoutPlan(plan);
        }
        setIsLoading(false);
    };
    
    const addEntry = (type: LogType, name: string, calories: number) => {
        setLogs(prev => [...prev, {id: Date.now(), date: new Date().toISOString().split('T')[0], type, name, calories}]);
    };
    
    const renderMeal = (meal: Meal | undefined, mealType: string) => {
        if (!meal) return null;
        return (
            <div className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                <div>
                    <p className="font-semibold">{mealType}</p>
                    <p className="text-sm text-slate-300">{meal.name}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{meal.calories} kcal</span>
                    <button onClick={() => addEntry('food', meal.name, meal.calories)} className="bg-emerald-600 p-1.5 rounded-full text-white hover:bg-emerald-700">+</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg h-full flex flex-col">
            <div className="flex border-b border-slate-700 mb-4">
                <button onClick={() => setActiveTab('meal')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'meal' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>{t('dashboard.planner.mealPlan')}</button>
                <button onClick={() => setActiveTab('workout')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'workout' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>{t('dashboard.planner.workoutPlan')}</button>
            </div>
            <div className="flex-grow overflow-y-auto">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>
                ) : activeTab === 'meal' && mealPlan ? (
                    <div className="space-y-3">
                        {renderMeal(mealPlan.breakfast, t('dashboard.planner.breakfast'))}
                        {renderMeal(mealPlan.lunch, t('dashboard.planner.lunch'))}
                        {renderMeal(mealPlan.dinner, t('dashboard.planner.dinner'))}
                        {renderMeal(mealPlan.snack, t('dashboard.planner.snack'))}
                        <div className="text-right font-bold mt-2">{t('dashboard.planner.total')}: {mealPlan.totalCalories} kcal</div>
                    </div>
                ) : activeTab === 'workout' && workoutPlan ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold">{workoutPlan.focus}</h4>
                            <span className="text-amber-400 font-semibold">~{workoutPlan.estimatedCaloriesBurned} kcal</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                        {workoutPlan.exercises.map((ex, i) => <li key={i} className="flex justify-between p-2 bg-slate-800 rounded-md"><span>{ex.name}</span><span>{ex.sets} x {ex.reps}</span></li>)}
                        </ul>
                         <button onClick={() => addEntry('workout', workoutPlan.focus, workoutPlan.estimatedCaloriesBurned)} className="w-full mt-4 bg-amber-600 p-2 rounded-md text-white hover:bg-amber-700">{t('dashboard.planner.addWorkout')}</button>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 py-10">{t('dashboard.planner.prompt')}</div>
                )}
            </div>
            <button onClick={handleGeneratePlan} disabled={isLoading} className="w-full mt-4 bg-emerald-600 p-2 rounded-md text-white hover:bg-emerald-700 disabled:bg-slate-600">
                {isLoading ? t('dashboard.planner.generatingButton') : t('dashboard.planner.generateButton')}
            </button>
        </div>
    );
};

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

export const Dashboard: React.FC<{ userProfile: UserProfile; logs: LogEntry[]; onOpenProfile: () => void; }> = ({ userProfile, logs, onOpenProfile }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { t, language, setLanguage } = useI18n();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(log => log.date === today);
  }, [logs]);

  const adaptiveCalorieTarget = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7DaysFoodLogs = logs.filter(log => 
        log.type === 'food' && new Date(log.date) >= sevenDaysAgo
    );

    if (last7DaysFoodLogs.length < 3) {
      return userProfile.dailyCalorieTarget;
    }

    const totalCalories = last7DaysFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const uniqueDays = new Set(last7DaysFoodLogs.map(log => log.date)).size;
    const averageIntake = totalCalories / uniqueDays;
    
    const baseTarget = userProfile.dailyCalorieTarget;
    const deviation = (averageIntake - baseTarget) / baseTarget;

    if (deviation > 0.10) { // Consistently overeating
        return Math.round(Math.max(baseTarget - 150, baseTarget * 0.85)); // Adjust down but not too drastically
    } else if (deviation < -0.15) { // Consistently undereating
        return Math.round(Math.min(baseTarget + 100, baseTarget * 1.1)); // Adjust up gently
    }

    return baseTarget;

  }, [logs, userProfile.dailyCalorieTarget]);


  const pages = [
    (
        <div key="page1" className="space-y-4">
            <GoalProgressCard userProfile={userProfile} />
            <DailySummaryCard userProfile={userProfile} todayLogs={todayLogs} adaptiveCalorieTarget={adaptiveCalorieTarget} />
            <AICoachCard userProfile={userProfile} logs={logs} adaptiveCalorieTarget={adaptiveCalorieTarget} />
            <ProgressChartsCard userProfile={userProfile} logs={logs} />
        </div>
    ),
    (
        <div key="page2" className="h-full">
            <AIPlannerCard userProfile={userProfile} />
        </div>
    )
  ];
  
  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24">
       <header className="mb-4">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">{t('dashboard.greeting', { name: userProfile.name })}</h1>
                <p className="text-slate-400">{t('dashboard.motivation')}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggleLanguage} className="bg-slate-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-700">
                    {language.toUpperCase()}
                </button>
                 <button onClick={onOpenProfile} className="bg-slate-800 p-2 rounded-full text-sm font-semibold hover:bg-slate-700">
                    <UserIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </header>
      <div className="relative">
          <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
              {pages.map((page, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                      {page}
                  </div>
              ))}
          </div>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
            {pages.map((_, index) => (
                <button key={index} onClick={() => setCurrentPage(index)} className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-emerald-400' : 'bg-slate-600'}`}></button>
            ))}
      </div>
    </main>
  );
};
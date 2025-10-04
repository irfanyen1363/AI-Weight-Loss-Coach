import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const activityLevelMultipliers: Record<ActivityLevel, number> = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.LightlyActive]: 1.375,
  [ActivityLevel.ModeratelyActive]: 1.55,
  [ActivityLevel.VeryActive]: 1.725,
  [ActivityLevel.ExtraActive]: 1.9,
};

const calculateBMR = (weight: number, height: number, age: number, gender: Gender): number => {
  if (gender === Gender.Male) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: Gender.Male,
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: ActivityLevel.Sedentary,
  });
  
  const activityLevelDescriptions: Record<ActivityLevel, string> = {
    [ActivityLevel.Sedentary]: t('onboarding.activityLevels.sedentary'),
    [ActivityLevel.LightlyActive]: t('onboarding.activityLevels.lightlyActive'),
    [ActivityLevel.ModeratelyActive]: t('onboarding.activityLevels.moderatelyActive'),
    [ActivityLevel.VeryActive]: t('onboarding.activityLevels.veryActive'),
    [ActivityLevel.ExtraActive]: t('onboarding.activityLevels.extraActive'),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const { name, age, gender, height, currentWeight, targetWeight, activityLevel } = formData;
    const ageNum = parseInt(age, 10);
    const heightNum = parseInt(height, 10);
    const currentWeightNum = parseInt(currentWeight, 10);
    const targetWeightNum = parseInt(targetWeight, 10);

    const bmr = calculateBMR(currentWeightNum, heightNum, ageNum, gender);
    const tdee = bmr * activityLevelMultipliers[activityLevel];
    const dailyCalorieTarget = Math.round(tdee - 500);
    
    const profile: UserProfile = {
      name,
      age: ageNum,
      gender,
      height: heightNum,
      initialWeight: currentWeightNum,
      currentWeight: currentWeightNum,
      targetWeight: targetWeightNum,
      activityLevel,
      dailyCalorieTarget,
      dailyCalorieBurnTarget: 500, // A sensible default
    };
    onComplete(profile);
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-emerald-400">{t('onboarding.title1')}</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-400">{t('onboarding.name')}</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-400">{t('onboarding.age')}</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-400">{t('onboarding.gender')}</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500">
                <option value={Gender.Male}>{t('onboarding.male')}</option>
                <option value={Gender.Female}>{t('onboarding.female')}</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-emerald-400">{t('onboarding.title2')}</h2>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-slate-400">{t('onboarding.height')}</label>
              <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="currentWeight" className="block text-sm font-medium text-slate-400">{t('onboarding.currentWeight')}</label>
              <input type="number" name="currentWeight" id="currentWeight" value={formData.currentWeight} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="targetWeight" className="block text-sm font-medium text-slate-400">{t('onboarding.targetWeight')}</label>
              <input type="number" name="targetWeight" id="targetWeight" value={formData.targetWeight} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-emerald-400">{t('onboarding.title3')}</h2>
             <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-slate-400">{t('onboarding.activityLevel')}</label>
              <select name="activityLevel" id="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500">
                {Object.entries(activityLevelDescriptions).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-lg">
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-800 bg-emerald-200">
                    {t('onboarding.step', { step })}
                </span>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-900">
                <div style={{ width: `${(step / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"></div>
            </div>
        </div>

        {renderStep()}
        
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button onClick={prevStep} className="px-6 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition">{t('onboarding.back')}</button>
          )}
          {step < 3 ? (
            <button onClick={nextStep} className="px-6 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700 transition ml-auto">{t('onboarding.next')}</button>
          ) : (
            <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700 transition ml-auto">{t('onboarding.finish')}</button>
          )}
        </div>
      </div>
    </div>
  );
};
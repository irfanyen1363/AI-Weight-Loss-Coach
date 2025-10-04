import React, { useState, useMemo } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface ProfileProps {
  userProfile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onReset: () => void;
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

const FormRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400">{label}</label>
        {children}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">{children}</h3>
);

export const Profile: React.FC<ProfileProps> = ({ userProfile, onClose, onSave, onReset }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState(userProfile);
    
    const activityLevelDescriptions = useMemo(() => ({
        [ActivityLevel.Sedentary]: t('onboarding.activityLevels.sedentary'),
        [ActivityLevel.LightlyActive]: t('onboarding.activityLevels.lightlyActive'),
        [ActivityLevel.ModeratelyActive]: t('onboarding.activityLevels.moderatelyActive'),
        [ActivityLevel.VeryActive]: t('onboarding.activityLevels.veryActive'),
        [ActivityLevel.ExtraActive]: t('onboarding.activityLevels.extraActive'),
    }), [t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = () => {
        const ageNum = parseInt(formData.age.toString(), 10);
        const heightNum = parseInt(formData.height.toString(), 10);
        const currentWeightNum = parseFloat(formData.currentWeight.toString());
        const targetWeightNum = parseFloat(formData.targetWeight.toString());

        const bmr = calculateBMR(currentWeightNum, heightNum, ageNum, formData.gender);
        const tdee = bmr * activityLevelMultipliers[formData.activityLevel];
        const dailyCalorieTarget = Math.round(tdee - 500);

        const updatedProfile: UserProfile = {
            ...formData,
            age: ageNum,
            height: heightNum,
            currentWeight: currentWeightNum,
            targetWeight: targetWeightNum,
            dailyCalorieTarget,
            initialWeight: userProfile.initialWeight || currentWeightNum, // Preserve or set initial weight
        };
        onSave(updatedProfile);
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 animate-slide-in-right flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">{t('profile.title')}</h2>
                <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-100">&times;</button>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                    <SectionTitle>{t('profile.personalInfo')}</SectionTitle>
                    <div className="space-y-4">
                        <FormRow label={t('profile.name')}>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
                        </FormRow>
                        <FormRow label={t('profile.age')}>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
                        </FormRow>
                         <FormRow label={t('profile.gender')}>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500">
                                <option value={Gender.Male}>{t('onboarding.male')}</option>
                                <option value={Gender.Female}>{t('onboarding.female')}</option>
                            </select>
                        </FormRow>
                        <FormRow label={t('profile.height')}>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
                        </FormRow>
                        <FormRow label={t('profile.currentWeight')}>
                            <input type="number" name="currentWeight" value={formData.currentWeight} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
                        </FormRow>
                         <FormRow label={t('profile.targetWeight')}>
                            <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500" />
                        </FormRow>
                    </div>
                </section>

                <section>
                    <SectionTitle>{t('profile.lifestyle')}</SectionTitle>
                     <FormRow label={t('profile.activityLevel')}>
                        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500">
                           {Object.entries(activityLevelDescriptions).map(([key, value]) => (
                             <option key={key} value={key}>{value}</option>
                           ))}
                        </select>
                    </FormRow>
                </section>
                
                 <section>
                    <SectionTitle>{t('profile.calculatedInfo')}</SectionTitle>
                     <div className="bg-slate-900 p-4 rounded-lg text-center">
                        <p className="text-slate-400">{t('profile.dailyCalorieTarget')}</p>
                        <p className="text-3xl font-bold text-emerald-400">{userProfile.dailyCalorieTarget} <span className="text-xl">kcal</span></p>
                     </div>
                </section>

                 <section>
                    <SectionTitle>{t('profile.dataManagement')}</SectionTitle>
                     <button onClick={onReset} className="w-full text-left p-4 bg-red-800/20 text-red-400 rounded-lg hover:bg-red-800/40">
                         {t('profile.resetData')}
                     </button>
                </section>
            </main>
            
            <footer className="p-4 border-t border-slate-700">
                <button onClick={handleSaveChanges} className="w-full px-6 py-3 bg-emerald-600 rounded-md text-white font-semibold hover:bg-emerald-700 transition">
                    {t('profile.saveChanges')}
                </button>
            </footer>
        </div>
    );
};
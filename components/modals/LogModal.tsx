import React, { useState, useEffect } from 'react';
import { LogType, LogEntry, UserProfile } from '../../types';
import * as aiService from '../../services/aiService';
import { useI18n } from '../../contexts/I18nContext';

interface LogModalProps {
  type: LogType;
  onClose: () => void;
  onSave: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
  userProfile: UserProfile;
}

export const LogModal: React.FC<LogModalProps> = ({ type, onClose, onSave, userProfile }) => {
  const { t, language } = useI18n();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const titles: Record<LogType, string> = {
    food: t('logModal.foodTitle'),
    workout: t('logModal.workoutTitle'),
    weight: t('logModal.weightTitle'),
  };

  const labels: Record<LogType, { name: string, value: string }> = {
    food: { name: t('logModal.foodNameLabel'), value: t('logModal.caloriesLabel') },
    workout: { name: t('logModal.workoutNameLabel'), value: t('logModal.caloriesBurnedLabel') },
    weight: { name: t('logModal.weightNameLabel'), value: t('logModal.weightLabel') },
  };

  useEffect(() => {
    setName('');
    setValue('');
  }, [type]);

  const handleEstimate = async () => {
    if (type === 'weight' || !name) return;
    setIsLoading(true);
    const calories = await aiService.estimateCaloriesFromText(type, name, userProfile.currentWeight, language);
    if (calories !== null) {
      setValue(calories.toString());
    }
    setIsLoading(false);
  };
  
  const handleSave = () => {
    const valueNum = parseFloat(value);
    if (isNaN(valueNum)) return;
    
    if (type === 'weight') {
      onSave({ type: 'weight', name: name || `Weight log`, weight: valueNum });
    } else {
      onSave({ type, name, calories: valueNum });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{titles[type]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{labels[type].name}</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-800 rounded-md border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {type !== 'weight' && (
            <button
                onClick={handleEstimate}
                disabled={isLoading || !name}
                className="w-full px-4 py-2 text-sm border border-emerald-500 text-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? t('logModal.estimatingButton') : t('logModal.estimateButton')}
            </button>
           )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{labels[type].value}</label>
            <input 
              type="number" 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 bg-slate-800 rounded-md border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-slate-300 hover:bg-slate-700">{t('logModal.cancel')}</button>
          <button 
            onClick={handleSave}
            disabled={!value}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-slate-600"
          >
            {t('logModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
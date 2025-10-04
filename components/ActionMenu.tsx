import React, { useState } from 'react';
import { ModalType } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface ActionMenuProps {
  onSelect: (type: ModalType) => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const FoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m-4-8v8m-4-13.5V13M4 13h5m-5-4h5m-5-4h5" /></svg>;
const WorkoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const WeightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.002 0M6 7l3 9M6 7l6-2m6 2l-6-2m0 0l-6 2m6-2v7.5a2.5 2.5 0 01-5 0V7" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BarcodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;

export const ActionMenu: React.FC<ActionMenuProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  const handleSelect = (type: ModalType) => {
    onSelect(type);
    setIsOpen(false);
  };

  const menuItems = [
    { type: 'food' as ModalType, label: t('actionMenu.logFood'), icon: <FoodIcon />, color: 'bg-emerald-500' },
    { type: 'workout' as ModalType, label: t('actionMenu.logWorkout'), icon: <WorkoutIcon />, color: 'bg-amber-500' },
    { type: 'weight' as ModalType, label: t('actionMenu.logWeight'), icon: <WeightIcon />, color: 'bg-sky-500' },
    { type: 'aiAnalyzer' as ModalType, label: t('actionMenu.aiScan'), icon: <CameraIcon />, color: 'bg-violet-500' },
    { type: 'barcode' as ModalType, label: t('actionMenu.scanBarcode'), icon: <BarcodeIcon />, color: 'bg-yellow-500' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40" 
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute bottom-24 right-0 left-0 mx-auto w-full max-w-md p-4 flex flex-col items-center space-y-3">
             {menuItems.map((item, index) => (
                <div 
                    key={item.type}
                    className="flex items-center w-full justify-end cursor-pointer group"
                    style={{ transitionDelay: `${index * 30}ms` }}
                    onClick={() => handleSelect(item.type)}
                >
                    <span className="text-white bg-slate-900 bg-opacity-90 px-3 py-1 rounded-md mr-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.label}
                    </span>
                    <button className={`${item.color} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                        {item.icon}
                    </button>
                </div>
            ))}
          </div>
        </div>
      )}
      <div className="absolute bottom-6 right-0 left-0 mx-auto w-full max-w-md flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-50 transform hover:scale-110 transition-transform"
        >
            <div className="relative w-8 h-8">
                <PlusIcon className={`absolute inset-0 w-8 h-8 transition-all duration-300 ${isOpen ? 'transform rotate-45 opacity-0' : 'transform rotate-0 opacity-100'}`} />
                <XMarkIcon className={`absolute inset-0 w-8 h-8 transition-all duration-300 ${isOpen ? 'transform rotate-0 opacity-100' : 'transform -rotate-45 opacity-0'}`} />
            </div>
        </button>
      </div>
    </>
  );
};
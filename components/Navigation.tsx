
import React from 'react';
import { FormStep, PatientType } from '../types';

interface NavigationProps {
  currentStep: FormStep;
  patientType: PatientType;
  onNext: () => void;
  onPrev: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentStep, patientType, onNext, onPrev }) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-[#2d3748]">
      <button
        onClick={onPrev}
        className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
          currentStep === FormStep.IDENTIFICATION
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#2d3748]'
        }`}
        disabled={currentStep === FormStep.IDENTIFICATION}
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        Anterior
      </button>
      
      {currentStep < FormStep.SUMMARY && (
        <button
          onClick={onNext}
          className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none active:scale-95 flex items-center gap-2"
        >
          Próximo Passo
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      )}
    </div>
  );
};

export default Navigation;


import React from 'react';
import { FormStep, PatientType, PediatricSubType } from '../types';

interface SidebarProps {
  currentStep: FormStep;
  patientType?: PatientType;
  pediatricSubType?: PediatricSubType;
  onStepClick: (step: FormStep) => void;
  onGoBack: () => void;
  onOpenGlossary: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  patientType, 
  pediatricSubType, 
  onStepClick, 
  onGoBack,
  onOpenGlossary 
}) => {
  const getSteps = () => {
    if (patientType === PatientType.SOAP) {
      return [
        { id: FormStep.QD_HMA, label: 'Subjetivo (S)', icon: 'chat' },
        { id: FormStep.PHYSICAL_EXAM, label: 'Objetivo (O)', icon: 'stethoscope' },
        { id: FormStep.SOAP_ASSESSMENT, label: 'Avaliação & Plano', icon: 'assignment_turned_in' },
        { id: FormStep.SUMMARY, label: 'Exportar PDF', icon: 'picture_as_pdf' }
      ];
    }
    return [
      { id: FormStep.IDENTIFICATION, label: 'Identificação', icon: 'person' },
      { id: FormStep.QD_HMA, label: 'QD & HMA', icon: 'history' },
      { id: FormStep.ISDA, label: 'ISDA', icon: 'clinical_notes' },
      { id: FormStep.ANTECEDENTS, label: 'Antecedentes', icon: 'history_edu' },
      { id: FormStep.PHYSICAL_EXAM, label: 'Exame Físico', icon: 'stethoscope' },
      { id: FormStep.SYNTHESIS, label: 'Síntese Clínica', icon: 'psychiatry' },
      { id: FormStep.SUMMARY, label: 'Resumo & PDF', icon: 'picture_as_pdf' },
    ];
  };

  if (currentStep === FormStep.TYPE_SELECTION || currentStep === FormStep.PEDIATRIC_SUB_SELECTION) return null;

  const steps = getSteps();

  return (
    <aside className="w-64 bg-white dark:bg-[#1a202c] h-full hidden md:flex flex-col border-r border-[#f0f2f4] dark:border-[#2d3748] transition-colors duration-200 sticky top-0 z-40">
      {/* Topo - Branding */}
      <div className="p-6 border-b border-[#f0f2f4] dark:border-[#2d3748]">
        <div className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg shrink-0">
             <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
          </div>
          <div className="overflow-hidden">
            <span className="text-lg font-bold tracking-tight dark:text-white block leading-none truncate">AnamneWEB</span>
            {pediatricSubType && (
              <span className="text-[9px] font-black text-primary uppercase mt-1 block truncate">{pediatricSubType}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Meio - Navegação Rolável */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#617289] dark:text-gray-500 mb-4 px-2">Roteiro</p>
        <nav className="space-y-1.5 pb-4">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden ${
                currentStep === step.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-[#617289] dark:text-gray-400 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${currentStep === step.id ? 'text-white' : 'text-[#9ca3af] group-hover:text-primary'}`}>
                {step.icon}
              </span>
              <span className={`font-semibold text-xs truncate ${currentStep === step.id ? 'text-white font-bold' : ''}`}>
                {step.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Base - Ações e Glossário (Sempre visível) */}
      <div className="p-4 border-t border-[#f0f2f4] dark:border-[#2d3748] bg-slate-50/50 dark:bg-white/5 space-y-3">
        <button 
          onClick={onOpenGlossary}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary bg-white dark:bg-[#2d3748] hover:bg-primary/5 font-bold text-xs transition-all border border-primary/20 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          Glossário Médico
        </button>

        <div className="p-3 bg-white dark:bg-[#2d3748] rounded-xl border border-[#f0f2f4] dark:border-[#2d3748] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-[#617289] dark:text-gray-500">Progresso</p>
            <p className="text-[8px] font-black text-primary">{Math.round(((currentStep + 1) / (steps.length)) * 100)}%</p>
          </div>
          <div className="h-1 w-full bg-[#f0f2f4] dark:bg-[#1a202c] rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out" 
              style={{ width: `${Math.min(100, Math.max(0, ((currentStep + 1) / (steps.length)) * 100))}%` }}
            />
          </div>
        </div>

        <button 
          onClick={onGoBack}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sair do Roteiro
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

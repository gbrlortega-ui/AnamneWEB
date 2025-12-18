
import React, { useState } from 'react';
import { PatientType, PediatricSubType } from '../types';
import { refineMedicalText, getClinicalSuggestions } from '../services/geminiService';
import ClinicalGuidance from './ClinicalGuidance';

interface Props {
  qd: string;
  hma: string;
  patientType: PatientType;
  subType?: PediatricSubType;
  onChange: (updates: { qd?: string; hma?: string }) => void;
}

const HistorySection: React.FC<Props> = ({ qd, hma, patientType, subType, onChange }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleRefine = async () => {
    if (!hma) return;
    setIsRefining(true);
    const refined = await refineMedicalText(hma, "História da Moléstia Atual (HMA)", patientType);
    onChange({ hma: refined });
    setIsRefining(false);
  };

  const handleGetSuggestions = async () => {
    if (!qd && !hma) return;
    setLoadingSuggestions(true);
    const clinicalSuggestions = await getClinicalSuggestions(qd, hma, patientType);
    setSuggestions(clinicalSuggestions);
    setLoadingSuggestions(false);
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600";
  const labelClass = "block text-sm font-bold text-[#111418] dark:text-white mb-2";

  return (
    <section className="space-y-8">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4">
        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">História Clínica</h2>
        <p className="text-sm text-[#617289] dark:text-gray-400">Queixa principal e evolução da doença atual.</p>
      </div>

      <ClinicalGuidance patientType={patientType} subType={subType} section="history" />

      <div className="space-y-6">
        <div>
          <label className={labelClass}>Queixa Principal (QD)</label>
          <input
            value={qd}
            onChange={(e) => onChange({ qd: e.target.value })}
            placeholder="Ex: Dor no peito há 2 horas. / Tosse persistente há 3 dias. / Febre e recusa alimentar."
            className={inputClass}
          />
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>História da Moléstia Atual (HMA)</label>
            <button
              onClick={handleRefine}
              disabled={isRefining || !hma}
              className={`text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isRefining 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-sm">magic_button</span>
              {isRefining ? 'Refinando...' : 'Refinar com IA'}
            </button>
          </div>
          <textarea
            value={hma}
            onChange={(e) => onChange({ hma: e.target.value })}
            placeholder="Considere a cronologia: Início, localização, caráter da dor, intensidade, duração, irradiação, fatores de melhora/piora, sintomas associados, evolução do quadro até o momento e tratamentos realizados."
            className={`${inputClass} h-64 resize-none leading-relaxed`}
          />
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2d3748]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
               <span className="material-symbols-outlined text-lg">psychiatry</span>
               Assistente Semiológico ({patientType})
             </h3>
             <button 
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline"
             >
               {loadingSuggestions ? 'Analisando...' : 'Obter Perguntas Sugeridas'}
             </button>
           </div>
           
           {suggestions.length > 0 ? (
             <ul className="space-y-3">
               {suggestions.map((s, i) => (
                 <li key={i} className="text-sm text-slate-600 dark:text-gray-300 flex gap-3 items-start">
                   <span className="material-symbols-outlined text-primary text-sm mt-0.5">help_center</span>
                   {s}
                 </li>
               ))}
             </ul>
           ) : (
             <p className="text-xs text-[#617289] dark:text-gray-400 italic">Preencha a HMA e utilize o assistente para não esquecer perguntas fundamentais.</p>
           )}
        </div>
      </div>
    </section>
  );
};

export default HistorySection;

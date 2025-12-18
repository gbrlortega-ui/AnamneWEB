
import React, { useState } from 'react';
import { PatientType } from '../types';
import { refineMedicalText } from '../services/geminiService';

interface Props {
  fatoresRisco: string;
  conduta: string;
  patientType: PatientType;
  onChange: (updates: { fatoresRisco?: string; conduta?: string }) => void;
}

const SynthesisSection: React.FC<Props> = ({ fatoresRisco, conduta, patientType, onChange }) => {
  const [isRefining, setIsRefining] = useState<'fatores' | 'conduta' | null>(null);

  const handleRefine = async (field: 'fatoresRisco' | 'conduta', label: string) => {
    const text = field === 'fatoresRisco' ? fatoresRisco : conduta;
    if (!text) return;
    setIsRefining(field === 'fatoresRisco' ? 'fatores' : 'conduta');
    const refined = await refineMedicalText(text, label, patientType);
    onChange({ [field]: refined });
    setIsRefining(null);
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600";
  const labelClass = "block text-sm font-bold text-[#111418] dark:text-white";

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4">
        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">Síntese Clínica</h2>
        <p className="text-sm text-[#617289] dark:text-gray-400">Raciocínio final, riscos identificados e plano terapêutico.</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>Fatores de Risco (Físicos, Psicológicos e Sociais)</label>
            <button
              onClick={() => handleRefine('fatoresRisco', "Fatores de Risco")}
              disabled={isRefining === 'fatores' || !fatoresRisco}
              className="text-[10px] font-bold flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">magic_button</span>
              {isRefining === 'fatores' ? 'Refinando...' : 'Refinar IA'}
            </button>
          </div>
          <textarea
            value={fatoresRisco}
            onChange={(e) => onChange({ fatoresRisco: e.target.value })}
            placeholder="Ex: Sedentarismo, histórico familiar de IAM precoce, isolamento social, baixa escolaridade, ansiedade reativa..."
            className={`${inputClass} h-40 resize-none leading-relaxed`}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>Condutas e Orientações</label>
            <button
              onClick={() => handleRefine('conduta', "Condutas e Orientações")}
              disabled={isRefining === 'conduta' || !conduta}
              className="text-[10px] font-bold flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">magic_button</span>
              {isRefining === 'conduta' ? 'Refinando...' : 'Refinar IA'}
            </button>
          </div>
          <textarea
            value={conduta}
            onChange={(e) => onChange({ conduta: e.target.value })}
            placeholder="Prescrições, solicitações de exames complementares, encaminhamentos e orientações verbais fornecidas ao paciente/responsável."
            className={`${inputClass} h-56 resize-none leading-relaxed`}
          />
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex gap-3">
        <span className="material-symbols-outlined text-amber-600">lightbulb</span>
        <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <strong>Dica:</strong> A síntese é o resumo do seu raciocínio. Foque em como os fatores de risco influenciam a conduta proposta hoje.
        </div>
      </div>
    </section>
  );
};

export default SynthesisSection;

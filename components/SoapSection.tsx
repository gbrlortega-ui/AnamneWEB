
import React, { useState } from 'react';
import { SoapData, PatientType, SoapAssessmentItem, SoapPlanItem, SoapPlanCategory, SoapSubjective, PatientIdentification, RiskLevel } from '../types';
import { refineMedicalText } from '../services/geminiService';
import IdentificationSection from './IdentificationSection';
import CVRiskModal from './CVRiskModal';
import IVCF20Modal from './IVCF20Modal';

interface Props {
  part: 'S' | 'O' | 'AP';
  data: SoapData;
  idData: PatientIdentification;
  patientType: PatientType;
  onChange: (data: SoapData) => void;
  onIdChange: (id: PatientIdentification) => void;
}

const SoapSection: React.FC<Props> = ({ part, data, idData, patientType, onChange, onIdChange }) => {
  const [isRefining, setIsRefining] = useState<string | null>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [isIVCFModalOpen, setIsIVCFModalOpen] = useState(false);

  const handleRefineSubjective = async (field: keyof SoapSubjective, label: string) => {
    if (!data.s[field]) return;
    setIsRefining(field);
    const refined = await refineMedicalText(data.s[field] as string, label, patientType);
    onChange({
      ...data,
      s: { ...data.s, [field]: refined }
    });
    setIsRefining(null);
  };

  const handleCVResult = (result: string, level: RiskLevel) => {
    onChange({
      ...data,
      s: { ...data.s, riscoCardiovascular: result, riscoCardiovascularLevel: level }
    });
  };

  const handleIVCFResult = (score: number, resultText: string) => {
    onChange({
      ...data,
      s: { ...data.s, ivcf20Score: score, ivcf20Result: resultText }
    });
  };

  const getRiskStyles = (level?: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/10 dark:border-green-800/30 dark:text-green-100';
      case 'MODERATE': return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/10 dark:border-amber-800/30 dark:text-amber-100';
      case 'HIGH':
      case 'VERY_HIGH': return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-800/30 dark:text-red-100';
      case 'EXTREME': return 'bg-red-900 border-red-800 text-white';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const handleRefineObjective = async () => {
    if (!data.o) return;
    setIsRefining('o');
    const refined = await refineMedicalText(data.o, 'Objetivo Complementar', patientType);
    onChange({ ...data, o: refined });
    setIsRefining(null);
  };

  const addAssessment = () => {
    const nextId = String(Date.now());
    onChange({
      ...data,
      assessments: [...data.assessments, { id: nextId, text: '' }]
    });
  };

  const updateAssessment = (id: string, text: string) => {
    onChange({
      ...data,
      assessments: data.assessments.map(a => a.id === id ? { ...a, text } : a)
    });
  };

  const removeAssessment = (id: string) => {
    if (data.assessments.length <= 1) return;
    onChange({
      ...data,
      assessments: data.assessments.filter(a => a.id !== id)
    });
  };

  const addPlan = () => {
    const nextId = String(Date.now());
    onChange({
      ...data,
      plans: [...data.plans, { 
        id: nextId, 
        text: '', 
        category: 'DIAGNOSTIC', 
        linkedAssessments: [] 
      }]
    });
  };

  const updatePlan = (id: string, updates: Partial<SoapPlanItem>) => {
    onChange({
      ...data,
      plans: data.plans.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const removePlan = (id: string) => {
    if (data.plans.length <= 1) return;
    onChange({
      ...data,
      plans: data.plans.filter(p => p.id !== id)
    });
  };

  const toggleLink = (planId: string, assessmentId: string) => {
    const plan = data.plans.find(p => p.id === planId);
    if (!plan) return;
    
    const linked = plan.linkedAssessments.includes(assessmentId)
      ? plan.linkedAssessments.filter(id => id !== assessmentId)
      : [...plan.linkedAssessments, assessmentId];
    
    updatePlan(planId, { linkedAssessments: linked });
  };

  const categoryLabels: Record<SoapPlanCategory, { label: string, color: string }> = {
    DIAGNOSTIC: { label: 'Diagnóstica (Exames / Hipóteses)', color: 'bg-blue-100 text-blue-800' },
    THERAPEUTIC: { label: 'Terapêutica (Medicações, MEV, Suporte)', color: 'bg-green-100 text-green-800' },
    FOLLOW_UP: { label: 'Acompanhamento (Retorno, Alarme)', color: 'bg-purple-100 text-purple-800' },
    EDUCATION: { label: 'Educação (Explicações, Adesão)', color: 'bg-orange-100 text-orange-800' },
    ADMINISTRATIVE: { label: 'Administrativa / Estudo (Encaminhamentos)', color: 'bg-slate-100 text-slate-800' }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all";
  const labelClass = "block text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2";

  const subjectiveFields: { key: keyof SoapSubjective, label: string, placeholder: string }[] = [
    { key: 'qpHma', label: '2. QP + HMA', placeholder: 'Queixa principal e história detalhada da moléstia atual...' },
    { key: 'isda', label: '3. ISDA', placeholder: 'Interrogatório Sistemático por Aparelhos...' },
    { key: 'antFisiologicos', label: '4. Antecedentes Pessoais - Fisiológicos', placeholder: 'Desenvolvimento, marcos, gestação, parto...' },
    { key: 'antPatologicos', label: '5. Antecedentes Pessoais - Patológicos', placeholder: 'Doenças prévias, cirurgias, internações, alergias...' },
    { key: 'medicacoes', label: '6. Medicações em Uso', placeholder: 'Lista de fármacos, doses e posologia atual...' },
    { key: 'antFamiliares', label: '7. Antecedentes Familiares', placeholder: 'Doenças hereditárias, causa mortis de familiares...' },
    { key: 'habitos', label: '8. Hábitos de Vida', placeholder: 'Sono, dieta, atividade física, vícios (fumo/álcool)...' },
    { key: 'socioeconomico', label: '9. Socioeconômico e Família', placeholder: 'Moradia, saneamento, renda, dinâmica familiar, apoio...' },
    { key: 'vacinacao', label: '10. Situação Vacinal', placeholder: 'Status vacinal atual, doses pendentes...' },
  ];

  return (
    <section className="space-y-10">
      {part === 'S' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">Subjetivo (S)</h2>
              <p className="text-sm text-[#617289] dark:text-gray-400">Identificação, Anamnese e relato do paciente.</p>
            </div>
            {patientType === PatientType.GERIATRIC && (
              <button 
                onClick={() => setIsIVCFModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-black text-xs border border-purple-200 hover:bg-purple-100 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">elderly</span>
                Avaliar IVCF-20
              </button>
            )}
          </div>

          <div className="space-y-10">
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-[#2d3748]">
              <IdentificationSection patientType={patientType} data={idData} onChange={onIdChange} />
            </div>

            <div className="grid grid-cols-1 gap-8">
              {subjectiveFields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={labelClass}>{f.label}</label>
                    <div className="flex gap-2">
                      {f.key === 'antPatologicos' && (patientType === PatientType.ADULT || patientType === PatientType.GERIATRIC) && (
                        <button 
                          onClick={() => setIsCVModalOpen(true)}
                          className="text-[10px] font-bold text-primary px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">favorite</span>
                          Risco CV
                        </button>
                      )}
                      <button 
                        onClick={() => handleRefineSubjective(f.key, f.label)} 
                        disabled={isRefining === f.key || !data.s[f.key]}
                        className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/5 rounded hover:bg-primary/10 transition-all disabled:opacity-30"
                      >
                        {isRefining === f.key ? 'Refinando...' : 'Refinar IA'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={data.s[f.key] as string}
                    onChange={(e) => onChange({ ...data, s: { ...data.s, [f.key]: e.target.value } })}
                    placeholder={f.placeholder}
                    className={`${inputClass} h-32 resize-none`}
                  />

                  {f.key === 'antPatologicos' && (
                    <div className="space-y-4">
                      {data.s.riscoCardiovascular && (
                        <div className={`mt-4 p-5 border-2 rounded-2xl animate-in zoom-in-95 ${getRiskStyles(data.s.riscoCardiovascularLevel)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Avaliação de Risco Cardiovascular</h4>
                            <button onClick={() => onChange({...data, s: {...data.s, riscoCardiovascular: '', riscoCardiovascularLevel: undefined}})} className="text-[10px] font-bold opacity-50 hover:opacity-100 transition-opacity">Remover</button>
                          </div>
                          <div className="text-[13px] font-semibold whitespace-pre-wrap leading-relaxed">
                            {data.s.riscoCardiovascular}
                          </div>
                        </div>
                      )}

                      {data.s.ivcf20Result && (
                        <div className="p-5 border-2 border-purple-200 bg-purple-50 rounded-2xl animate-in zoom-in-95 flex items-center gap-4">
                          <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-purple-200">
                            <span className="material-symbols-outlined text-purple-600">assignment_late</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-700 opacity-60">IVCF-20: Escore {data.s.ivcf20Score}</h4>
                            <div className="text-sm font-black leading-tight text-purple-900">{data.s.ivcf20Result}</div>
                          </div>
                          <button onClick={() => onChange({...data, s: {...data.s, ivcf20Score: undefined, ivcf20Result: ''}})} className="text-[10px] font-bold text-purple-400 hover:text-purple-600">Remover</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {part === 'O' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 italic">Objetivo Complementar (O)</h3>
            <button 
              onClick={handleRefineObjective} 
              disabled={isRefining === 'o' || !data.o}
              className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/5 rounded hover:bg-primary/10 transition-all"
            >
              {isRefining === 'o' ? 'Refinando...' : 'Refinar IA'}
            </button>
          </div>
          <textarea
            value={data.o}
            onChange={(e) => onChange({ ...data, o: e.target.value })}
            placeholder="Resultados de exames laboratoriais, imagem ou outros achados externos relevantes para o encontro atual..."
            className={`${inputClass} h-40 resize-none`}
          />
        </div>
      )}

      {part === 'AP' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2d3748] pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Avaliação (A)</h3>
              <button onClick={addAssessment} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                Novo Problema
              </button>
            </div>
            <div className="space-y-4">
              {data.assessments.map((a, index) => (
                <div key={a.id} className="flex gap-4 group animate-in slide-in-from-left-2 duration-300">
                  <div className="pt-3">
                    <span className="size-8 flex items-center justify-center bg-slate-100 dark:bg-[#2d3748] rounded-lg text-[11px] font-black text-primary border border-primary/20">A{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={a.text}
                      onChange={(e) => updateAssessment(a.id, e.target.value)}
                      placeholder="Ex: HAS descompensada, Diabetes Mellitus Tipo 2, Hipótese de Pneumonia..."
                      className={`${inputClass} h-20 resize-none`}
                    />
                    {data.assessments.length > 1 && (
                      <button onClick={() => removeAssessment(a.id)} className="text-[10px] text-red-400 font-bold hover:text-red-600 uppercase transition-colors">Remover A{index + 1}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2d3748] pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Plano (P)</h3>
              <button onClick={addPlan} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all">
                <span className="material-symbols-outlined text-sm">add_task</span>
                Nova Conduta
              </button>
            </div>
            <div className="space-y-8">
              {data.plans.map((p, index) => (
                <div key={p.id} className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-[#2d3748] space-y-4 animate-in slide-in-from-right-2 duration-300 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-white dark:bg-[#1a202c] px-2 py-1 rounded border border-slate-200 dark:border-[#2d3748] text-primary">PLANO P{index + 1}</span>
                    <button onClick={() => removePlan(p.id)} className="material-symbols-outlined text-slate-300 hover:text-red-500 transition-colors text-lg">delete</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Categoria do Plano</label>
                      <select 
                        value={p.category} 
                        onChange={(e) => updatePlan(p.id, { category: e.target.value as SoapPlanCategory })}
                        className={inputClass}
                      >
                        {Object.entries(categoryLabels).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Vincular a (A1, A2...)</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {data.assessments.map((a, i) => (
                          <button
                            key={a.id}
                            onClick={() => toggleLink(p.id, a.id)}
                            className={`px-2 py-1 rounded text-[10px] font-black transition-all border ${
                              p.linkedAssessments.includes(a.id)
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white dark:bg-[#1a202c] text-slate-400 border-slate-200 dark:border-[#2d3748] hover:border-primary/50'
                            }`}
                          >
                            A{i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={p.text}
                    onChange={(e) => updatePlan(p.id, { text: e.target.value })}
                    placeholder="Descreva a conduta (Exames solicitados, dose de medicação, orientações verbais...)"
                    className={`${inputClass} h-24 resize-none`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CVRiskModal 
        isOpen={isCVModalOpen} 
        onClose={() => setIsCVModalOpen(false)} 
        onCalculate={handleCVResult}
        defaultAge={idData.idade}
        defaultSex={idData.sexo}
      />

      <IVCF20Modal
        isOpen={isIVCFModalOpen}
        onClose={() => setIsIVCFModalOpen(false)}
        onCalculate={handleIVCFResult}
        defaultAge={idData.idade}
      />
    </section>
  );
};

export default SoapSection;

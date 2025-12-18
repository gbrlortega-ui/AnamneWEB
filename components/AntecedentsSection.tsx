
import React, { useState } from 'react';
import { Antecedents, PatientType, PediatricSubType, RiskLevel } from '../types';
import ClinicalGuidance from './ClinicalGuidance';
import CVRiskModal from './CVRiskModal';
import IVCF20Modal from './IVCF20Modal';

interface Props {
  data: Antecedents;
  patientType: PatientType;
  subType?: PediatricSubType;
  age?: string;
  sex?: string;
  onChange: (data: Antecedents) => void;
}

const AntecedentsSection: React.FC<Props> = ({ data, patientType, subType, age, sex, onChange }) => {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [isIVCFModalOpen, setIsIVCFModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const handleCVResult = (result: string, level: RiskLevel) => {
    onChange({ ...data, riscoCardiovascular: result, riscoCardiovascularLevel: level });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleIVCFResult = (score: number, resultText: string, level: 'LOW' | 'MODERATE' | 'HIGH') => {
    onChange({ ...data, ivcf20Score: score, ivcf20Result: resultText, ivcf20Level: level });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getRiskStyles = (level?: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-50 border-green-200 text-green-900';
      case 'MODERATE': return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'HIGH': return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'VERY_HIGH': return 'bg-red-50 border-red-300 text-red-900';
      case 'EXTREME': return 'bg-red-900 border-red-800 text-white'; 
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const getIVCFStyles = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'bg-green-50 border-green-200 text-green-900';
      case 'MODERATE': return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'HIGH': return 'bg-red-50 border-red-300 text-red-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const getSections = () => {
    const base = [
      { name: 'fisiologicos', label: 'Antecedentes Fisiológicos', hint: 'Desenvolvimento, Menarca/DUM.', placeholder: 'Desenvolvimento psicomotor, puberdade, histórico gineco-obstétrico completo...' },
      { name: 'patologicos', label: 'Antecedentes Patológicos', hint: 'Doenças, cirurgias, alergias, internações.', placeholder: 'HAS, DM, Cirurgias Prévias, Alergias Medicamentosas, Internações anteriores...' },
      { name: 'familiares', label: 'Antecedentes Familiares', hint: 'Doenças hereditárias, causas de óbito.', placeholder: 'Câncer, DCV precoce na família, Doenças genéticas, Diabetes...' },
      { name: 'habitos', label: 'Hábitos e Estilo de Vida', hint: 'Vícios, exercício e dieta.', placeholder: 'Tabagismo (Anos-maço), Etilismo (Tipo/Frequência), Atividade física (Min/semana), Padrão alimentar (Sal/Gordura/Ultraprocessados)...' },
      { name: 'psicossocial', label: 'Psicossocial e Moradia', hint: 'Saneamento, renda, apoio.', placeholder: 'Tipo de moradia, Saneamento básico, Escolaridade, Rede de apoio familiar...' },
    ];

    if (patientType === PatientType.PEDIATRIC) {
      return [
        { name: 'gestacional', label: 'Antecedentes Gestacionais', hint: 'Intercorrências na gravidez.', placeholder: 'Pré-natal, doenças na gestação, uso de drogas/medicamentos...' },
        { name: 'neonatal', label: 'Antecedentes Neonatais', hint: 'Parto, APGAR, triagens.', placeholder: 'Tipo de parto, peso, comprimento, perímetro cefálico, teste do pezinho...' },
        { name: 'dnpm', label: 'Desenvolvimento (DNPM)', hint: 'Marcos do desenvolvimento.', placeholder: 'Sustentou a cabeça, sentou, andou, falou as primeiras palavras...' },
        { name: 'vacinacao', label: 'Vacinação', hint: 'Calendário PNI.', placeholder: 'Vacinas em dia, atrasos, reações vacinais...' },
        ...base
      ];
    }

    if (patientType === PatientType.GERIATRIC) {
      return [
        ...base,
        { name: 'funcionalidade', label: 'Avaliação Funcional', hint: 'AVDs e AIVDs.', placeholder: 'Independência para banho, vestir-se, alimentação (AVD). Uso de telefone, transporte, finanças (AIVD)...' },
        { name: 'polifarmacia', label: 'Polifarmácia e Medicações', hint: 'Uso de >5 medicamentos.', placeholder: 'Lista de todos os medicamentos, automedicação, adesão ao tratamento, efeitos colaterais...' },
      ];
    }

    return base;
  };

  const sections = getSections();
  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600";
  const labelClass = "text-sm font-bold text-[#111418] dark:text-white";

  return (
    <section className="space-y-6 relative">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">Antecedentes e Hábitos</h2>
          <p className="text-sm text-[#617289] dark:text-gray-400">Histórico de vida e perfil de saúde do paciente.</p>
        </div>
        <div className="flex gap-2">
          {(patientType === PatientType.ADULT || patientType === PatientType.GERIATRIC) && (
            <button 
              onClick={() => setIsCVModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-xl font-black text-xs border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              Risco CV
            </button>
          )}
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
      </div>

      <ClinicalGuidance patientType={patientType} subType={subType} section="antecedents" />

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          Avaliação aplicada com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {sections.map((s) => (
          <div key={s.name}>
            <div className="flex justify-between items-baseline mb-2">
              <label className={labelClass}>{s.label}</label>
              <span className="text-[11px] text-[#617289] dark:text-gray-500 font-medium italic">{s.hint}</span>
            </div>
            <textarea
              name={s.name}
              value={(data as any)[s.name] || ''}
              onChange={handleChange}
              placeholder={s.placeholder}
              className={`${inputClass} h-32 resize-none`}
            />
            
            {s.name === 'patologicos' && (
              <div className="space-y-4 mt-4">
                {/* Bloco Risco CV */}
                {data.riscoCardiovascular && (
                  <div className={`p-5 border-2 rounded-2xl animate-in zoom-in-95 shadow-sm flex items-center gap-4 ${getRiskStyles(data.riscoCardiovascularLevel)}`}>
                    <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0 border shadow-sm">
                      <span className="material-symbols-outlined text-primary">favorite</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Risco Cardiovascular (OPAS)</h4>
                      <div className="text-sm font-black leading-tight">{data.riscoCardiovascular}</div>
                    </div>
                    <button onClick={() => onChange({...data, riscoCardiovascular: '', riscoCardiovascularLevel: undefined})} className="text-[10px] font-bold opacity-50 hover:opacity-100">Remover</button>
                  </div>
                )}

                {/* Bloco IVCF-20 */}
                {data.ivcf20Result && (
                  <div className={`p-5 border-2 rounded-2xl animate-in zoom-in-95 shadow-sm flex items-center gap-4 ${getIVCFStyles(data.ivcf20Level)}`}>
                    <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0 border shadow-sm">
                      <span className="material-symbols-outlined text-purple-600">assignment_late</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">IVCF-20: Escore {data.ivcf20Score}</h4>
                      <div className="text-sm font-black leading-tight">{data.ivcf20Result}</div>
                    </div>
                    <button onClick={() => onChange({...data, ivcf20Score: undefined, ivcf20Result: '', ivcf20Level: undefined})} className="text-[10px] font-bold opacity-50 hover:opacity-100">Remover</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <CVRiskModal 
        isOpen={isCVModalOpen} 
        onClose={() => setIsCVModalOpen(false)} 
        onCalculate={handleCVResult}
        defaultAge={age || ''}
        defaultSex={sex || ''}
      />

      <IVCF20Modal
        isOpen={isIVCFModalOpen}
        onClose={() => setIsIVCFModalOpen(false)}
        onCalculate={handleIVCFResult}
        defaultAge={age || ''}
      />
    </section>
  );
};

export default AntecedentsSection;

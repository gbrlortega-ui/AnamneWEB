
import React from 'react';
import { PatientType, PediatricSubType } from '../types';

interface GuidanceProps {
  patientType: PatientType;
  subType?: PediatricSubType;
  section: 'history' | 'antecedents' | 'exam';
}

const ClinicalGuidance: React.FC<GuidanceProps> = ({ patientType, subType, section }) => {
  const getGuidance = () => {
    // PEDIATRIA
    if (patientType === PatientType.PEDIATRIC) {
      switch (subType) {
        case PediatricSubType.NEONATE:
          return {
            title: "Foco Neonatal (0-28 dias)",
            items: section === 'antecedents' 
              ? ["Tipo de Parto e APGAR", "Triagens: Pezinho, Orelhinha, Olhinho, Coração", "Peso ao nascer e alta", "Aleitamento Materno Exclusivo"]
              : ["Icterícia neonatal", "Padrão de sono", "Eliminação de mecônio", "Reflexos: Moro, Sucção, Preensão"]
          };
        case PediatricSubType.INFANT:
          return {
            title: "Foco Lactante (29 dias - 2 anos)",
            items: section === 'antecedents'
              ? ["Vacinação (Penta, VIP, Pneumo)", "DNPM: Sustento (3m), Rolar (4m), Sentar (6m)", "Introdução Alimentar (6m)"]
              : ["Ganho de peso/estatura", "Erupção dentária", "Sono e Higiene", "Desenvolvimento motor fino"]
          };
        case PediatricSubType.PRE_SCHOOL:
          return {
            title: "Foco Pré-Escolar (2-6 anos)",
            items: ["Controle esfincteriano", "Socialização", "Vocabulário", "Prevenção de acidentes domésticos", "Atividade lúdica"]
          };
        case PediatricSubType.SCHOOL:
          return {
            title: "Foco Escolar (6-12 anos)",
            items: ["Rendimento acadêmico", "Bullying", "Prática de esportes", "Saúde bucal", "Visão e Audição"]
          };
        case PediatricSubType.ADOLESCENT:
          return {
            title: "Foco Adolescente (HEEADSSS)",
            items: ["H: Home (Casa)", "E: Education (Escola)", "E: Eating (Dieta)", "A: Activities (Atividades)", "D: Drugs (Drogas)", "S: Sexuality (Sexualidade)", "S: Suicide (Humor)", "S: Safety (Segurança)", "Marcos Puberais (Tanner)"]
          };
        default: return null;
      }
    }

    // ADULTO
    if (patientType === PatientType.ADULT) {
      return {
        title: "Foco Adulto",
        items: ["Risco Cardiovascular", "Hábitos: Tabagismo/Etilismo", "Histórico ocupacional", "Rastreio: Preventivo/Mamografia", "Atividade física"]
      };
    }

    // GERIATRIA
    if (patientType === PatientType.GERIATRIC) {
      return {
        title: "Avaliação Geriátrica Ampla (AGA)",
        items: ["Risco Cardiovascular", "Funcionalidade (AVDs e AIVDs)", "Cognição (Mini-Mental/Clock Test)", "Fragilidade e Sarcopenia", "Polifarmácia (>5 meds)", "Risco de Quedas", "Suporte Social"]
      };
    }

    return null;
  };

  const guidance = getGuidance();
  if (!guidance) return null;

  return (
    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
      <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">clinical_notes</span>
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">{guidance.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {guidance.items.map((item, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-600 dark:text-gray-300 flex items-center gap-1.5 bg-white dark:bg-white/5 px-2 py-0.5 rounded-md shadow-sm border border-slate-100 dark:border-white/10">
              <span className="size-1 bg-primary rounded-full"></span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicalGuidance;

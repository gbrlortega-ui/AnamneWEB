
import React, { useMemo } from 'react';
import { ClinicalRecord, FormStep, PatientType, RiskLevel } from '../types';
import { parseAgeToMonths, classifyAdultBMI, getVitalSignsInterpretation } from '../services/growthService';

interface Props {
  record: ClinicalRecord;
  onEdit: (step: FormStep) => void;
  onUpdateRecord: (updates: Partial<ClinicalRecord>) => void;
}

const SummarySection: React.FC<Props> = ({ record }) => {
  const ageMonths = useMemo(() => parseAgeToMonths(record.id.idade), [record.id.idade]);
  const ageYears = ageMonths / 12;

  const handlePrint = () => {
    window.focus();
    setTimeout(() => { window.print(); }, 100);
  };

  const bmiInterpretation = useMemo(() => {
    if (record.patientType === PatientType.PEDIATRIC) return null;
    return classifyAdultBMI(parseFloat(record.exameFisico.sinaisVitais.imc || '0'), ageYears);
  }, [record.exameFisico.sinaisVitais.imc, ageYears, record.patientType]);

  const vitalStatus = useMemo(() => 
    getVitalSignsInterpretation(record.exameFisico.sinaisVitais, ageMonths, record.patientType),
  [record.exameFisico.sinaisVitais, ageMonths, record.patientType]);

  const labelMap: Record<string, string> = {
    geral: 'Geral/Constitucional', cabecaPescoco: 'Cabeça e Pescoço', torax: 'Tórax/Cardiorrespiratório',
    abdome: 'Abdome/Gastrintestinal', genitourinario: 'Genitourinário', 
    musculoEsqueletico: 'Músculo-Esquelético', nervoso: 'Nervoso e Psíquico',
    crescimento: 'Crescimento e Desenv.', cognitivo: 'Cognitivo/Comportamental',
    fisiologicos: 'Fisiológicos', patologicos: 'Patológicos', familiares: 'Familiares',
    habitos: 'Hábitos e Estilo de Vida', psicossocial: 'Socioeconômico/Moradia',
    gestacional: 'Gestacionais', neonatal: 'Neonatais', dnpm: 'DNPM', 
    vacinacao: 'Vacinação', funcionalidade: 'Funcionalidade', polifarmacia: 'Polifarmácia',
    peleAnexos: 'Pele e Anexos', aparelhoRespiratorio: 'Aparelho Respiratório',
    aparelhoCardiovascular: 'Aparelho Cardiovascular', aparelhoGenitourinario: 'Aparelho Genitourinário',
    aparelhoMusculoEsqueletico: 'Aparelho Músculo-Esquelético', extremidades: 'Extremidades e Pulsos',
    neurologico: 'Exame Neurológico', fontanelas: 'Fontanelas'
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

  const hasContent = (val: any) => val !== undefined && val !== null && val !== '' && val !== '0' && (typeof val !== 'object' || Object.keys(val).length > 0);

  return (
    <div id="clinical-summary" className="p-4 bg-white min-h-[70vh] text-slate-900 font-sans print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          #clinical-summary { width: 100% !important; margin: 0 !important; }
          section { page-break-inside: avoid; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
          .text-block { page-break-inside: auto; }
        }
        .text-wrap-fix { word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
      `}} />

      {/* CABEÇALHO */}
      <header className="mb-8 flex justify-between items-start border-b-4 border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registro Clínico AnamneWEB</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          <button onClick={handlePrint} className="no-print mt-2 bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg">
            Imprimir / Salvar PDF
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {/* 1. IDENTIFICAÇÃO */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Paciente</label>
            <p className="text-sm font-bold text-wrap-fix">{record.id.nome || 'N/D'}</p>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Idade</label>
            <p className="text-sm font-bold">{record.id.idade || '--'}</p>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Sexo</label>
            <p className="text-sm font-bold">{record.id.sexo || '--'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Profissão/Ocupação</label>
            <p className="text-sm font-bold text-wrap-fix">{record.id.profissao || 'N/D'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Residência/Procedência</label>
            <p className="text-sm font-bold text-wrap-fix">{record.id.residencia || 'N/D'}</p>
          </div>
        </section>

        {/* 2. ANAMNESE */}
        <section className="text-block">
          <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4 border-l-4 border-blue-600 pl-3">I. Anamnese e Histórico</h3>
          <div className="space-y-5">
            {record.qd && (
              <div className="bg-white p-3 border border-slate-100 rounded-lg">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-[13px] font-medium text-slate-800 text-wrap-fix">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="bg-slate-50/50 p-4 rounded-xl border-l-4 border-slate-300">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">História da Moléstia Atual (HMA)</span>
                <p className="text-[13px] leading-relaxed text-slate-700 text-wrap-fix">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. ISDA E ANTECEDENTES (DINÂMICO) */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section className="text-block">
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4 border-l-4 border-blue-600 pl-3">II. Revisão de Sistemas e Antecedentes</h3>
            
            {/* RISCOS CALCULADOS COM CORES DE DESTAQUE */}
            <div className="flex flex-wrap gap-4 mb-6">
              {record.antecedentes.riscoCardiovascular && (
                <div className={`px-4 py-2 rounded-xl border-2 shadow-sm flex items-center gap-3 ${getRiskStyles(record.antecedentes.riscoCardiovascularLevel)}`}>
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  <div>
                    <span className="text-[7px] font-black uppercase block opacity-70">Risco Cardiovascular</span>
                    <span className="text-[11px] font-bold">{record.antecedentes.riscoCardiovascular}</span>
                  </div>
                </div>
              )}
              {record.antecedentes.ivcf20Result && (
                <div className={`px-4 py-2 rounded-xl border-2 shadow-sm flex items-center gap-3 ${getIVCFStyles(record.antecedentes.ivcf20Level)}`}>
                  <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                  <div>
                    <span className="text-[7px] font-black uppercase block opacity-70">IVCF-20 (Escore: {record.antecedentes.ivcf20Score})</span>
                    <span className="text-[11px] font-bold">{record.antecedentes.ivcf20Result}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {/* ISDA */}
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-700 text-wrap-fix">{val}</p>
                </div>
              ))}
              {/* ANTECEDENTES */}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('riscoCardiovascular') || key.includes('ivcf20')) return null;
                return (
                  <div key={key}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">{labelMap[key] || key}</span>
                    <p className="text-[11px] text-slate-700 text-wrap-fix">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. EXAME FÍSICO E SINAIS VITAIS */}
        <section className="text-block">
          <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-3">III. Exame Físico Objetivo</h3>
          
          {/* GRID SINAIS VITAIS - FIXO E SEGURO */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8 mb-8">
            {[
              { label: 'PA (mmHg)', val: record.exameFisico.sinaisVitais.pa, eval: vitalStatus.pa },
              { label: 'FC (bpm)', val: record.exameFisico.sinaisVitais.fc, eval: vitalStatus.fc },
              { label: 'FR (irpm)', val: record.exameFisico.sinaisVitais.fr, eval: vitalStatus.fr },
              { label: 'SAT (%)', val: record.exameFisico.sinaisVitais.sat, eval: vitalStatus.sat },
              { label: 'TEMP (°C)', val: record.exameFisico.sinaisVitais.temp, eval: vitalStatus.temp },
              { label: 'IMC', val: record.exameFisico.sinaisVitais.imc, eval: bmiInterpretation }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 w-full h-12 flex flex-col justify-center items-center">
                  <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1">{item.label}</span>
                  <span className="text-xs font-black text-slate-900 leading-none">{item.val || '--'}</span>
                </div>
                {item.eval?.label && (
                  <div className="w-full text-center mt-1.5">
                    <span className={`text-[8px] font-black uppercase leading-tight ${item.eval.color}`}>
                      {item.eval.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="border-b border-slate-50 pb-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">{labelMap[key] || key}</span>
                  <p className="text-[12px] text-slate-700 leading-snug text-wrap-fix">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. SÍNTESE E CONDUTA */}
        <section className="text-block bg-blue-50/20 p-6 rounded-3xl border border-blue-100">
          <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4">IV. Síntese e Conduta Clínica</h3>
          <div className="grid grid-cols-1 gap-6">
            {record.fatoresRisco && (
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">Raciocínio e Riscos</span>
                <p className="text-[13px] text-slate-700 italic text-wrap-fix">{record.fatoresRisco}</p>
              </div>
            )}
            {record.conduta && (
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-[9px] font-black text-blue-800 uppercase block mb-2">Plano Terapêutico e Orientações</span>
                <p className="text-[13px] font-medium text-slate-900 leading-relaxed text-wrap-fix">{record.conduta}</p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <footer className="mt-20 pt-10 border-t border-slate-200 flex justify-between items-end px-4">
          <div className="text-center w-64 border-t-2 border-slate-900 pt-3">
            <p className="text-xs font-black uppercase text-slate-900">{record.id.nome || 'ESTUDANTE'}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Acadêmico de Medicina</p>
          </div>
          <div className="text-center w-64 border-t border-slate-300 pt-3">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Preceptor / Responsável</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SummarySection;

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
      case 'LOW': return 'border-green-400 text-green-900 bg-green-50/30';
      case 'MODERATE': return 'border-yellow-400 text-yellow-900 bg-yellow-50/30';
      case 'HIGH': return 'border-orange-400 text-orange-900 bg-orange-50/30';
      case 'VERY_HIGH': return 'border-red-400 text-red-900 bg-red-50/30';
      case 'EXTREME': return 'border-red-900 text-red-900 bg-red-100'; 
      default: return 'border-slate-200 text-slate-900';
    }
  };

  // Fix: Added missing getIVCFStyles function
  const getIVCFStyles = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'border-green-400 text-green-900 bg-green-50/30';
      case 'MODERATE': return 'border-yellow-400 text-yellow-900 bg-yellow-50/30';
      case 'HIGH': return 'border-red-400 text-red-900 bg-red-50/30';
      default: return 'border-slate-200 text-slate-900';
    }
  };

  const hasContent = (val: any) => val !== undefined && val !== null && val !== '' && val !== '0' && (typeof val !== 'object' || Object.keys(val).length > 0);

  return (
    <div id="clinical-summary" className="p-4 bg-white min-h-[70vh] text-slate-900 font-sans print:p-0 overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: A4; 
            margin: 2cm; 
          }
          body { 
            background: white !important; 
            color: black !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .no-print { display: none !important; }
          #clinical-summary { 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important;
            box-shadow: none !important;
          }
          section { 
            page-break-inside: avoid; 
            break-inside: avoid;
            margin-bottom: 24px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 16px;
          }
          .info-block {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .text-block { 
             page-break-inside: auto; 
             break-inside: auto;
          }
          h3 {
            margin-bottom: 12px !important;
            color: #1d4ed8 !important;
          }
          .text-wrap-fix { 
            word-break: break-word; 
            overflow-wrap: break-word; 
            white-space: pre-wrap;
            font-size: 11pt;
            line-height: 1.5;
          }
          .vital-card {
            border: 1px solid #ddd !important;
            background: #fafafa !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        .text-wrap-fix { word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
      `}} />

      {/* CABEÇALHO */}
      <header className="mb-8 flex justify-between items-end border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registro Clínico AnamneWEB</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Tipo de Atendimento: {record.patientType} {record.pediatricSubType ? `| Subtipo: ${record.pediatricSubType}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-700">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          <button onClick={handlePrint} className="no-print mt-3 bg-primary hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto sm:mx-0">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Gerar PDF Oficial
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {/* 1. IDENTIFICAÇÃO */}
        <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 info-block">
          <div className="col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Paciente</label>
            <p className="text-sm font-bold text-slate-900 text-wrap-fix uppercase">{record.id.nome || 'Não Identificado'}</p>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Idade</label>
            <p className="text-sm font-bold text-slate-900">{record.id.idade || '--'}</p>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sexo</label>
            <p className="text-sm font-bold text-slate-900">{record.id.sexo || '--'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Profissão/Ocupação</label>
            <p className="text-sm font-semibold text-slate-700 text-wrap-fix">{record.id.profissao || 'Não informada'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Procedência/Residência</label>
            <p className="text-sm font-semibold text-slate-700 text-wrap-fix">{record.id.residencia || 'Não informada'}</p>
          </div>
        </section>

        {/* 2. ANAMNESE */}
        <section className="text-block">
          <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em] mb-4 border-l-4 border-blue-600 pl-3">I. História Clínica</h3>
          <div className="space-y-6">
            {record.qd && (
              <div className="info-block">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Queixa Principal (QD)</span>
                <p className="text-[14px] font-bold text-slate-900 text-wrap-fix">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="text-block bg-slate-50/30 p-5 rounded-2xl border-l-4 border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">História da Moléstia Atual (HMA)</span>
                <p className="text-[13px] leading-relaxed text-slate-800 text-wrap-fix">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. REVISÃO E ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section className="text-block">
            <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em] mb-6 border-l-4 border-blue-600 pl-3">II. Revisão de Sistemas e Antecedentes</h3>
            
            {/* ALERTAS DE RISCO */}
            <div className="flex flex-wrap gap-4 mb-6">
              {record.antecedentes.riscoCardiovascular && (
                <div className={`px-5 py-2.5 rounded-2xl border-2 shadow-sm flex items-center gap-3 info-block ${getRiskStyles(record.antecedentes.riscoCardiovascularLevel)}`}>
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  <div>
                    <span className="text-[8px] font-black uppercase block opacity-70 leading-none mb-1">Risco CV (OMS/OPAS)</span>
                    <span className="text-[12px] font-black">{record.antecedentes.riscoCardiovascular}</span>
                  </div>
                </div>
              )}
              {record.antecedentes.ivcf20Result && (
                <div className={`px-5 py-2.5 rounded-2xl border-2 shadow-sm flex items-center gap-3 info-block ${getIVCFStyles(record.antecedentes.ivcf20Level)}`}>
                  <span className="material-symbols-outlined text-[18px]">elderly</span>
                  <div>
                    <span className="text-[8px] font-black uppercase block opacity-70 leading-none mb-1">IVCF-20 (Escore: {record.antecedentes.ivcf20Score})</span>
                    <span className="text-[12px] font-black">{record.antecedentes.ivcf20Result}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* ISDA - Itens Individuais com avoid break */}
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="info-block border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-700 text-wrap-fix leading-normal">{val}</p>
                </div>
              ))}
              {/* ANTECEDENTES - Itens Individuais com avoid break */}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('riscoCardiovascular') || key.includes('ivcf20')) return null;
                return (
                  <div key={key} className="info-block border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">{labelMap[key] || key}</span>
                    <p className="text-[11px] text-slate-700 text-wrap-fix leading-normal">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. EXAME FÍSICO */}
        <section className="text-block">
          <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em] mb-6 border-l-4 border-blue-600 pl-3">III. Exame Físico e Sinais Vitais</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'PA (mmHg)', val: record.exameFisico.sinaisVitais.pa, eval: vitalStatus.pa },
              { label: 'FC (bpm)', val: record.exameFisico.sinaisVitais.fc, eval: vitalStatus.fc },
              { label: 'FR (irpm)', val: record.exameFisico.sinaisVitais.fr, eval: vitalStatus.fr },
              { label: 'SAT (%)', val: record.exameFisico.sinaisVitais.sat, eval: vitalStatus.sat },
              { label: 'TEMP (°C)', val: record.exameFisico.sinaisVitais.temp, eval: vitalStatus.temp },
              { label: 'IMC', val: record.exameFisico.sinaisVitais.imc, eval: bmiInterpretation }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center vital-card p-3 rounded-2xl border border-slate-100 bg-slate-50/30 info-block">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.label}</span>
                <span className="text-sm font-black text-slate-900 mb-1">{item.val || '--'}</span>
                {item.eval?.label && (
                  <span className={`text-[7px] font-black uppercase tracking-widest text-center leading-none ${item.eval.color}`}>
                    {item.eval.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-5">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="info-block border-b border-slate-50 pb-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-[12px] text-slate-800 leading-relaxed text-wrap-fix">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. SÍNTESE E CONDUTA */}
        <section className="text-block bg-blue-50/10 p-8 rounded-[2.5rem] border border-blue-100/50">
          <h3 className="text-[11px] font-black text-blue-800 uppercase tracking-[0.2em] mb-6">IV. Hipóteses e Conduta Clínica</h3>
          <div className="grid grid-cols-1 gap-8">
            {record.fatoresRisco && (
              <div className="info-block">
                <span className="text-[9px] font-black text-blue-600 uppercase block mb-2 tracking-widest">Raciocínio Clínico / Riscos</span>
                <p className="text-[13px] text-slate-700 italic text-wrap-fix bg-white p-4 rounded-xl border border-blue-50 leading-relaxed">
                  {record.fatoresRisco}
                </p>
              </div>
            )}
            {record.conduta && (
              <div className="text-block">
                <span className="text-[9px] font-black text-blue-800 uppercase block mb-2 tracking-widest">Plano de Cuidados e Orientações</span>
                <p className="text-[14px] font-semibold text-slate-900 leading-relaxed text-wrap-fix bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
                  {record.conduta}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS - Sempre evitam quebra no meio */}
        <footer className="mt-20 pt-12 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-12 sm:gap-4 px-6 info-block">
          <div className="text-center w-full sm:w-72 border-t-2 border-slate-900 pt-3">
            <p className="text-xs font-black uppercase text-slate-900">{record.id.nome || 'ESTUDANTE'}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Responsável pelo Preenchimento</p>
          </div>
          <div className="text-center w-full sm:w-72 border-t border-slate-300 pt-3">
            <p className="text-xs font-black uppercase text-slate-900 invisible">Assinatura</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Carimbo e Assinatura do Preceptor</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SummarySection;

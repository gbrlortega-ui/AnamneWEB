
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
    <div id="clinical-summary-container" className="p-0 bg-transparent overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Reset de containers para permitir paginação */
          html, body, #root, main, .relative.flex.h-screen {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            background: white !important;
          }
          
          .no-print, aside, nav, footer.no-print {
            display: none !important;
          }

          @page { 
            size: A4; 
            margin: 2.5cm 2cm 2.5cm 2cm; 
          }

          #clinical-summary-container {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #clinical-summary { 
            display: block !important;
            width: 100% !important; 
            background: white !important; 
            color: black !important;
          }

          section { 
            display: block !important;
            page-break-inside: auto; 
            break-inside: auto;
            margin-bottom: 30px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 20px;
          }

          /* Forçar quebra de página antes de seções principais se necessário */
          .page-break-before {
            page-break-before: always;
            break-before: page;
            margin-top: 2cm;
          }

          h3 {
            page-break-after: avoid;
            break-after: avoid;
            margin-bottom: 15px !important;
            color: #1d4ed8 !important;
            font-size: 12pt !important;
            border-left: 4px solid #1d4ed8;
            padding-left: 10px;
          }

          .info-block-card {
            page-break-inside: avoid;
            break-inside: avoid;
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }

          .text-content {
            font-size: 11pt;
            line-height: 1.6;
            word-wrap: break-word;
            white-space: pre-wrap;
            color: #1f2937;
          }

          .vital-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .signature-area {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 50px;
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
        }
      `}} />

      <div id="clinical-summary" className="p-4 md:p-8 bg-white text-slate-900 font-sans print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-8 flex justify-between items-end border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registro Clínico AnamneWEB</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Atendimento: {record.patientType} {record.pediatricSubType ? `| ${record.pediatricSubType}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Data: {new Date().toLocaleDateString('pt-BR')}</p>
            <button onClick={handlePrint} className="no-print mt-3 bg-primary hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Gerar PDF / Imprimir
            </button>
          </div>
        </header>

        {/* 1. IDENTIFICAÇÃO */}
        <section className="info-block-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Paciente</label>
              <p className="text-sm font-bold text-slate-900 uppercase">{record.id.nome || 'Não Identificado'}</p>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Idade</label>
              <p className="text-sm font-bold text-slate-900">{record.id.idade || '--'}</p>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sexo</label>
              <p className="text-sm font-bold text-slate-900">{record.id.sexo || '--'}</p>
            </div>
          </div>
        </section>

        {/* 2. HISTÓRIA CLÍNICA */}
        <section>
          <h3 className="text-sm font-black text-blue-700 uppercase tracking-wider mb-4">I. História Clínica</h3>
          <div className="space-y-6">
            {record.qd && (
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-[14px] font-bold text-slate-900">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">História da Moléstia Atual (HMA)</span>
                <p className="text-content">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. ISDA E ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wider mb-6">II. Revisão de Sistemas e Antecedentes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-100 pb-2 break-inside-avoid">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-700">{val}</p>
                </div>
              ))}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('riscoCardiovascular') || key.includes('ivcf20')) return null;
                return (
                  <div key={key} className="border-b border-slate-100 pb-2 break-inside-avoid">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                    <p className="text-[11px] text-slate-700">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. EXAME FÍSICO (Geralmente começa em nova página se o ISDA for longo) */}
        <section className="page-break-before">
          <h3 className="text-sm font-black text-blue-700 uppercase tracking-wider mb-6">III. Exame Físico e Sinais Vitais</h3>
          
          <div className="vital-grid mb-8">
            {[
              { label: 'PA', val: record.exameFisico.sinaisVitais.pa },
              { label: 'FC', val: record.exameFisico.sinaisVitais.fc },
              { label: 'FR', val: record.exameFisico.sinaisVitais.fr },
              { label: 'SAT', val: record.exameFisico.sinaisVitais.sat },
              { label: 'TEMP', val: record.exameFisico.sinaisVitais.temp },
              { label: 'IMC', val: record.exameFisico.sinaisVitais.imc }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 break-inside-avoid">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.label}</span>
                <span className="text-sm font-black text-slate-900">{item.val || '--'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="pb-3 break-inside-avoid">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-800 leading-relaxed">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. HIPÓTESES E CONDUTA */}
        <section className="page-break-before">
          <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider mb-6">IV. Hipóteses e Conduta Clínica</h3>
          <div className="space-y-6">
            {record.fatoresRisco && (
              <div className="break-inside-avoid">
                <span className="text-[9px] font-black text-blue-600 uppercase block mb-2">Raciocínio Clínico</span>
                <p className="text-[12px] text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-100 text-content">
                  {record.fatoresRisco}
                </p>
              </div>
            )}
            {record.conduta && (
              <div>
                <span className="text-[9px] font-black text-blue-800 uppercase block mb-2">Plano de Cuidados / Prescrição</span>
                <p className="text-content font-semibold bg-white p-6 rounded-2xl border-2 border-blue-100">
                  {record.conduta}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <footer className="signature-area pt-10 border-t border-slate-200">
          <div className="text-center w-72 border-t-2 border-slate-900 pt-3">
            <p className="text-xs font-black uppercase">{record.id.nome || 'ESTUDANTE'}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acadêmico Responsável</p>
          </div>
          <div className="text-center w-72 border-t border-slate-300 pt-3">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Preceptor / Carimbo e CRM</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SummarySection;

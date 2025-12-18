
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

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'border-green-500 text-green-700 bg-green-50';
      case 'MODERATE': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      case 'HIGH': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'VERY_HIGH': return 'border-red-500 text-red-700 bg-red-50';
      case 'EXTREME': return 'border-red-900 text-red-900 bg-red-100';
      default: return 'border-slate-200 text-slate-600 bg-slate-50';
    }
  };

  const getIVCFColor = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'border-green-500 text-green-700 bg-green-50';
      case 'MODERATE': return 'border-yellow-600 text-yellow-800 bg-yellow-50';
      case 'HIGH': return 'border-red-600 text-red-800 bg-red-50';
      default: return 'border-slate-200 text-slate-600 bg-slate-50';
    }
  };

  const hasContent = (val: any) => val !== undefined && val !== null && val !== '' && val !== '0' && (typeof val !== 'object' || Object.keys(val).length > 0);

  // Pega dados de risco tanto do modelo tradicional quanto do SOAP
  const cvRisk = record.antecedentes.riscoCardiovascular || record.soap?.s.riscoCardiovascular;
  const cvLevel = record.antecedentes.riscoCardiovascularLevel || record.soap?.s.riscoCardiovascularLevel;
  const ivcfResult = record.antecedentes.ivcf20Result || record.soap?.s.ivcf20Result;
  const ivcfScore = record.antecedentes.ivcf20Score || record.soap?.s.ivcf20Score;
  const ivcfLevel = record.antecedentes.ivcf20Level;

  return (
    <div id="clinical-summary-print-root" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* RESET DE CONTAINERS PARA IMPRESSÃO MULTIPÁGINA */
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root, main, .flex, .flex-col, .h-screen, .overflow-hidden, .overflow-y-auto {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
          }
          
          .no-print, aside, nav, button, footer {
            display: none !important;
          }

          @page { 
            size: A4; 
            margin: 2.5cm 1.5cm; 
          }

          #clinical-summary-print-root {
            width: 100% !important;
            background: white !important;
          }

          section { 
            display: block !important;
            width: 100% !important;
            page-break-inside: auto; 
            break-inside: auto;
            margin-bottom: 30px !important;
            padding-bottom: 20px !important;
            border-bottom: 1px solid #e5e7eb !important;
          }

          h3 {
            page-break-after: avoid;
            break-after: avoid;
            color: #1e40af !important;
            border-left: 5px solid #1e40af !important;
            padding-left: 12px !important;
            margin-bottom: 20px !important;
            font-size: 14pt !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
          }

          .info-block-card {
            page-break-inside: avoid;
            break-inside: avoid;
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 15px !important;
            margin-bottom: 15px !important;
          }

          .text-content {
            font-size: 11pt !important;
            line-height: 1.6 !important;
            color: #000 !important;
            white-space: pre-wrap !important;
          }

          .vital-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }

          .vital-item {
            width: 30% !important;
            border: 1px solid #cbd5e1 !important;
            padding: 10px !important;
            border-radius: 8px !important;
            text-align: center !important;
          }

          .signature-box {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 50px !important;
            border-top: 1px solid #000 !important;
            padding-top: 10px !important;
            width: 45% !important;
            text-align: center !important;
          }
        }
      `}} />

      <div id="clinical-summary" className="p-4 md:p-8 bg-white text-slate-900 font-sans print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-10 flex justify-between items-end border-b-4 border-blue-900 pb-6">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter">PRONTUÁRIO CLÍNICO</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">AnamneWEB - Sistema de Apoio ao Acadêmico</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <button onClick={handlePrint} className="no-print mt-3 bg-primary hover:bg-blue-700 text-white px-10 py-3 rounded-2xl text-xs font-black shadow-xl transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">print</span>
              GERAR PDF PARA IMPRESSÃO
            </button>
          </div>
        </header>

        {/* 1. IDENTIFICAÇÃO */}
        <section className="info-block-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Paciente</label>
              <p className="text-base font-black text-slate-900 uppercase">{record.id.nome || 'Não Identificado'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Idade</label>
              <p className="text-base font-bold text-slate-900">{record.id.idade || '--'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Sexo</label>
              <p className="text-base font-bold text-slate-900">{record.id.sexo || '--'}</p>
            </div>
          </div>
        </section>

        {/* 2. HISTÓRIA CLÍNICA */}
        <section>
          <h3>I. História Clínica</h3>
          <div className="space-y-8">
            {record.qd && (
              <div className="info-block-card !bg-white">
                <span className="text-[10px] font-black text-blue-600 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-lg font-bold text-slate-900">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2">História da Moléstia Atual (HMA)</span>
                <p className="text-content">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. ESCALAS DE RISCO (GERIATRIA/ADULTO) */}
        {(cvRisk || ivcfResult) && (
          <section>
            <h3>II. Avaliações e Escalas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cvRisk && (
                <div className={`p-5 border-2 rounded-2xl ${getRiskColor(cvLevel)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Risco Cardiovascular Global</span>
                  </div>
                  <p className="text-sm font-black">{cvRisk}</p>
                </div>
              )}
              {ivcfResult && (
                <div className={`p-5 border-2 rounded-2xl ${getIVCFColor(ivcfLevel)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined">elderly</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Avaliação IVCF-20 (Escore: {ivcfScore})</span>
                  </div>
                  <p className="text-sm font-black">{ivcfResult}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. REVISÃO DE SISTEMAS E ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section>
            <h3>III. Revisão de Sistemas e Antecedentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-xs text-slate-700">{val}</p>
                </div>
              ))}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('riscoCardiovascular') || key.includes('ivcf20')) return null;
                return (
                  <div key={key} className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                    <p className="text-xs text-slate-700">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. EXAME FÍSICO */}
        <section>
          <h3>IV. Exame Físico e Biometria</h3>
          
          <div className="vital-grid mb-10">
            {[
              { label: 'PA (mmHg)', val: record.exameFisico.sinaisVitais.pa },
              { label: 'FC (bpm)', val: record.exameFisico.sinaisVitais.fc },
              { label: 'FR (irpm)', val: record.exameFisico.sinaisVitais.fr },
              { label: 'SAT (%)', val: record.exameFisico.sinaisVitais.sat },
              { label: 'TEMP (°C)', val: record.exameFisico.sinaisVitais.temp },
              { label: 'IMC', val: record.exameFisico.sinaisVitais.imc }
            ].map((item, i) => (
              <div key={i} className="vital-item">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{item.label}</span>
                <span className="text-base font-black text-slate-900">{item.val || '--'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="pb-4 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-content !text-[12px]">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. CONDUTA E PLANO */}
        <section>
          <h3>V. Síntese e Plano Terapêutico</h3>
          <div className="space-y-8">
            {record.fatoresRisco && (
              <div className="info-block-card !bg-amber-50/50 !border-amber-200">
                <span className="text-[10px] font-black text-amber-600 uppercase block mb-2">Raciocínio Clínico / Riscos</span>
                <p className="text-content italic !text-slate-700">{record.fatoresRisco}</p>
              </div>
            )}
            {record.conduta && (
              <div className="bg-blue-50/30 p-8 rounded-3xl border-2 border-blue-100">
                <span className="text-[10px] font-black text-blue-800 uppercase block mb-3">Condutas e Orientações</span>
                <p className="text-content font-bold !text-blue-900">{record.conduta}</p>
              </div>
            )}
          </div>
        </section>

        {/* RODAPÉ DE ASSINATURAS */}
        <div className="flex justify-between items-start mt-20 px-4">
          <div className="signature-box">
            <p className="text-sm font-black uppercase text-slate-900">{record.id.nome || 'ESTUDANTE'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identificação do Paciente / Responsável</p>
          </div>
          <div className="signature-box !border-slate-300">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Carimbo e Assinatura do Preceptor</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummarySection;

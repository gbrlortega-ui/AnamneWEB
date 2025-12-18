
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
    setTimeout(() => { window.print(); }, 200);
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

  // Captura de dados de escalas (Geriatria/Adulto) - Verifica ambas as estruturas possíveis (Tradicional e SOAP)
  const cvRiskText = record.antecedentes.riscoCardiovascular || record.soap?.s.riscoCardiovascular;
  const ivcfResultText = record.antecedentes.ivcf20Result || record.soap?.s.ivcf20Result;
  const ivcfScore = record.antecedentes.ivcf20Score || record.soap?.s.ivcf20Score;

  const hasContent = (val: any) => val !== undefined && val !== null && val !== '' && val !== '0' && (typeof val !== 'object' || Object.keys(val).length > 0);

  return (
    <div id="print-root-wrapper" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* 1. RESET DE CONTAINERS PARA IMPRESSÃO REAL MULTIPÁGINA */
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Remove absolutamente todos os comportamentos de 'App' de tela única */
          #root, main, [data-reactroot], .flex, .flex-col, .h-screen, .overflow-hidden, .overflow-y-auto {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Interface do site - Ocultar */
          .no-print, aside, nav, button, footer.no-print {
            display: none !important;
          }

          @page { 
            size: A4; 
            margin: 2.5cm 2cm; 
          }

          #clinical-doc-container {
            display: block !important;
            width: 100% !important;
            background: white !important;
          }

          /* 2. REGRAS DE QUEBRA DE PÁGINA POR SEÇÃO */
          section {
            display: block !important;
            width: 100% !important;
            margin-bottom: 25px !important;
            padding-bottom: 15px !important;
            border-bottom: 1px solid #eee !important;
            /* Permite que a seção quebre entre páginas se for muito longa */
            page-break-inside: auto !important;
            break-inside: auto !important;
            position: relative !important;
          }

          h3 {
            page-break-after: avoid !important; /* Título nunca fica sozinho no fim da página */
            break-after: avoid !important;
            color: #1e3a8a !important;
            border-bottom: 2px solid #1e3a8a !important;
            margin-bottom: 15px !important;
            padding-bottom: 5px !important;
            font-size: 14pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          /* 3. REGRAS PARA TEXTOS LONGOS (HMA, CONDUTA) */
          .text-body-print {
            font-size: 11pt !important;
            line-height: 1.6 !important;
            color: black !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            display: block !important;
            /* Garante que o texto quebre naturalmente entre páginas */
            orphans: 3;
            widows: 3;
          }

          .card-box-print {
            page-break-inside: auto !important; /* Permite que cards longos quebrem */
            break-inside: auto !important;
            border: 1px solid #ddd !important;
            padding: 15px !important;
            margin-bottom: 15px !important;
            background: #fafafa !important;
            border-radius: 4px !important;
          }

          .vital-signs-row-print {
            display: table !important; /* Melhor que flex para impressão */
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 20px !important;
          }

          .vital-box-print {
            display: table-cell !important;
            border: 1px solid #ccc !important;
            padding: 10px !important;
            text-align: center !important;
            width: 16% !important;
          }

          .signature-area-print {
            page-break-inside: avoid !important; /* Assinatura não quebra no meio */
            margin-top: 60px !important;
            display: block !important;
            width: 100% !important;
            clear: both !important;
          }

          .sig-line {
            display: inline-block !important;
            width: 45% !important;
            border-top: 1px solid black !important;
            text-align: center !important;
            padding-top: 10px !important;
            vertical-align: top !important;
          }
        }
      `}} />

      <div id="clinical-doc-container" className="p-4 md:p-8 bg-white font-display print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-10 border-b-4 border-blue-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">AnamneWEB - Registro Clínico Profissional</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Roteiro: {record.patientType} {record.pediatricSubType ? `| ${record.pediatricSubType}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
            <button onClick={handlePrint} className="no-print mt-3 bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">print</span>
              GERAR PDF / IMPRIMIR
            </button>
          </div>
        </header>

        {/* 1. IDENTIFICAÇÃO */}
        <section className="card-box-print">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Paciente</span>
              <p className="text-base font-bold uppercase text-slate-900">{record.id.nome || 'NÃO IDENTIFICADO'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Idade</span>
              <p className="text-base font-bold text-slate-900">{record.id.idade || '--'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sexo</span>
              <p className="text-base font-bold text-slate-900">{record.id.sexo || '--'}</p>
            </div>
          </div>
        </section>

        {/* 2. HISTÓRIA CLÍNICA (Onde o texto geralmente é longo) */}
        <section>
          <h3>I. História Clínica</h3>
          <div className="space-y-6">
            {record.qd && (
              <div className="card-box-print !bg-white">
                <span className="text-[10px] font-black text-blue-700 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-sm font-black leading-tight">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2">História da Moléstia Atual (HMA)</span>
                <p className="text-body-print">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. ESCALAS DE RISCO (Geriatria / Adulto) */}
        {(cvRiskText || ivcfResultText) && (
          <section>
            <h3>II. Avaliações de Risco e Funcionalidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvRiskText && (
                <div className="card-box-print border-blue-200 !bg-blue-50/30">
                  <span className="text-[10px] font-black text-blue-800 uppercase block mb-1">Risco Cardiovascular Global (OMS/OPAS)</span>
                  <p className="text-sm font-black text-blue-900">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className="card-box-print border-purple-200 !bg-purple-50/30">
                  <span className="text-[10px] font-black text-purple-800 uppercase block mb-1">Avaliação IVCF-20 (Escore: {ivcfScore})</span>
                  <p className="text-sm font-black text-purple-900">{ivcfResultText}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. REVISÃO DE SISTEMAS E ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section>
            <h3>III. Antecedentes e Revisão de Sistemas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {/* ISDA Mapping */}
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-700 leading-normal">{val}</p>
                </div>
              ))}
              {/* Antecedentes Mapping */}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
                return (
                  <div key={key} className="border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">{labelMap[key] || key}</span>
                    <p className="text-[11px] text-slate-700 leading-normal">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. EXAME FÍSICO */}
        <section>
          <h3>IV. Exame Físico e Sinais Vitais</h3>
          
          <div className="vital-signs-row-print mb-6">
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">PA</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.pa || '--'}</span>
            </div>
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">FC</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.fc || '--'}</span>
            </div>
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">FR</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.fr || '--'}</span>
            </div>
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">SAT</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.sat || '--'}</span>
            </div>
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">TEMP</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.temp || '--'}</span>
            </div>
            <div className="vital-box-print bg-slate-50">
              <span className="text-[8px] font-black text-slate-400 uppercase block">IMC</span>
              <span className="text-sm font-black">{record.exameFisico.sinaisVitais.imc || '--'}</span>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="pb-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-800 leading-normal">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. CONDUTA E PLANO (Pode ser longo) */}
        <section>
          <h3>V. Síntese Clínica e Plano Terapêutico</h3>
          <div className="space-y-8">
            {record.fatoresRisco && (
              <div className="card-box-print !bg-amber-50/20 border-amber-200">
                <span className="text-[10px] font-black text-amber-700 uppercase block mb-2">Raciocínio Clínico / Fatores de Risco</span>
                <p className="text-body-print italic !text-[10pt]">{record.fatoresRisco}</p>
              </div>
            )}
            {record.conduta && (
              <div>
                <span className="text-[10px] font-black text-blue-800 uppercase block mb-2">Condutas, Prescrições e Orientações</span>
                <p className="text-body-print font-bold text-slate-900 bg-slate-50 p-6 rounded-xl border border-blue-100">
                  {record.conduta}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <div className="signature-area-print mt-20">
          <div className="flex justify-between items-start">
            <div className="sig-line">
              <p className="text-xs font-black uppercase text-slate-900">{record.id.nome || 'NOME DO PACIENTE'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assinatura do Paciente / Responsável</p>
            </div>
            <div className="sig-line !border-slate-300">
              <p className="text-xs font-black uppercase text-slate-300">CARIMBO AQUI</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assinatura e CRM do Preceptor</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummarySection;

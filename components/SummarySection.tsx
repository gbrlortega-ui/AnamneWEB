
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
    setTimeout(() => { window.print(); }, 150);
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

  // Lógica robusta para capturar dados de escalas (Geriatria/Adulto)
  const cvRiskText = record.antecedentes.riscoCardiovascular || record.soap?.s.riscoCardiovascular;
  const cvRiskLevel = record.antecedentes.riscoCardiovascularLevel || record.soap?.s.riscoCardiovascularLevel;
  const ivcfResultText = record.antecedentes.ivcf20Result || record.soap?.s.ivcf20Result;
  const ivcfScore = record.antecedentes.ivcf20Score || record.soap?.s.ivcf20Score;
  const ivcfLevel = record.antecedentes.ivcf20Level;

  const hasContent = (val: any) => val !== undefined && val !== null && val !== '' && val !== '0' && (typeof val !== 'object' || Object.keys(val).length > 0);

  return (
    <div id="summary-print-container" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* RESET GLOBAL DE CONTAINERS - CRÍTICO PARA NÃO CORTAR PÁGINAS */
          html, body, #root, main, [data-reactroot], .relative.flex.h-screen {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            background: white !important;
          }

          /* Remove elementos que não devem sair no PDF */
          .no-print, aside, nav, button, footer.no-print {
            display: none !important;
          }

          @page { 
            size: A4; 
            margin: 2cm; 
          }

          #summary-print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          #clinical-document {
            display: block !important;
            color: black !important;
          }

          /* Garante que cada seção flua uma abaixo da outra sem sobreposição */
          section {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            margin-bottom: 25px !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            clear: both !important;
          }

          h3 {
            page-break-after: avoid;
            break-after: avoid;
            font-size: 14pt !important;
            color: #1e3a8a !important;
            border-bottom: 1px solid #1e3a8a !important;
            margin-bottom: 12px !important;
            padding-bottom: 4px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          .card-box {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1px solid #ddd !important;
            padding: 12px !important;
            margin-bottom: 10px !important;
            background: #f9f9f9 !important;
            display: block !important;
          }

          .text-body {
            font-size: 11pt !important;
            line-height: 1.5 !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
          }

          .vital-signs-row {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            margin-bottom: 20px !important;
          }

          .vital-box {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            width: 30% !important;
            text-align: center !important;
          }

          .signature-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 50px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
          }

          .signature-line {
            width: 45% !important;
            border-top: 1px solid black !important;
            text-align: center !important;
            padding-top: 5px !important;
          }
        }
      `}} />

      <div id="clinical-document" className="p-4 md:p-8 bg-white font-display print:p-0">
        
        {/* CABEÇALHO DO DOCUMENTO */}
        <header className="mb-8 border-b-4 border-slate-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AnamneWEB - Registro de Atendimento</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Modalidade: {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold">Data: {new Date().toLocaleDateString('pt-BR')}</p>
            <button onClick={handlePrint} className="no-print mt-3 bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Imprimir / Exportar PDF
            </button>
          </div>
        </header>

        {/* I. IDENTIFICAÇÃO */}
        <section className="card-box">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <span className="text-[9px] font-black text-slate-400 uppercase block">Paciente</span>
              <p className="text-sm font-bold uppercase">{record.id.nome || 'NÃO IDENTIFICADO'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase block">Idade</span>
              <p className="text-sm font-bold">{record.id.idade || '--'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase block">Sexo</span>
              <p className="text-sm font-bold">{record.id.sexo || '--'}</p>
            </div>
          </div>
        </section>

        {/* II. HISTÓRIA CLÍNICA */}
        <section>
          <h3>I. História Clínica</h3>
          <div className="space-y-4">
            {record.qd && (
              <div className="card-box !bg-white">
                <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-sm font-bold">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">História da Moléstia Atual (HMA)</span>
                <p className="text-body text-sm leading-relaxed">{record.hma}</p>
              </div>
            )}
          </div>
        </section>

        {/* III. ESCALAS GERIÁTRICAS / ADULTO (RISCO CV E IVCF) */}
        {(cvRiskText || ivcfResultText) && (
          <section>
            <h3>II. Avaliações Especializadas</h3>
            <div className="space-y-4">
              {cvRiskText && (
                <div className="card-box !bg-blue-50/50 border-blue-200">
                  <span className="text-[9px] font-black text-blue-700 uppercase block mb-1">Risco Cardiovascular Global (OMS/OPAS)</span>
                  <p className="text-sm font-black text-blue-900">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className="card-box !bg-purple-50/50 border-purple-200">
                  <span className="text-[9px] font-black text-purple-700 uppercase block mb-1">Avaliação IVCF-20 (Escore: {ivcfScore})</span>
                  <p className="text-sm font-black text-purple-900">{ivcfResultText}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* IV. REVISÃO DE SISTEMAS E ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section>
            <h3>III. Antecedentes e Revisão</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-100 pb-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-700">{val}</p>
                </div>
              ))}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
                return (
                  <div key={key} className="border-b border-slate-100 pb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                    <p className="text-[11px] text-slate-700">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* V. EXAME FÍSICO */}
        <section>
          <h3>IV. Exame Físico e Sinais Vitais</h3>
          
          <div className="vital-signs-row mb-6">
            {[
              { label: 'PA', val: record.exameFisico.sinaisVitais.pa },
              { label: 'FC', val: record.exameFisico.sinaisVitais.fc },
              { label: 'FR', val: record.exameFisico.sinaisVitais.fr },
              { label: 'SAT', val: record.exameFisico.sinaisVitais.sat },
              { label: 'TEMP', val: record.exameFisico.sinaisVitais.temp },
              { label: 'IMC', val: record.exameFisico.sinaisVitais.imc }
            ].map((item, i) => (
              <div key={i} className="vital-box bg-slate-50">
                <span className="text-[8px] font-black text-slate-400 uppercase block">{item.label}</span>
                <span className="text-xs font-black">{item.val || '--'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="pb-2 border-b border-slate-50">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <p className="text-[11px] text-slate-800">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* VI. SÍNTESE E CONDUTA */}
        <section>
          <h3>V. Síntese e Plano Terapêutico</h3>
          <div className="space-y-6">
            {record.fatoresRisco && (
              <div className="card-box !bg-amber-50/30">
                <span className="text-[9px] font-black text-amber-700 uppercase block mb-1">Raciocínio Clínico / Riscos</span>
                <p className="text-body text-xs italic">{record.fatoresRisco}</p>
              </div>
            )}
            {record.conduta && (
              <div className="card-box !bg-white border-2 border-primary/20">
                <span className="text-[9px] font-black text-primary uppercase block mb-1">Condutas e Orientações</span>
                <p className="text-body text-sm font-bold text-slate-900">{record.conduta}</p>
              </div>
            )}
          </div>
        </section>

        {/* ÁREA DE ASSINATURAS */}
        <footer className="signature-section pt-12">
          <div className="signature-line">
            <p className="text-xs font-bold uppercase">{record.id.nome || 'ESTUDANTE'}</p>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Responsável pelo Registro</p>
          </div>
          <div className="signature-line">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-4">Carimbo e CRM do Preceptor</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default SummarySection;

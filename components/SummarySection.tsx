
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

  const cvRiskText = record.antecedentes.riscoCardiovascular || record.soap?.s.riscoCardiovascular;
  const cvRiskLevel = record.antecedentes.riscoCardiovascularLevel || record.soap?.s.riscoCardiovascularLevel;
  const ivcfResultText = record.antecedentes.ivcf20Result || record.soap?.s.ivcf20Result;
  const ivcfScore = record.antecedentes.ivcf20Score || record.soap?.s.ivcf20Score;
  const ivcfLevel = record.antecedentes.ivcf20Level || record.soap?.s.ivcf20Level;

  const hasContent = (val: any) => {
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  const vitalStatus = useMemo(() => 
    getVitalSignsInterpretation(record.exameFisico.sinaisVitais, ageMonths, record.patientType), 
  [record.exameFisico.sinaisVitais, ageMonths, record.patientType]);

  const bmiInterpretation = useMemo(() => {
    return classifyAdultBMI(parseFloat(record.exameFisico.sinaisVitais.imc || '0'), ageYears);
  }, [record.exameFisico.sinaisVitais.imc, ageYears]);

  const getCVColorClasses = (level?: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-[#dcfce7] border-[#16a34a] text-[#14532d]'; 
      case 'MODERATE': return 'bg-[#fef9c3] border-[#ca8a04] text-[#713f12]';
      case 'HIGH':
      case 'VERY_HIGH':
      case 'EXTREME': return 'bg-[#fee2e2] border-[#dc2626] text-[#7f1d1d]';
      default: return 'bg-slate-50 border-slate-300 text-slate-800';
    }
  };

  const getIVCFColorClasses = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'bg-[#dcfce7] border-[#16a34a] text-[#14532d]';
      case 'MODERATE': return 'bg-[#fef9c3] border-[#ca8a04] text-[#713f12]';
      case 'HIGH': return 'bg-[#fee2e2] border-[#dc2626] text-[#7f1d1d]';
      default: return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  return (
    <div id="print-root-container" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        /* RESET E CORREÇÕES DE SOBREPOSIÇÃO */
        .record-section {
          width: 100%;
          margin-bottom: 24px;
          clear: both;
          display: block;
          overflow: visible;
        }

        .text-content {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          display: block !important;
          line-height: 1.6 !important;
          width: 100% !important;
        }

        .vital-box {
          border: 1px solid #cbd5e1;
          padding: 8px;
          text-align: center;
          border-radius: 8px;
          background: #f8fafc;
          min-width: 90px;
          flex: 1;
        }

        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print { display: none !important; }

          @page { size: A4; margin: 1.5cm; }

          #clinical-document {
            width: 100% !important;
            color: black !important;
            padding: 0 !important;
            font-size: 11pt !important;
            overflow: visible !important;
          }

          h3 {
            border-bottom: 2pt solid #000 !important;
            margin: 15pt 0 10pt 0 !important;
            padding-bottom: 2pt !important;
            font-size: 13pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            page-break-after: avoid !important;
          }

          .vitals-grid-print {
            display: grid !important;
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 5pt !important;
            width: 100% !important;
            margin-bottom: 15pt !important;
          }

          .vital-box-print {
            border: 0.5pt solid #666 !important;
            padding: 5pt !important;
            text-align: center !important;
            background-color: #f8fafc !important;
          }
          
          .risk-block {
             border-width: 2pt !important;
             padding: 10pt !important;
             margin-bottom: 10pt !important;
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
             page-break-inside: avoid !important;
          }
        }
      `}} />

      <div id="clinical-document" className="max-w-[850px] mx-auto bg-white p-4 md:p-10 font-sans print:max-w-none print:p-0">
        
        {/* CABEÇALHO PROFISSIONAL */}
        <header className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">Registro Clínico de Atendimento</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Prontuário Médico • {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
            </p>
          </div>
          <div className="text-right no-print">
            <button onClick={handlePrint} className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              GERAR DOCUMENTO PDF
            </button>
          </div>
        </header>

        {/* IDENTIFICAÇÃO COMPLETA */}
        <section className="record-section border border-slate-200 p-5 rounded-2xl bg-slate-50/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-[11px]">
            <div className="col-span-2 md:col-span-3 pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Nome Completo</span>
              <span className="font-black text-base text-slate-900 uppercase">{record.id.nome || 'NÃO INFORMADO'}</span>
            </div>
            
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Idade</span>
              <span className="font-bold text-slate-800">{record.id.idade || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Sexo</span>
              <span className="font-bold text-slate-800">{record.id.sexo || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Cor / Raça</span>
              <span className="font-bold text-slate-800">{record.id.cor || '--'}</span>
            </div>
            
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Naturalidade</span>
              <span className="font-bold text-slate-800">{record.id.naturalidade || '--'}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Residência</span>
              <span className="font-bold text-slate-800">{record.id.residencia || '--'}</span>
            </div>

            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Estado Civil</span>
              <span className="font-bold text-slate-800">{record.id.estadoCivil || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Profissão</span>
              <span className="font-bold text-slate-800">{record.id.profissao || '--'}</span>
            </div>
            {record.id.escolaridade && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Escolaridade</span>
                <span className="font-bold text-slate-800">{record.id.escolaridade}</span>
              </div>
            )}

            {record.id.responsavel && (
              <div className="col-span-2">
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Responsável</span>
                <span className="font-bold text-slate-800">{record.id.responsavel}</span>
              </div>
            )}
          </div>
        </section>

        {/* ANAMNESE */}
        <section className="record-section">
          <h3>I. Anamnese</h3>
          <div className="space-y-6">
            {record.qd && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-base font-bold text-slate-900 leading-tight">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="w-full">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">História da Moléstia Atual (HMA)</span>
                <div className="text-content text-sm text-slate-800">
                  {record.hma}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AVALIAÇÕES SEMAFÓRICAS */}
        {(cvRiskText || ivcfResultText) && (
          <section className="record-section">
            <h3>II. Avaliações de Risco e Funcionalidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvRiskText && (
                <div className={`p-5 border-2 rounded-2xl shadow-sm risk-block ${getCVColorClasses(cvRiskLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Risco Cardiovascular Global</span>
                  </div>
                  <p className="text-base font-black uppercase leading-tight">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className={`p-5 border-2 rounded-2xl shadow-sm risk-block ${getIVCFColorClasses(ivcfLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg">elderly</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Avaliação IVCF-20 (Escore: {ivcfScore})</span>
                  </div>
                  <p className="text-base font-black uppercase leading-tight">{ivcfResultText}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* EXAME FÍSICO */}
        <section className="record-section">
          <h3>III. Exame Físico</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8 vitals-grid-print">
            {[
              { label: 'PA', value: record.exameFisico.sinaisVitais.pa, status: vitalStatus.pa },
              { label: 'FC', value: record.exameFisico.sinaisVitais.fc ? record.exameFisico.sinaisVitais.fc + ' bpm' : '--', status: vitalStatus.fc },
              { label: 'FR', value: record.exameFisico.sinaisVitais.fr ? record.exameFisico.sinaisVitais.fr + ' irpm' : '--', status: vitalStatus.fr },
              { label: 'SAT', value: record.exameFisico.sinaisVitais.sat ? record.exameFisico.sinaisVitais.sat + '%' : '--', status: vitalStatus.sat },
              { label: 'TEMP', value: record.exameFisico.sinaisVitais.temp ? record.exameFisico.sinaisVitais.temp + '°C' : '--', status: vitalStatus.temp },
              { label: 'IMC', value: record.exameFisico.sinaisVitais.imc || '--', status: bmiInterpretation }
            ].map((v, i) => (
              <div key={i} className="vital-box vital-box-print flex flex-col justify-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{v.label}</span>
                <span className="text-[13px] font-black text-slate-900 leading-none">{v.value}</span>
                <span className={`text-[8px] font-black uppercase mt-1 leading-tight ${v.status?.color || 'text-slate-400'}`}>
                  {v.status?.label || '--'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <div className="text-[11px] text-slate-800 text-content">{val}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CONDUTA */}
        <section className="record-section mb-12">
          <h3>IV. Síntese e Plano Terapêutico</h3>
          <div className="space-y-6">
            {record.fatoresRisco && (
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Raciocínio Clínico</span>
                <div className="text-content italic text-slate-600 text-[11pt]">
                  {record.fatoresRisco}
                </div>
              </div>
            )}
            {record.conduta && (
              <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">Condutas e Orientações</span>
                <div className="text-content font-bold text-slate-900 text-[13pt]">
                  {record.conduta}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <div className="mt-20 pt-10 border-t border-slate-100">
          <div className="flex justify-around text-center">
            <div className="w-[45%] border-t border-black pt-3">
              <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">{record.id.nome || 'PACIENTE'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Assinatura do Paciente / Responsável</p>
            </div>
            <div className="w-[45%] border-t border-slate-300 pt-3">
              <div className="h-10"></div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Carimbo e CRM do Médico Preceptor</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummarySection;


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
      case 'LOW': return 'bg-green-100 border-green-500 text-green-900';
      case 'MODERATE': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'HIGH':
      case 'VERY_HIGH':
      case 'EXTREME': return 'bg-red-100 border-red-500 text-red-900';
      default: return 'bg-slate-50 border-slate-300 text-slate-800';
    }
  };

  const getIVCFColorClasses = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'bg-green-100 border-green-500 text-green-900';
      case 'MODERATE': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'HIGH': return 'bg-red-100 border-red-500 text-red-900';
      default: return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  return (
    <div id="print-root-container" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ESTILOS PARA VISUALIZAÇÃO NA TELA E PDF */
        .text-content {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          display: block !important;
          width: 100% !important;
        }

        .vital-box {
          flex: 1;
          min-width: 110px;
          border: 1px solid #cbd5e1;
          padding: 8px;
          text-align: center;
          border-radius: 8px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          justify-content: center;
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

          @page { size: A4; margin: 1.2cm; }

          #clinical-document {
            width: 100% !important;
            color: black !important;
            padding: 0 !important;
            font-size: 10pt !important;
          }

          h3 {
            border-bottom: 1.5pt solid #000 !important;
            margin-bottom: 10pt !important;
            padding-bottom: 2pt !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            page-break-after: avoid !important;
          }

          .vitals-grid-print {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 4pt !important;
            width: 100% !important;
            margin-bottom: 12pt !important;
          }

          .vital-box-print {
            border: 0.5pt solid #999 !important;
            width: 16.6% !important;
            padding: 4pt !important;
            text-align: center !important;
          }
          
          .vital-label-print { font-size: 7pt !important; font-weight: bold !important; color: #444 !important; }
          .vital-value-print { font-size: 10pt !important; font-weight: bold !important; display: block !important; }
          .vital-status-print { font-size: 7pt !important; font-weight: bold !important; display: block !important; }
          
          /* Forçar cores de fundo no PDF */
          .risk-block-print {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <div id="clinical-document" className="max-w-[850px] mx-auto bg-white p-4 md:p-10 font-sans print:max-w-none print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-6 border-b-2 border-black pb-3 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black text-black uppercase tracking-tight">Registro de Atendimento Clínico</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Prontuário Médico • {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
            </p>
          </div>
          <div className="text-right no-print">
            <button onClick={handlePrint} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              GERAR PDF / IMPRIMIR
            </button>
          </div>
        </header>

        {/* IDENTIFICAÇÃO COMPLETA */}
        <section className="mb-6 border border-slate-200 p-4 rounded-xl bg-slate-50/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-[10px]">
            <div className="col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Nome</span>
              <span className="font-black text-sm text-slate-900 uppercase">{record.id.nome || 'NÃO INFORMADO'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Idade</span>
              <span className="font-bold text-slate-800">{record.id.idade || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Sexo</span>
              <span className="font-bold text-slate-800">{record.id.sexo || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Cor/Raça</span>
              <span className="font-bold text-slate-800">{record.id.cor || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Naturalidade</span>
              <span className="font-bold text-slate-800">{record.id.naturalidade || '--'}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Procedência/Residência</span>
              <span className="font-bold text-slate-800">{record.id.residencia || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Profissão</span>
              <span className="font-bold text-slate-800">{record.id.profissao || '--'}</span>
            </div>
            {record.id.escolaridade && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[8px]">Escolaridade</span>
                <span className="font-bold text-slate-800">{record.id.escolaridade}</span>
              </div>
            )}
            {record.id.cuidador && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[8px]">Cuidador</span>
                <span className="font-bold text-slate-800">{record.id.cuidador}</span>
              </div>
            )}
          </div>
        </section>

        {/* ANAMNESE */}
        <section className="mb-6">
          <h3>I. Anamnese</h3>
          <div className="space-y-4">
            {record.qd && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-sm font-bold text-slate-900">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">História da Moléstia Atual (HMA)</span>
                <p className="text-content text-xs text-slate-800 leading-relaxed">
                  {record.hma}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* AVALIAÇÕES DE RISCO SEMAFÓRICAS */}
        {(cvRiskText || ivcfResultText) && (
          <section className="mb-6">
            <h3>II. Avaliações de Risco e Funcionalidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvRiskText && (
                <div className={`p-4 border-2 rounded-xl risk-block-print ${getCVColorClasses(cvRiskLevel)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span className="text-[8px] font-black uppercase">Risco Cardiovascular</span>
                  </div>
                  <p className="text-xs font-black uppercase">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className={`p-4 border-2 rounded-xl risk-block-print ${getIVCFColorClasses(ivcfLevel)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm">elderly</span>
                    <span className="text-[8px] font-black uppercase">IVCF-20 (Escore: {ivcfScore})</span>
                  </div>
                  <p className="text-xs font-black uppercase">{ivcfResultText}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* EXAME FÍSICO E VITAIS EM CAIXAS */}
        <section className="mb-6">
          <h3>III. Exame Físico</h3>
          
          <div className="flex flex-wrap gap-2 mb-6 vitals-grid-print">
            {[
              { label: 'PA', value: record.exameFisico.sinaisVitais.pa, status: vitalStatus.pa },
              { label: 'FC', value: record.exameFisico.sinaisVitais.fc ? record.exameFisico.sinaisVitais.fc + ' bpm' : '--', status: vitalStatus.fc },
              { label: 'FR', value: record.exameFisico.sinaisVitais.fr ? record.exameFisico.sinaisVitais.fr + ' irpm' : '--', status: vitalStatus.fr },
              { label: 'SAT', value: record.exameFisico.sinaisVitais.sat ? record.exameFisico.sinaisVitais.sat + '%' : '--', status: vitalStatus.sat },
              { label: 'TEMP', value: record.exameFisico.sinaisVitais.temp ? record.exameFisico.sinaisVitais.temp + '°C' : '--', status: vitalStatus.temp },
              { label: 'IMC', value: record.exameFisico.sinaisVitais.imc || '--', status: bmiInterpretation }
            ].map((v, i) => (
              <div key={i} className="vital-box vital-box-print">
                <span className="text-[7px] font-black text-slate-400 uppercase vital-label-print">{v.label}</span>
                <span className="text-xs font-black text-slate-900 my-0.5 vital-value-print">{v.value}</span>
                <span className={`text-[7px] font-black uppercase vital-status-print ${v.status?.color || 'text-slate-400'}`}>
                  {v.status?.label || '--'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="border-b border-slate-100 pb-1.5">
                  <span className="text-[7px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <p className="text-[10px] text-slate-800 leading-tight">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ANTECEDENTES */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section className="mb-6">
            <h3>IV. Antecedentes e Revisão</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-50 pb-1">
                  <span className="text-[7px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <p className="text-[10px] text-slate-700 leading-tight">{val}</p>
                </div>
              ))}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
                return (
                  <div key={key} className="border-b border-slate-50 pb-1">
                    <span className="text-[7px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                    <p className="text-[10px] text-slate-700 leading-tight">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CONDUTA */}
        <section className="mb-10">
          <h3>V. Plano Terapêutico</h3>
          <div className="space-y-4">
            {record.fatoresRisco && (
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Síntese / Raciocínio</span>
                <p className="text-content italic text-slate-600 text-xs">
                  {record.fatoresRisco}
                </p>
              </div>
            )}
            {record.conduta && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Condutas e Orientações</span>
                <p className="text-content font-bold text-slate-900 text-[11pt]">
                  {record.conduta}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex justify-around text-center">
            <div className="w-[40%] border-t border-black pt-2">
              <p className="text-[9px] font-black uppercase text-slate-900">{record.id.nome || 'PACIENTE'}</p>
              <p className="text-[7px] font-bold text-slate-400">Assinatura do Paciente / Responsável</p>
            </div>
            <div className="w-[40%] border-t border-slate-300 pt-2">
              <div className="h-8"></div>
              <p className="text-[7px] font-bold text-slate-400 uppercase">Carimbo e CRM do Médico Preceptor</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummarySection;

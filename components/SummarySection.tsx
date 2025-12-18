
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
      case 'LOW': return 'bg-green-50 border-green-500 text-green-800';
      case 'MODERATE': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'HIGH':
      case 'VERY_HIGH':
      case 'EXTREME': return 'bg-red-50 border-red-500 text-red-800';
      default: return 'bg-slate-50 border-slate-300 text-slate-800';
    }
  };

  return (
    <div id="print-root-container" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ESTILOS PARA VISUALIZAÇÃO NA TELA (PREVIEW) */
        .text-content {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .vital-box {
          flex: 1;
          min-width: 110px;
          border: 1px solid #e2e8f0;
          padding: 10px;
          text-align: center;
          border-radius: 12px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media print {
          html, body, #root, main, [data-reactroot] {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print { display: none !important; }

          @page { size: A4; margin: 1.5cm; }

          #clinical-document {
            width: 100% !important;
            color: black !important;
            padding: 0 !important;
          }

          h3 {
            border-bottom: 2pt solid #000 !important;
            margin-bottom: 12pt !important;
            padding-bottom: 3pt !important;
            font-size: 13pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          .text-content {
            font-size: 11pt !important;
            line-height: 1.5 !important;
          }

          .vitals-grid-print {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 6pt !important;
            width: 100% !important;
            margin-bottom: 15pt !important;
          }

          .vital-box-print {
            border: 0.5pt solid #ccc !important;
            width: 16.6% !important;
            padding: 6pt !important;
            text-align: center !important;
            border-radius: 4pt !important;
          }
          
          .vital-label-print { font-size: 8pt !important; font-weight: bold !important; color: #666 !important; text-transform: uppercase !important; }
          .vital-value-print { font-size: 11pt !important; font-weight: bold !important; margin: 2pt 0 !important; display: block !important; }
          .vital-status-print { font-size: 7.5pt !important; font-weight: bold !important; display: block !important; }
        }
      `}} />

      <div id="clinical-document" className="max-w-[850px] mx-auto bg-white p-4 md:p-10 font-sans print:max-w-none print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">Registro de Atendimento Clínico</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Prontuário Estruturado | {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
            </p>
          </div>
          <div className="text-right no-print">
            <button onClick={handlePrint} className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              GERAR PDF / IMPRIMIR
            </button>
          </div>
        </header>

        {/* I. IDENTIFICAÇÃO EXPANDIDA */}
        <section className="mb-8 border border-slate-200 p-5 rounded-2xl bg-slate-50/30">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Dados de Identificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-xs">
            <div className="md:col-span-2 lg:col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Nome Completo</span>
              <span className="font-black text-sm text-slate-900 uppercase">{record.id.nome || 'NÃO INFORMADO'}</span>
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
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Estado Civil</span>
              <span className="font-bold text-slate-800">{record.id.estadoCivil || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Profissão / Ocupação</span>
              <span className="font-bold text-slate-800">{record.id.profissao || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Naturalidade (Origem)</span>
              <span className="font-bold text-slate-800">{record.id.naturalidade || '--'}</span>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Residência (Procedência)</span>
              <span className="font-bold text-slate-800">{record.id.residencia || '--'}</span>
            </div>
            {record.id.responsavel && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Responsável</span>
                <span className="font-bold text-slate-800">{record.id.responsavel}</span>
              </div>
            )}
            {record.id.escolaridade && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Escolaridade</span>
                <span className="font-bold text-slate-800">{record.id.escolaridade}</span>
              </div>
            )}
            {record.id.cuidador && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Cuidador</span>
                <span className="font-bold text-slate-800">{record.id.cuidador}</span>
              </div>
            )}
          </div>
        </section>

        {/* II. ANAMNESE */}
        <section className="mb-8">
          <h3>I. Anamnese</h3>
          <div className="space-y-5">
            {record.qd && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Queixa Principal (QD)</span>
                <p className="text-base font-bold text-slate-900 break-words">{record.qd}</p>
              </div>
            )}
            {record.hma && (
              <div className="w-full">
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">História da Moléstia Atual (HMA)</span>
                <p className="text-content text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                  {record.hma}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* III. RISCO CARDIOVASCULAR E ESCALAS */}
        {(cvRiskText || ivcfResultText) && (
          <section className="mb-8">
            <h3>II. Avaliações de Risco e Funcionalidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvRiskText && (
                <div className={`p-5 border-2 rounded-2xl shadow-sm ${getCVColorClasses(cvRiskLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Risco Cardiovascular (OPAS/OMS)</span>
                  </div>
                  <p className="text-base font-black break-words leading-tight">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className="p-5 border-2 border-purple-200 bg-purple-50 text-purple-900 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg">elderly</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Avaliação IVCF-20 (Escore: {ivcfScore})</span>
                  </div>
                  <p className="text-base font-black break-words leading-tight">{ivcfResultText}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* IV. EXAME FÍSICO E VITAIS EM CAIXAS */}
        <section className="mb-8">
          <h3>III. Exame Físico</h3>
          
          <div className="flex flex-wrap gap-2 mb-8 vitals-grid-print">
            {[
              { label: 'PA', value: record.exameFisico.sinaisVitais.pa, status: vitalStatus.pa },
              { label: 'FC', value: record.exameFisico.sinaisVitais.fc ? record.exameFisico.sinaisVitais.fc + ' bpm' : '--', status: vitalStatus.fc },
              { label: 'FR', value: record.exameFisico.sinaisVitais.fr ? record.exameFisico.sinaisVitais.fr + ' irpm' : '--', status: vitalStatus.fr },
              { label: 'SAT', value: record.exameFisico.sinaisVitais.sat ? record.exameFisico.sinaisVitais.sat + '%' : '--', status: vitalStatus.sat },
              { label: 'TEMP', value: record.exameFisico.sinaisVitais.temp ? record.exameFisico.sinaisVitais.temp + '°C' : '--', status: vitalStatus.temp },
              { label: 'IMC', value: record.exameFisico.sinaisVitais.imc || '--', status: bmiInterpretation }
            ].map((v, i) => (
              <div key={i} className="vital-box vital-box-print">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest vital-label-print">{v.label}</span>
                <span className="text-base font-black text-slate-900 my-1 vital-value-print">{v.value}</span>
                <span className={`text-[8px] font-black uppercase leading-tight vital-status-print ${v.status?.color || 'text-slate-400'}`}>
                  {v.status?.label || '--'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="border-b border-slate-100 pb-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-xs text-slate-800 leading-normal break-words">{val}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* V. ANTECEDENTES E REVISÃO */}
        {(hasContent(record.isda) || hasContent(record.antecedentes)) && (
          <section className="mb-8">
            <h3>IV. Antecedentes e Revisão de Sistemas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-50 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                  <p className="text-[10pt] text-slate-700 leading-snug break-words">{val}</p>
                </div>
              ))}
              {Object.entries(record.antecedentes).map(([key, val]) => {
                if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
                return (
                  <div key={key} className="border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{labelMap[key] || key}</span>
                    <p className="text-[10pt] text-slate-700 leading-snug break-words">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VI. PLANO TERAPÊUTICO */}
        <section className="mb-12">
          <h3>V. Síntese e Plano Terapêutico</h3>
          <div className="space-y-8">
            {record.fatoresRisco && (
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2">Raciocínio Clínico / Síntese</span>
                <p className="text-content italic text-slate-600 text-[11pt] whitespace-pre-wrap break-words leading-relaxed">
                  {record.fatoresRisco}
                </p>
              </div>
            )}
            {record.conduta && (
              <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-3">Condutas, Prescrições e Orientações</span>
                <p className="text-content font-bold text-slate-900 text-[12pt] whitespace-pre-wrap break-words leading-relaxed">
                  {record.conduta}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS */}
        <div className="mt-20 pt-10 border-t border-slate-100">
          <div className="flex justify-around text-center">
            <div className="w-[45%] border-t border-black pt-3">
              <p className="text-sm font-black text-slate-900 uppercase break-words leading-tight">{record.id.nome || 'PACIENTE'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Assinatura do Paciente / Responsável</p>
            </div>
            <div className="w-[45%] border-t border-slate-300 pt-3">
              <div className="h-10"></div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Carimbo e CRM do Médico Preceptor</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummarySection;

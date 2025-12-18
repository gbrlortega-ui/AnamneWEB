
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
    fisiologicos: 'Antecedentes Fisiológicos', patologicos: 'Antecedentes Patológicos', 
    familiares: 'Antecedentes Familiares', habitos: 'Hábitos e Estilo de Vida', 
    psicossocial: 'Socioeconômico/Moradia', gestacional: 'Antecedentes Gestacionais', 
    neonatal: 'Antecedentes Neonatais', dnpm: 'Desenvolvimento (DNPM)', 
    vacinacao: 'Vacinação', funcionalidade: 'Funcionalidade/AVDs', polifarmacia: 'Polifarmácia/Medicações',
    peleAnexos: 'Pele e Anexos', aparelhoRespiratorio: 'Aparelho Respiratório',
    aparelhoCardiovascular: 'Aparelho Cardiovascular', aparelhoGenitourinario: 'Aparelho Genitourinário',
    aparelhoMusculoEsqueletico: 'Aparelho Músculo-Esquelético', extremidades: 'Extremidades e Pulsos',
    neurologico: 'Exame Neurológico', fontanelas: 'Fontanelas',
    antFisiologicos: 'Antecedentes Fisiológicos', antPatologicos: 'Antecedentes Patológicos',
    antFamiliares: 'Antecedentes Familiares', medicacoes: 'Medicações em Uso',
    socioeconomico: 'Socioeconômico e Social'
  };

  const qpHma = record.qd || record.hma ? `${record.qd ? 'QD: ' + record.qd + '\n' : ''}${record.hma || ''}` : record.soap?.s.qpHma;
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
      case 'LOW': return 'bg-[#dcfce7] border-[#22c55e] text-[#14532d]'; 
      case 'MODERATE': return 'bg-[#fef9c3] border-[#eab308] text-[#713f12]';
      case 'HIGH':
      case 'VERY_HIGH':
      case 'EXTREME': return 'bg-[#fee2e2] border-[#ef4444] text-[#7f1d1d]';
      default: return 'bg-slate-50 border-slate-300 text-slate-800';
    }
  };

  const getIVCFColorClasses = (level?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW': return 'bg-[#dcfce7] border-[#22c55e] text-[#14532d]';
      case 'MODERATE': return 'bg-[#fef9c3] border-[#eab308] text-[#713f12]';
      case 'HIGH': return 'bg-[#fee2e2] border-[#ef4444] text-[#7f1d1d]';
      default: return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  return (
    <div id="print-root-container" className="p-0 bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        /* CONFIGURAÇÃO PARA IMPRESSÃO MULTI-PÁGINAS */
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

          @page { 
            size: A4; 
            margin: 1.5cm; 
          }

          #clinical-document {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
            background: white !important;
            display: block !important;
          }

          .record-section {
            display: block !important;
            width: 100% !important;
            page-break-inside: auto !important; /* Permite quebrar seções longas entre páginas */
            margin-bottom: 20pt !important;
            clear: both !important;
          }

          h3 {
            page-break-after: avoid !important; /* Título nunca fica sozinho no fim da página */
            border-bottom: 2pt solid black !important;
            margin: 15pt 0 10pt 0 !important;
            padding-bottom: 2pt !important;
            font-size: 12pt !important;
            text-transform: uppercase !important;
          }

          .text-content {
            page-break-inside: auto !important;
            display: block !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            line-height: 1.5 !important;
            font-size: 10pt !important;
            text-align: justify;
          }

          .vitals-grid-print {
            page-break-inside: avoid !important; /* Sinais vitais devem ficar juntos */
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 4pt !important;
          }

          .vital-box-print {
            border: 0.5pt solid #666 !important;
            padding: 5pt !important;
            text-align: center !important;
            background-color: #f8fafc !important;
          }

          .risk-block {
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .id-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10pt !important;
          }
        }

        /* ESTILOS DE TELA */
        .text-content {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      `}} />

      <div id="clinical-document" className="max-w-[850px] mx-auto bg-white p-4 md:p-10 font-sans print:max-w-none print:p-0">
        
        {/* CABEÇALHO */}
        <header className="mb-6 border-b-2 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black text-black uppercase tracking-tight">Registro Médico de Atendimento</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Prontuário Clínico • {record.patientType} {record.pediatricSubType ? `(${record.pediatricSubType})` : ''}
            </p>
          </div>
          <div className="text-right no-print">
            <button onClick={handlePrint} className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">print</span>
              IMPRIMIR / GERAR PDF
            </button>
          </div>
        </header>

        {/* IDENTIFICAÇÃO */}
        <section className="record-section border border-slate-200 p-6 rounded-2xl bg-slate-50/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-[11px] id-grid">
            <div className="col-span-2 md:col-span-3 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Nome</span>
              <span className="font-black text-base text-slate-900 uppercase">{record.id.nome || 'NÃO INFORMADO'}</span>
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
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Cor / Raça</span>
              <span className="font-bold text-slate-800">{record.id.cor || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Naturalidade</span>
              <span className="font-bold text-slate-800">{record.id.naturalidade || '--'}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-400 block uppercase text-[8px]">Residência</span>
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
        <section className="record-section">
          <h3>I. Anamnese</h3>
          {qpHma ? (
            <div className="text-content text-sm text-slate-800">
              {qpHma}
            </div>
          ) : (
            <p className="text-xs italic text-slate-400">Nenhum registro de QD/HMA preenchido.</p>
          )}
        </section>

        {/* ISDA */}
        {hasContent(record.isda) && (
          <section className="record-section">
            <h3>II. Revisão de Sistemas (ISDA)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {Object.entries(record.isda).map(([key, val]) => val && (
                <div key={key} className="border-b border-slate-50 pb-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <div className="text-[10px] text-slate-700 text-content">{val}</div>
                </div>
              ))}
              {record.soap?.s.isda && (
                <div className="col-span-2 border-t border-slate-50 pt-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">Complemento ISDA (SOAP)</span>
                  <div className="text-[10px] text-slate-700 text-content">{record.soap.s.isda}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ANTECEDENTES */}
        <section className="record-section">
          <h3>III. Antecedentes e Riscos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {/* Loop Antecedentes Padrão */}
            {Object.entries(record.antecedentes).map(([key, val]) => {
              if (!val || typeof val !== 'string' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
              return (
                <div key={key} className="border-b border-slate-50 pb-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <div className="text-[10px] text-slate-700 text-content">{val}</div>
                </div>
              );
            })}
            {/* Loop Antecedentes SOAP */}
            {record.soap?.s && Object.entries(record.soap.s).map(([key, val]) => {
              if (!val || typeof val !== 'string' || key === 'qpHma' || key === 'isda' || key === 'identificacao' || key.includes('Level') || key.includes('risco') || key.includes('ivcf')) return null;
              return (
                <div key={key} className="border-b border-slate-50 pb-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">{labelMap[key] || key}</span>
                  <div className="text-[10px] text-slate-700 text-content">{val}</div>
                </div>
              );
            })}
          </div>

          {/* RISCOS SEMAFÓRICOS NO PDF */}
          {(cvRiskText || ivcfResultText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {cvRiskText && (
                <div className={`p-4 border-2 rounded-xl risk-block ${getCVColorClasses(cvRiskLevel)}`}>
                  <span className="text-[8px] font-black uppercase block opacity-60 mb-1">Risco Cardiovascular Global</span>
                  <p className="text-xs font-black uppercase">{cvRiskText}</p>
                </div>
              )}
              {ivcfResultText && (
                <div className={`p-4 border-2 rounded-xl risk-block ${getIVCFColorClasses(ivcfLevel)}`}>
                  <span className="text-[8px] font-black uppercase block opacity-60 mb-1">IVCF-20 (Escore: {ivcfScore})</span>
                  <p className="text-xs font-black uppercase">{ivcfResultText}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* EXAME FÍSICO */}
        <section className="record-section">
          <h3>IV. Exame Físico</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2 mb-6 vitals-grid-print">
            {[
              { label: 'PA', value: record.exameFisico.sinaisVitais.pa, status: vitalStatus.pa },
              { label: 'FC', value: record.exameFisico.sinaisVitais.fc ? record.exameFisico.sinaisVitais.fc + ' bpm' : '--', status: vitalStatus.fc },
              { label: 'FR', value: record.exameFisico.sinaisVitais.fr ? record.exameFisico.sinaisVitais.fr + ' irpm' : '--', status: vitalStatus.fr },
              { label: 'SAT', value: record.exameFisico.sinaisVitais.sat ? record.exameFisico.sinaisVitais.sat + '%' : '--', status: vitalStatus.sat },
              { label: 'TEMP', value: record.exameFisico.sinaisVitais.temp ? record.exameFisico.sinaisVitais.temp + '°C' : '--', status: vitalStatus.temp },
              { label: 'PESO', value: record.exameFisico.sinaisVitais.peso ? record.exameFisico.sinaisVitais.peso + 'kg' : '--' },
              { label: 'ESTAT', value: record.exameFisico.sinaisVitais.estatura ? record.exameFisico.sinaisVitais.estatura + 'cm' : '--' },
              ...(record.patientType === PatientType.PEDIATRIC ? [{ label: 'PC', value: record.exameFisico.sinaisVitais.pc ? record.exameFisico.sinaisVitais.pc + 'cm' : '--' }] : []),
              { label: 'IMC', value: record.exameFisico.sinaisVitais.imc || '--', status: bmiInterpretation }
            ].map((v, i) => (
              <div key={i} className="vital-box-print rounded-lg">
                <span className="text-[7px] font-black text-slate-400 uppercase block mb-1">{v.label}</span>
                <span className="text-[10px] font-black text-slate-900 block">{v.value}</span>
                {v.status && <span className={`text-[7px] font-black uppercase mt-1 block ${v.status.color}`}>{v.status.label}</span>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {Object.entries(record.exameFisico).map(([key, val]) => {
              if (key === 'sinaisVitais' || !val || typeof val !== 'string') return null;
              return (
                <div key={key} className="border-b border-slate-50 pb-1.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">{labelMap[key] || key}</span>
                  <div className="text-[10px] text-slate-800 text-content">{val}</div>
                </div>
              );
            })}
            {record.soap?.o && (
              <div className="border-b border-slate-100 pb-1.5 pt-2">
                <span className="text-[8px] font-black text-primary uppercase block mb-0.5">Objetivo / Exames Complementares (SOAP)</span>
                <div className="text-[10px] text-slate-800 text-content">{record.soap.o}</div>
              </div>
            )}
          </div>
        </section>

        {/* SÍNTESE E CONDUTA */}
        <section className="record-section">
          <h3>V. Diagnóstico e Conduta</h3>
          <div className="space-y-6">
            {record.hipoteseDiagnostica && (
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Hipótese Diagnóstica Principais</span>
                <p className="text-sm font-black text-slate-900">{record.hipoteseDiagnostica}</p>
              </div>
            )}
            
            {(record.fatoresRisco || (record.soap?.assessments && record.soap.assessments.length > 0)) && (
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Avaliação e Raciocínio Clínico</span>
                {record.fatoresRisco && <div className="text-content italic text-slate-600 text-xs mb-2">{record.fatoresRisco}</div>}
                {record.soap?.assessments && record.soap.assessments.map((a, i) => a.text && (
                  <div key={i} className="text-[11px] font-bold text-slate-800">• A{i+1}: {a.text}</div>
                ))}
              </div>
            )}

            {/* CONDUTA UNIFICADA */}
            {(record.conduta || (record.soap?.plans && record.soap.plans.length > 0)) && (
              <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <span className="text-[9px] font-black text-primary uppercase block mb-2">Plano de Conduta e Orientações</span>
                {record.conduta && <div className="text-content font-bold text-slate-900 text-sm mb-4">{record.conduta}</div>}
                
                {record.soap?.plans && record.soap.plans.map((p, i) => p.text && (
                  <div key={i} className="text-[11px] text-slate-900 mb-2 last:mb-0">
                    <span className="font-black text-primary">P{i+1} [{p.category}]:</span> {p.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ASSINATURAS NO FIM DA ÚLTIMA PÁGINA */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex justify-around text-center">
            <div className="w-[45%] border-t border-black pt-3">
              <p className="text-[10px] font-black uppercase text-slate-900">{record.id.nome || 'PACIENTE'}</p>
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

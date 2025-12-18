
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

  const getRiskPrintStyles = (level?: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'border-green-400 bg-green-50 text-green-950';
      case 'MODERATE': return 'border-yellow-400 bg-yellow-50 text-yellow-950';
      default: return 'border-red-400 bg-red-50 text-red-950';
    }
  };

  return (
    <div id="clinical-summary" className="p-2 bg-white min-h-[60vh] print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <header className="mb-8 flex justify-between items-start border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">AnamneWEB - Registro Clínico</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <button onClick={handlePrint} className="no-print bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl">
          Exportar PDF
        </button>
      </header>

      <div className="space-y-8">
        <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Identificação</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
            <div><span className="text-slate-400 block text-[9px] font-bold uppercase">Nome</span> <span className="font-bold">{record.id.nome || 'N/D'}</span></div>
            <div><span className="text-slate-400 block text-[9px] font-bold uppercase">Idade</span> <span className="font-bold">{record.id.idade || 'N/D'}</span></div>
            <div><span className="text-slate-400 block text-[9px] font-bold uppercase">Sexo</span> <span className="font-bold">{record.id.sexo}</span></div>
            <div><span className="text-slate-400 block text-[9px] font-bold uppercase">Profissão</span> <span className="font-bold">{record.id.profissao || 'N/D'}</span></div>
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-bold text-blue-800 uppercase mb-3 border-b-2 border-blue-50 pb-1">Anamnese</h3>
          <div className="space-y-3">
            <div><span className="font-bold text-slate-800 text-[10px] uppercase">HMA:</span> <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{record.hma || 'Não informada.'}</p></div>
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-[11px] font-bold text-blue-800 uppercase mb-4 border-b-2 border-blue-50 pb-1">Sinais Vitais e Biometria</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-6 text-center">
             {[
               { label: 'PA', val: record.exameFisico.sinaisVitais.pa, eval: vitalStatus.pa },
               { label: 'FC', val: record.exameFisico.sinaisVitais.fc ? `${record.exameFisico.sinaisVitais.fc} bpm` : null, eval: vitalStatus.fc },
               { label: 'FR', val: record.exameFisico.sinaisVitais.fr ? `${record.exameFisico.sinaisVitais.fr} irpm` : null, eval: vitalStatus.fr },
               { label: 'SAT', val: record.exameFisico.sinaisVitais.sat ? `${record.exameFisico.sinaisVitais.sat}%` : null, eval: vitalStatus.sat },
               { label: 'TEMP', val: record.exameFisico.sinaisVitais.temp ? `${record.exameFisico.sinaisVitais.temp}°C` : null, eval: vitalStatus.temp },
               { label: 'IMC', val: record.exameFisico.sinaisVitais.imc, eval: bmiInterpretation }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 w-full min-h-[45px] flex flex-col justify-center">
                   <span className="block text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">{item.label}</span>
                   <span className="text-[11px] font-black text-slate-900 leading-none">{item.val || '--'}</span>
                 </div>
                 {item.eval?.label && (
                   <span className={`text-[8px] font-black uppercase mt-1.5 leading-none ${item.eval.color}`}>
                     {item.eval.label}
                   </span>
                 )}
               </div>
             ))}
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-[11px] font-bold text-blue-800 uppercase mb-3 border-b-2 border-blue-50 pb-1">Exame Físico Especial</h3>
          <div className="space-y-2 text-[12px] text-slate-700">
             {record.exameFisico.geral && <p><strong>Ectoscopia:</strong> {record.exameFisico.geral}</p>}
             {record.exameFisico.cabecaPescoco && <p><strong>Cabeça/Pescoço:</strong> {record.exameFisico.cabecaPescoco}</p>}
             {record.exameFisico.aparelhoRespiratorio && <p><strong>Respiratório:</strong> {record.exameFisico.aparelhoRespiratorio}</p>}
             {record.exameFisico.aparelhoCardiovascular && <p><strong>Cardiovascular:</strong> {record.exameFisico.aparelhoCardiovascular}</p>}
             {record.exameFisico.abdome && <p><strong>Abdome:</strong> {record.exameFisico.abdome}</p>}
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-[11px] font-bold text-blue-800 uppercase mb-3 border-b-2 border-blue-50 pb-1">Conduta</h3>
          <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{record.conduta || 'Aguardando definições.'}</p>
        </section>

        <footer className="mt-16 pt-10 border-t border-slate-300 flex justify-between items-end print:mt-20">
          <div className="text-center w-72 border-t border-slate-900 pt-2">
            <p className="text-[10px] font-black uppercase">{record.id.nome || 'ACADÊMICO'}</p>
          </div>
          <div className="text-center w-72 border-t border-slate-400 pt-2">
            <p className="text-[8px] text-slate-400 font-bold uppercase">Preceptor</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SummarySection;

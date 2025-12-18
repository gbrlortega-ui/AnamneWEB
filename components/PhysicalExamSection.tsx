
import React, { useEffect, useMemo } from 'react';
import { PhysicalExam, PatientType, PediatricSubType } from '../types';
import ClinicalGuidance from './ClinicalGuidance';
import { calculateZScore, parseAgeToMonths, getZScoreColor, classifyAdultBMI, getVitalSignsInterpretation } from '../services/growthService';

interface Props {
  data: PhysicalExam;
  patientType: PatientType;
  subType?: PediatricSubType;
  age?: string;
  sex?: string;
  onChange: (data: PhysicalExam) => void;
}

const PhysicalExamSection: React.FC<Props> = ({ data, patientType, subType, age = "", sex = "Masculino", onChange }) => {
  const ageMonths = useMemo(() => parseAgeToMonths(age), [age]);
  const ageYears = ageMonths / 12;

  useEffect(() => {
    const peso = parseFloat(data.sinaisVitais.peso || '0');
    const estatura = parseFloat(data.sinaisVitais.estatura || '0');
    if (peso > 0 && estatura > 0) {
      const imc = (peso / ((estatura / 100) ** 2)).toFixed(1);
      if (imc !== data.sinaisVitais.imc) {
        onChange({ ...data, sinaisVitais: { ...data.sinaisVitais, imc } });
      }
    }
  }, [data.sinaisVitais.peso, data.sinaisVitais.estatura]);

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, sinaisVitais: { ...data.sinaisVitais, [e.target.name]: e.target.value } });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const bmiInterpretation = useMemo(() => {
    if (patientType === PatientType.PEDIATRIC) return null;
    return classifyAdultBMI(parseFloat(data.sinaisVitais.imc || '0'), ageYears);
  }, [data.sinaisVitais.imc, ageYears, patientType]);

  const vitalStatus = useMemo(() => 
    getVitalSignsInterpretation(data.sinaisVitais, ageMonths, patientType), 
  [data.sinaisVitais, ageMonths, patientType]);

  const zScores = useMemo(() => {
    if (patientType !== PatientType.PEDIATRIC) return null;
    return {
      weight: calculateZScore(parseFloat(data.sinaisVitais.peso || '0'), ageMonths, 'weight', sex),
      height: calculateZScore(parseFloat(data.sinaisVitais.estatura || '0'), ageMonths, 'height', sex),
      bmi: calculateZScore(parseFloat(data.sinaisVitais.imc || '0'), ageMonths, 'bmi', sex),
      pc: ageMonths <= 24 ? calculateZScore(parseFloat(data.sinaisVitais.pc || '0'), ageMonths, 'pc', sex) : null,
    };
  }, [data.sinaisVitais, ageMonths, sex, patientType]);

  const getAreas = () => {
    const base = [
      { name: 'geral', label: 'Ectoscopia / Estado Geral', placeholder: 'Estado geral (BEG/REG/MEG), LOTE, biotipo, fácies...' },
      { name: 'peleAnexos', label: 'Pele e Anexos', placeholder: 'Coloração, umidade, turgor, lesões...' },
      { name: 'cabecaPescoco', label: 'Cabeça e Pescoço', placeholder: 'Pupilas, tireoide, linfonodos...' },
      { name: 'aparelhoRespiratorio', label: 'Aparelho Respiratório', placeholder: 'Expansibilidade, FTV, MV presente...' },
      { name: 'aparelhoCardiovascular', label: 'Aparelho Cardiovascular', placeholder: 'BRNF 2T sem sopros, pulsos...' },
      { name: 'abdome', label: 'Abdome', placeholder: 'RHA, timpanismo, massas, fígado, baço...' },
      { name: 'extremidades', label: 'Extremidades e Neurológico', placeholder: 'Edema, perfusão, força, reflexos...' },
    ];
    if (patientType === PatientType.PEDIATRIC) base.push({ name: 'fontanelas', label: 'Fontanelas', placeholder: 'Normotensa...' });
    return base;
  };

  const inputClass = "w-full px-3 py-2 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs font-bold transition-all";
  const interpretationClass = "text-[10px] font-black uppercase block mt-1 min-h-[14px] text-center";

  return (
    <section className="space-y-8">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4">
        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">Exame Físico</h2>
      </div>

      <ClinicalGuidance patientType={patientType} subType={subType} section="exam" />

      <div className="bg-background-light dark:bg-background-dark p-6 rounded-2xl border border-[#e5e7eb] dark:border-[#4a5568]">
        <h3 className="text-xs font-black text-primary mb-5 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">monitoring</span>
          Biometria e Sinais Vitais
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">PA (mmHg)</label>
            <input name="pa" value={data.sinaisVitais.pa} onChange={handleVitalChange} className={inputClass} placeholder="120/80" />
            <span className={`${interpretationClass} ${vitalStatus.pa.color}`}>{vitalStatus.pa.label}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">FC (bpm)</label>
            <input name="fc" value={data.sinaisVitais.fc} onChange={handleVitalChange} className={inputClass} placeholder="80" />
            <span className={`${interpretationClass} ${vitalStatus.fc.color}`}>{vitalStatus.fc.label}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">FR (irpm)</label>
            <input name="fr" value={data.sinaisVitais.fr} onChange={handleVitalChange} className={inputClass} placeholder="16" />
            <span className={`${interpretationClass} ${vitalStatus.fr.color}`}>{vitalStatus.fr.label}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">SAT (%)</label>
            <input name="sat" value={data.sinaisVitais.sat} onChange={handleVitalChange} className={inputClass} placeholder="98" />
            <span className={`${interpretationClass} ${vitalStatus.sat.color}`}>{vitalStatus.sat.label}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">TEMP (°C)</label>
            <input name="temp" value={data.sinaisVitais.temp} onChange={handleVitalChange} className={inputClass} placeholder="36.5" />
            <span className={`${interpretationClass} ${vitalStatus.temp.color}`}>{vitalStatus.temp.label}</span>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">PESO (kg)</label>
            <input name="peso" value={data.sinaisVitais.peso} onChange={handleVitalChange} className={inputClass} />
            {zScores?.weight && <span className={`text-[9px] font-bold block mt-1 text-center ${getZScoreColor(zScores.weight)}`}>Z: {zScores.weight}</span>}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">ESTATURA (cm)</label>
            <input name="estatura" value={data.sinaisVitais.estatura} onChange={handleVitalChange} className={inputClass} />
            {zScores?.height && <span className={`text-[9px] font-bold block mt-1 text-center ${getZScoreColor(zScores.height)}`}>Z: {zScores.height}</span>}
          </div>
          {patientType === PatientType.PEDIATRIC && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">PC (cm)</label>
              <input name="pc" value={data.sinaisVitais.pc} onChange={handleVitalChange} className={inputClass} placeholder="Perímetro Cefálico" />
              {zScores?.pc && <span className={`text-[9px] font-bold block mt-1 text-center ${getZScoreColor(zScores.pc)}`}>Z: {zScores.pc}</span>}
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">IMC</label>
            <input name="imc" value={data.sinaisVitais.imc} readOnly className={`${inputClass} bg-slate-50 dark:bg-black/20`} />
            {bmiInterpretation && <span className={`${interpretationClass} ${bmiInterpretation.color}`}>{bmiInterpretation.label}</span>}
            {zScores?.bmi && <span className={`text-[9px] font-bold block mt-1 text-center ${getZScoreColor(zScores.bmi)}`}>Z: {zScores.bmi}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {getAreas().map((a) => (
          <div key={a.name}>
            <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">{a.label}</label>
            <textarea name={a.name} value={(data as any)[a.name] || ''} onChange={handleAreaChange} placeholder={a.placeholder} className="w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl text-sm h-32 resize-none" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhysicalExamSection;

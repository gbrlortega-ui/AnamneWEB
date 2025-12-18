
import React, { useState, useEffect } from 'react';
import { RiskLevel } from '../types';

interface CVRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (resultText: string, level: RiskLevel) => void;
  defaultAge: string;
  defaultSex: string;
}

type Step = 'EXCLUSION' | 'METHOD' | 'INPUTS' | 'RESULT';

const CVRiskModal: React.FC<CVRiskModalProps> = ({ isOpen, onClose, onCalculate, defaultAge, defaultSex }) => {
  const [currentStep, setCurrentStep] = useState<Step>('EXCLUSION');
  const [knowsCholesterol, setKnowsCholesterol] = useState<boolean | null>(null);
  const [autoRiskData, setAutoRiskData] = useState<{ label: string; level: RiskLevel } | null>(null);

  const [formData, setFormData] = useState({
    hasCVD: false, // Infarto, AVC, etc.
    hasCKD: false,
    hasDM: false,
    age: 40,
    sex: 'Masculino',
    sbp: 120,
    isSmoker: false,
    cholesterol: 200,
    weight: 75,
    height: 175
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('EXCLUSION');
      setKnowsCholesterol(null);
      setAutoRiskData(null);
      const parsedAge = parseInt(defaultAge.replace(/\D/g, '')) || 40;
      setFormData(prev => ({ ...prev, age: parsedAge, sex: defaultSex }));
    }
  }, [isOpen, defaultAge, defaultSex]);

  if (!isOpen) return null;

  const handleExclusionNext = () => {
    if (formData.hasCVD) {
      // PACIENTE COM EVENTO PRÉVIO = MUITO ALTO RISCO (PREVENÇÃO SECUNDÁRIA)
      setAutoRiskData({ label: 'MUITO ALTO RISCO (Prevenção Secundária)', level: 'EXTREME' });
      setCurrentStep('RESULT');
    } else if (formData.hasCKD) {
      setAutoRiskData({ label: 'ALTO RISCO (Doença Renal Crônica)', level: 'HIGH' });
      setCurrentStep('RESULT');
    } else if (formData.hasDM) {
      setAutoRiskData({ label: 'ALTO RISCO (Diabetes Mellitus)', level: 'HIGH' });
      setCurrentStep('RESULT');
    } else {
      setCurrentStep('METHOD');
    }
  };

  const calculateRisk = () => {
    const { age, sbp, isSmoker, cholesterol, weight, height, sex } = formData;
    
    // Placeholder de Modelo Preditivo WHO/ISH simplificado
    let risk = 1; 

    // Idade (Fator principal)
    if (age >= 70) risk += 10;
    else if (age >= 60) risk += 6;
    else if (age >= 50) risk += 3;
    else if (age >= 40) risk += 1;

    // Pressão Sistólica
    if (sbp >= 180) risk += 15;
    else if (sbp >= 160) risk += 8;
    else if (sbp >= 140) risk += 4;
    else if (sbp >= 130) risk += 1;

    // Tabagismo
    if (isSmoker) risk += 5;

    // Metabolismo
    if (knowsCholesterol) {
      if (cholesterol >= 300) risk += 8;
      else if (cholesterol >= 240) risk += 4;
      else if (cholesterol >= 200) risk += 1;
    } else {
      const imc = weight / ((height / 100) ** 2);
      if (imc >= 35) risk += 6;
      else if (imc >= 30) risk += 3;
      else if (imc >= 25) risk += 1;
    }

    // Sexo (M > F na escala de risco bruto)
    if (sex === 'Masculino') risk += 2;

    // Mapeamento de Categoria PAHO
    let category: RiskLevel = 'LOW';
    if (risk >= 30) category = 'EXTREME';
    else if (risk >= 20) category = 'VERY_HIGH';
    else if (risk >= 10) category = 'HIGH';
    else if (risk >= 5) category = 'MODERATE';

    return { percent: risk, category };
  };

  const result = autoRiskData ? { percent: null, category: autoRiskData.level } : calculateRisk();

  const handleApply = () => {
    let text = "";
    if (autoRiskData) {
      text = autoRiskData.label;
    } else {
      const catText = { 
        LOW: 'Baixo (<5%)', 
        MODERATE: 'Moderado (5-9%)', 
        HIGH: 'Alto (10-19%)', 
        VERY_HIGH: 'Muito Alto (20-29%)',
        EXTREME: 'Crítico (≥30%)' 
      }[result.category];
      text = `${result.percent}% - ${catText}`;
    }
    onCalculate(text, result.category);
  };

  const getRiskColor = (cat: RiskLevel) => {
    switch (cat) {
      case 'LOW': return 'bg-green-500';
      case 'MODERATE': return 'bg-yellow-400';
      case 'HIGH': return 'bg-orange-500';
      case 'VERY_HIGH': return 'bg-red-600';
      case 'EXTREME': return 'bg-[#7f1d1d]'; // Vinho / Dark Red
      default: return 'bg-slate-300';
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Calculadora PAHO</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Modelo WHO/ISH - Prevenção CV</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {currentStep === 'EXCLUSION' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">1. Triagem de Condições Existentes</h4>
                <p className="text-sm text-slate-500">O paciente já possui algum evento cardiovascular ou diagnóstico de alto risco?</p>
              </div>
              
              <div className="grid gap-3">
                {[
                  { id: 'hasCVD', label: 'Histórico de DCV (Infarto, AVC, Angina, AIT)', hint: 'Classifica automaticamente como MUITO ALTO RISCO' },
                  { id: 'hasCKD', label: 'Doença Renal Crônica (TFG < 60)', hint: 'Classifica automaticamente como ALTO RISCO' },
                  { id: 'hasDM', label: 'Diabetes Mellitus', hint: 'Classifica automaticamente como ALTO RISCO' },
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all group">
                    <input 
                      type="checkbox" 
                      checked={(formData as any)[item.id]} 
                      onChange={e => setFormData({...formData, [item.id]: e.target.checked})}
                      className="size-6 rounded-lg text-primary focus:ring-primary border-slate-300"
                    />
                    <div>
                      <span className="block font-bold text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                      <span className="text-[11px] text-slate-400">{item.hint}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              <button onClick={handleExclusionNext} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                Continuar
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {currentStep === 'METHOD' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h4 className="font-bold text-slate-800 text-center text-lg">2. Método de Cálculo</h4>
              <p className="text-sm text-center text-slate-500">Escolha o modelo de predição disponível para este paciente.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setKnowsCholesterol(true); setCurrentStep('INPUTS'); }}
                  className="p-8 border-2 border-slate-100 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary">biotech</span>
                  <span className="font-bold text-slate-700">Modelo Laboratorial</span>
                  <span className="text-xs text-slate-400">Usa Colesterol Total</span>
                </button>
                <button 
                  onClick={() => { setKnowsCholesterol(false); setCurrentStep('INPUTS'); }}
                  className="p-8 border-2 border-slate-100 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary">straighten</span>
                  <span className="font-bold text-slate-700">Modelo Não-Laboratorial</span>
                  <span className="text-xs text-slate-400">Usa IMC (Peso/Altura)</span>
                </button>
              </div>
              <button onClick={() => setCurrentStep('EXCLUSION')} className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Voltar</button>
            </div>
          )}

          {currentStep === 'INPUTS' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h4 className="font-bold text-slate-800">3. Dados Clínicos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Idade (30-79 anos)</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">PA Sistólica (mmHg)</label>
                  <input type="number" value={formData.sbp} onChange={e => setFormData({...formData, sbp: parseInt(e.target.value)})} className={inputClass} />
                </div>
                
                {knowsCholesterol ? (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Colesterol Total (mg/dL)</label>
                    <input type="number" value={formData.cholesterol} onChange={e => setFormData({...formData, cholesterol: parseInt(e.target.value)})} className={inputClass} />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Peso (kg)</label>
                      <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Altura (cm)</label>
                      <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className={inputClass} />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="flex items-center justify-center gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:bg-slate-50 border-slate-100">
                    <input type="checkbox" checked={formData.isSmoker} onChange={e => setFormData({...formData, isSmoker: e.target.checked})} className="size-5 text-primary rounded" />
                    <span className="font-bold text-slate-700 text-sm">Fumante Atual</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep('METHOD')} className="flex-1 py-4 text-slate-500 font-bold border rounded-2xl hover:bg-slate-50 transition-all">Voltar</button>
                <button onClick={() => setCurrentStep('RESULT')} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">Calcular Risco</button>
              </div>
            </div>
          )}

          {currentStep === 'RESULT' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row gap-8 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                
                {/* Visual Bar - PAHO style */}
                <div className="w-24 h-64 bg-slate-200 rounded-full relative overflow-hidden border-4 border-white shadow-inner flex flex-col">
                  <div className="h-[20%] bg-[#7f1d1d] w-full" title="Muito Alto / Crítico"></div>
                  <div className="h-[20%] bg-red-600 w-full" title="Muito Alto"></div>
                  <div className="h-[20%] bg-orange-500 w-full" title="Alto"></div>
                  <div className="h-[20%] bg-yellow-400 w-full" title="Moderado"></div>
                  <div className="h-[20%] bg-green-500 w-full" title="Baixo"></div>
                  
                  {/* Indicator Needle */}
                  <div 
                    className="absolute left-0 right-0 h-1.5 bg-white shadow-md z-10 transition-all duration-1000 ease-out"
                    style={{ 
                      bottom: autoRiskData 
                        ? (autoRiskData.level === 'EXTREME' ? '90%' : '70%') 
                        : `${Math.min(95, Math.max(5, (result.percent || 0) * 3))}%` 
                    }}
                  >
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded font-black whitespace-nowrap">
                      RESULTADO
                    </div>
                  </div>
                </div>

                {/* Result Text */}
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Risco Cardiovascular Global</p>
                    <h2 className="text-5xl font-black text-slate-900">
                      {autoRiskData ? '--' : `${result.percent}%`}
                    </h2>
                  </div>
                  
                  <div className={`inline-block px-5 py-2.5 rounded-2xl text-white font-black text-sm ${getRiskColor(result.category)} shadow-lg`}>
                    {autoRiskData ? autoRiskData.label : (
                      result.category === 'LOW' ? 'RISCO BAIXO (<5%)' : 
                      result.category === 'MODERATE' ? 'RISCO MODERADO (5-9%)' : 
                      result.category === 'HIGH' ? 'RISCO ALTO (10-19%)' : 
                      result.category === 'VERY_HIGH' ? 'RISCO MUITO ALTO (20-29%)' : 'RISCO CRÍTICO (≥30%)'
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-2xl space-y-2 border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Parâmetros Utilizados</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 font-bold">
                      <span>Idade: {formData.age}a</span>
                      <span>Sexo: {formData.sex}</span>
                      <span>PAS: {formData.sbp}mmHg</span>
                      <span>Fumante: {formData.isSmoker ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep('EXCLUSION')} className="flex-1 py-4 text-slate-500 font-bold border rounded-2xl hover:bg-slate-50 transition-all">Novo Cálculo</button>
                <button onClick={handleApply} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  Aplicar na Anamnese
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CVRiskModal;


import React, { useState, useEffect } from 'react';

interface IVCF20ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (score: number, resultText: string, level: 'LOW' | 'MODERATE' | 'HIGH') => void;
  defaultAge: string;
}

type Step = 'INTRO' | 'AGE_HEALTH' | 'ADL' | 'COGNITION_HUMOR' | 'MOBILITY' | 'COMMUNICATION' | 'COMORBIDITIES' | 'RESULT';

const IVCF20Modal: React.FC<IVCF20ModalProps> = ({ isOpen, onClose, onCalculate, defaultAge }) => {
  const [currentStep, setCurrentStep] = useState<Step>('INTRO');
  
  const [answers, setAnswers] = useState({
    q1: 0, // Idade
    q2: 0, // Saúde
    q3: 0, q4: 0, q5: 0, // AVD Instrumental
    q6: 0, // AVD Básica
    q7: 0, q8: 0, q9: 0, // Cognição
    q10: 0, q11: 0, // Humor
    q12: 0, q13: 0, // Alcance/Grip
    q14: 0, // Capacidade Aeróbica (Grupo)
    q15: 0, q16: 0, // Marcha
    q17: 0, // Continência
    q18: 0, q19: 0, // Visão/Audição
    q20: 0, // Comorbidades
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('INTRO');
      const parsedAge = parseInt(defaultAge.replace(/\D/g, '')) || 60;
      let agePoints = 0;
      if (parsedAge >= 85) agePoints = 3;
      else if (parsedAge >= 75) agePoints = 1;
      
      setAnswers(prev => ({ ...prev, q1: agePoints }));
    }
  }, [isOpen, defaultAge]);

  if (!isOpen) return null;

  const calculateTotal = () => {
    // Regra oficial: A pontuação máxima do item AVD Instrumental é 4 pontos, mesmo que responda sim para 3, 4 e 5.
    const avdInstrumental = Math.min(4, answers.q3 + answers.q4 + answers.q5);
    
    // Regra oficial: A pontuação máxima deste item (14) é de 2 pontos.
    const capAerobica = Math.min(2, answers.q14);

    // Regra oficial: A pontuação máxima deste item (20) é de 4 pontos.
    const comorbidadeMultipla = Math.min(4, answers.q20);

    return (
      answers.q1 + 
      answers.q2 + 
      avdInstrumental + 
      answers.q6 + 
      (answers.q7 + answers.q8 + answers.q9) + // Cognição: 7(1) + 8(1) + 9(2)
      (answers.q10 + answers.q11) + // Humor: 10(2) + 11(2)
      (answers.q12 + answers.q13) + // Mobilidade: 12(1) + 13(1)
      capAerobica + 
      (answers.q15 + answers.q16) + // Marcha: 15(2) + 16(2)
      answers.q17 + // Continência: 17(2)
      (answers.q18 + answers.q19) + // Comunicação: 18(2) + 19(2)
      comorbidadeMultipla
    );
  };

  const score = calculateTotal();
  let level: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let resultText = "Baixa vulnerabilidade clínico-funcional";
  
  if (score >= 15) {
    level = 'HIGH';
    resultText = "Alta vulnerabilidade clínico-funcional (Idoso Frágil)";
  } else if (score >= 7) {
    level = 'MODERATE';
    resultText = "Vulnerabilidade moderada (Indicação de AGA)";
  }

  const handleApply = () => {
    onCalculate(score, resultText, level);
    onClose();
  };

  const nextStep = () => {
    const steps: Step[] = ['INTRO', 'AGE_HEALTH', 'ADL', 'COGNITION_HUMOR', 'MOBILITY', 'COMMUNICATION', 'COMORBIDITIES', 'RESULT'];
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1]);
  };

  const prevStep = () => {
    const steps: Step[] = ['INTRO', 'AGE_HEALTH', 'ADL', 'COGNITION_HUMOR', 'MOBILITY', 'COMMUNICATION', 'COMORBIDITIES', 'RESULT'];
    const idx = steps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1]);
  };

  const Question = ({ label, id, options, points }: { label: string, id: keyof typeof answers, options: string[], points: number[] }) => (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswers({ ...answers, [id]: points[i] })}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left text-xs font-semibold ${
              answers[id] === points[i] 
                ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                : 'border-white dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            {opt}
            {answers[id] === points[i] && <span className="material-symbols-outlined text-sm">check_circle</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#1a202c] w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-3xl">assignment_late</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">IVCF-20 Oficial</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">Rastreio de Vulnerabilidade</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {currentStep === 'INTRO' && (
            <div className="space-y-6 text-center py-10 animate-in fade-in duration-300">
              <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-primary">elderly</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">Iniciando IVCF-20</h4>
              <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Este instrumento identifica o idoso frágil ou em risco de fragilização. Responda conforme o relato do paciente e as regras de pontuação máxima por domínio.
              </p>
              <button onClick={nextStep} className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Começar Rastreio
              </button>
            </div>
          )}

          {currentStep === 'AGE_HEALTH' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Identificação e Percepção</h5>
              <Question 
                label="1. Qual é a sua idade?" 
                id="q1" 
                options={["60-74 anos (0)", "75-84 anos (1)", "≥ 85 anos (3)"]} 
                points={[0, 1, 3]} 
              />
              <Question 
                label="2. Em geral, comparando com outras pessoas da sua idade, você diria que sua saúde é:" 
                id="q2" 
                options={["Excelente / Muito Boa / Boa (0)", "Regular ou Ruim (1)"]} 
                points={[0, 1]} 
              />
            </div>
          )}

          {currentStep === 'ADL' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">AVD Instrumental e Básica</h5>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/40 mb-4">
                <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold leading-tight uppercase tracking-widest">Regra do Domínio: Max 4 pontos para questões 3, 4 e 5.</p>
              </div>
              <Question label="3. Deixou de fazer compras?" id="q3" options={["Não (0)", "Sim (4)"]} points={[0, 4]} />
              <Question label="4. Deixou de controlar dinheiro ou pagar contas?" id="q4" options={["Não (0)", "Sim (4)"]} points={[0, 4]} />
              <Question label="5. Deixou de realizar pequenos trabalhos domésticos?" id="q5" options={["Não (0)", "Sim (4)"]} points={[0, 4]} />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Question label="6. Deixou de tomar banho sozinho(a)?" id="q6" options={["Não (0)", "Sim (6)"]} points={[0, 6]} />
              </div>
            </div>
          )}

          {currentStep === 'COGNITION_HUMOR' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Cognição e Humor</h5>
              <Question label="7. Familiares/Amigos notaram esquecimento?" id="q7" options={["Não (0)", "Sim (1)"]} points={[0, 1]} />
              <Question label="8. Esquecimento piorando nos últimos meses?" id="q8" options={["Não (0)", "Sim (1)"]} points={[0, 1]} />
              <Question label="9. Esquecimento impede alguma atividade cotidiana?" id="q9" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Question label="10. Ficou com desânimo, tristeza ou desesperança?" id="q10" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
                <Question label="11. Perdeu interesse ou prazer em atividades?" id="q11" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
              </div>
            </div>
          )}

          {currentStep === 'MOBILITY' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Mobilidade</h5>
              <Question label="12. Incapaz de elevar braços acima do nível do ombro?" id="q12" options={["Não (0)", "Sim (1)"]} points={[0, 1]} />
              <Question label="13. Incapaz de manusear ou segurar pequenos objetos?" id="q13" options={["Não (0)", "Sim (1)"]} points={[0, 1]} />
              <Question 
                label="14. Perda peso, IMC < 22, Panturrilha < 31cm ou Marcha > 5s?" 
                id="q14" 
                options={["Não (0)", "Sim - Alguma das condições (2)"]} 
                points={[0, 2]} 
              />
              <Question label="15. Dificuldade para caminhar que impede atividades?" id="q15" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
              <Question label="16. Duas ou mais quedas no último ano?" id="q16" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
            </div>
          )}

          {currentStep === 'COMMUNICATION' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Continência e Comunicação</h5>
              <Question label="17. Perda involuntária de urina ou fezes?" id="q17" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
              <Question label="18. Problema de visão que impede alguma atividade?" id="q18" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
              <Question label="19. Problema de audição que impede alguma atividade?" id="q19" options={["Não (0)", "Sim (2)"]} points={[0, 2]} />
            </div>
          )}

          {currentStep === 'COMORBIDITIES' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Comorbidade Múltipla</h5>
              <Question 
                label="20. Cinco+ doenças, polifarmácia (≥5 meds) ou internação recente?" 
                id="q20" 
                options={["Não (0)", "Sim (4)"]} 
                points={[0, 4]} 
              />
            </div>
          )}

          {currentStep === 'RESULT' && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center text-center">
                <div className={`size-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl mb-6 ${
                  level === 'LOW' ? 'bg-green-500' : level === 'MODERATE' ? 'bg-yellow-500' : 'bg-red-600'
                }`}>
                  <span className="text-xs font-black uppercase">Escore</span>
                  <span className="text-5xl font-black">{score}</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{resultText}</h4>
                <div className="mt-4 max-w-sm">
                  {score >= 7 && (
                    <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                      <span className="material-symbols-outlined text-sm">notification_important</span>
                      Indicação Formal de AGA
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase mb-4 tracking-widest text-center">Interpretação do Escore</p>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-xs px-4 py-3 rounded-xl font-bold border ${score <= 6 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                    <span>0-6 pontos</span>
                    <span>Baixa Vulnerabilidade</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs px-4 py-3 rounded-xl font-bold border ${score >= 7 && score <= 14 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                    <span>7-14 pontos</span>
                    <span>Moderada Vulnerabilidade</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs px-4 py-3 rounded-xl font-bold border ${score >= 15 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                    <span>≥ 15 pontos</span>
                    <span>Alta Vulnerabilidade (Frágil)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 flex gap-4">
          {currentStep !== 'INTRO' && currentStep !== 'RESULT' && (
            <button onClick={prevStep} className="flex-1 py-4 text-slate-500 font-bold border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">
              Anterior
            </button>
          )}
          
          {currentStep !== 'INTRO' && currentStep !== 'RESULT' && (
            <button onClick={nextStep} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
              Próximo Domínio
            </button>
          )}

          {currentStep === 'RESULT' && (
            <>
              <button onClick={() => setCurrentStep('AGE_HEALTH')} className="flex-1 py-4 text-slate-500 font-bold border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                Revisar
              </button>
              <button onClick={handleApply} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">save</span>
                Salvar Avaliação
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IVCF20Modal;


import React, { useState, useEffect } from 'react';
import { 
  ClinicalRecord, 
  FormStep, 
  PatientType,
  PediatricSubType
} from './types';
import IdentificationSection from './components/IdentificationSection';
import HistorySection from './components/HistorySection';
import ISDASection from './components/ISDASection';
import AntecedentsSection from './components/AntecedentsSection';
import PhysicalExamSection from './components/PhysicalExamSection';
import SummarySection from './components/SummarySection';
import SoapSection from './components/SoapSection';
import SynthesisSection from './components/SynthesisSection';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import GlossaryModal from './components/GlossaryModal';

const INITIAL_STATE = (type: PatientType, subType?: PediatricSubType): ClinicalRecord => ({
  patientType: type,
  pediatricSubType: subType,
  id: {
    nome: '', idade: '', sexo: 'Masculino', cor: '', estadoCivil: '', 
    profissao: '', naturalidade: '', residencia: '', responsavel: '', escolaridade: '', cuidador: ''
  },
  qd: '',
  hma: '',
  isda: {
    geral: '', cabecaPescoco: '', torax: '', abdome: '', 
    genitourinario: '', musculoEsqueletico: '', nervoso: '', crescimento: '', cognitivo: ''
  },
  antecedentes: {
    fisiologicos: '', patologicos: '', familiares: '', habitos: '', psicossocial: '',
    gestacional: '', neonatal: '', dnpm: '', vacinacao: '', funcionalidade: '', polifarmacia: ''
  },
  exameFisico: {
    geral: '',
    sinaisVitais: { pa: '', fc: '', fr: '', temp: '', sat: '', peso: '', estatura: '', pc: '' },
    peleAnexos: '',
    cabecaPescoco: '',
    aparelhoRespiratorio: '',
    aparelhoCardiovascular: '',
    abdome: '',
    aparelhoGenitourinario: '',
    aparelhoMusculoEsqueletico: '',
    extremidades: '',
    neurologico: '',
    fontanelas: ''
  },
  soap: { 
    s: {
      identificacao: '',
      qpHma: '',
      isda: '',
      antFisiologicos: '',
      antPatologicos: '',
      medicacoes: '',
      antFamiliares: '',
      habitos: '',
      socioeconomico: '',
      vacinacao: ''
    }, 
    o: '', 
    assessments: [{ id: '1', text: '' }], 
    plans: [{ id: '1', text: '', category: 'DIAGNOSTIC', linkedAssessments: ['1'] }] 
  },
  hipoteseDiagnostica: '',
  fatoresRisco: '',
  conduta: ''
});

const App: React.FC = () => {
  const [record, setRecord] = useState<ClinicalRecord | null>(() => {
    const saved = localStorage.getItem('medhist_draft_v4');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentStep, setCurrentStep] = useState<FormStep>(
    record ? (record.patientType === PatientType.SOAP ? FormStep.QD_HMA : FormStep.IDENTIFICATION) : FormStep.TYPE_SELECTION
  );
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  useEffect(() => {
    if (record) {
      localStorage.setItem('medhist_draft_v4', JSON.stringify(record));
    }
  }, [record]);

  const startNewRecord = (type: PatientType, subType?: PediatricSubType) => {
    if (type === PatientType.PEDIATRIC && !subType) {
      setCurrentStep(FormStep.PEDIATRIC_SUB_SELECTION);
      return;
    }
    setRecord(INITIAL_STATE(type, subType));
    setCurrentStep(type === PatientType.SOAP ? FormStep.QD_HMA : FormStep.IDENTIFICATION);
  };

  const updateRecord = (updates: Partial<ClinicalRecord>) => {
    if (record) setRecord(prev => ({ ...prev!, ...updates }));
  };

  const nextStep = () => {
    if (record?.patientType === PatientType.SOAP) {
      if (currentStep === FormStep.QD_HMA) setCurrentStep(FormStep.PHYSICAL_EXAM);
      else if (currentStep === FormStep.PHYSICAL_EXAM) setCurrentStep(FormStep.SOAP_ASSESSMENT);
      else if (currentStep === FormStep.SOAP_ASSESSMENT) setCurrentStep(FormStep.SUMMARY);
    } else {
      if (currentStep === FormStep.PHYSICAL_EXAM) setCurrentStep(FormStep.SYNTHESIS);
      else if (currentStep === FormStep.SYNTHESIS) setCurrentStep(FormStep.SUMMARY);
      else if (currentStep < FormStep.SUMMARY) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === FormStep.IDENTIFICATION || (record?.patientType === PatientType.SOAP && currentStep === FormStep.QD_HMA)) {
       if (record?.patientType === PatientType.PEDIATRIC) setCurrentStep(FormStep.PEDIATRIC_SUB_SELECTION);
       else setCurrentStep(FormStep.TYPE_SELECTION);
    }
    else if (record?.patientType === PatientType.SOAP) {
      if (currentStep === FormStep.PHYSICAL_EXAM) setCurrentStep(FormStep.QD_HMA);
      else if (currentStep === FormStep.SOAP_ASSESSMENT) setCurrentStep(FormStep.PHYSICAL_EXAM);
      else if (currentStep === FormStep.SUMMARY) setCurrentStep(FormStep.SOAP_ASSESSMENT);
    } else {
      if (currentStep === FormStep.SUMMARY) setCurrentStep(FormStep.SYNTHESIS);
      else if (currentStep === FormStep.SYNTHESIS) setCurrentStep(FormStep.PHYSICAL_EXAM);
      else if (currentStep > FormStep.IDENTIFICATION) setCurrentStep(currentStep - 1);
    }
  };

  const goToSelection = () => {
    setCurrentStep(FormStep.TYPE_SELECTION);
  };

  const Header = () => (
    <div className="w-full bg-white dark:bg-[#1a202c] border-b border-[#f0f2f4] dark:border-[#2d3748] no-print shrink-0 z-50 shadow-sm">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between h-16">
        <div className="flex items-center gap-4 text-[#111418] dark:text-white cursor-pointer" onClick={goToSelection}>
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <span className="material-symbols-outlined">clinical_notes</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">AnamneWEB</h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsGlossaryOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary active:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Glossário</span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-[#f0f2f4] dark:border-[#2d3748]">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white dark:border-[#1a202c] shadow-sm shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRdvCecgXrh1P5617u8qPoi2E2B6bInxzgtwh0DsDHiIAMC7B3CifzYa5gdKpap5OeRSYVo_NAkNJxk_-gDiXQGZZrev3nLdgSIheHaufdc_Jlre2IZMvhvInLN3tK4v1LAgWIZNArfvs7EkFx5d_pFOD41i3cJVaTYdfbDcGZO82qqIi15jJ46g0KrwNsvDxWUB8SeoGduZkCQ4u7zT82x4c8xhxkluqrgQDsisJ5MHjRhUxpnIPZzIlX4AcHzga3-zaKBxLDMDeC")'}}></div>
            <div className="hidden xs:block overflow-hidden">
              <p className="text-xs font-bold leading-none dark:text-white truncate">Dr. Aluno</p>
              <p className="text-[10px] text-[#617289] dark:text-gray-400 mt-1 truncate">Medicina - 5º Ano</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="border-t border-[#f0f2f4] dark:border-[#2d3748] bg-white dark:bg-[#1a202c] py-8 px-5 text-center mt-auto no-print">
      <div className="layout-content-container flex flex-col max-w-[960px] mx-auto">
        <div className="mb-4">
          <p className="text-[#617289] dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
            Desenvolvido por Gabriel Ortega Antonio
          </p>
        </div>
        <p className="text-[#9ca3af] text-[10px] font-normal leading-normal uppercase tracking-widest">© 2024 AnamneWEB. Todos os direitos reservados.</p>
      </div>
    </footer>
  );

  if (currentStep === FormStep.TYPE_SELECTION) {
    return (
      <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center py-10 px-4 sm:px-8">
            <div className="layout-content-container flex flex-col max-w-[1024px] flex-1">
              <div className="flex flex-col gap-2 mb-10 text-center sm:text-left">
                <h1 className="text-[#111418] dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Nova Anamnese</h1>
                <p className="text-[#617289] dark:text-gray-400 text-lg font-normal leading-normal max-w-2xl">
                  Selecione o tipo de roteiro abaixo para iniciar o atendimento médico. Escolha o perfil que melhor se adapta ao seu paciente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    type: PatientType.PEDIATRIC, 
                    label: 'Pediatria', 
                    desc: 'Desenvolvimento infantil, histórico vacinal e antecedentes neonatais.', 
                    badge: '0-19 Anos', 
                    icon: 'child_care', 
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjKgJ3c8kH3tl2-4bnES2DAInhqn-UVeoKniwQ4XjuT-8LtIEEp9FwtdoGY6XwuE8m0v2p9t2mJxU7gkSei_-9Ly1YlOqzDx2WWvme6tDAGTXB-Uo3FgFunsa3E4_dnqosXOra7Uts8rbJiOuUfjULb39prFS9uoKUX-wB7ZTLgzIh-JU55FZbWFnwZ761965GgtS4YH8lFon-cdFl_jnv8Tv4goUPhJfOUzw019Y7y-xaExVr_KGS5ETkEvuhOuD94zQzmNd0OBPg',
                    badgeColor: 'bg-blue-100 text-blue-800'
                  },
                  { 
                    type: PatientType.ADULT, 
                    label: 'Adulta', 
                    desc: 'Anamnese clínica tradicional completa, revisão de sistemas e hábitos.', 
                    badge: 'Clínica Geral', 
                    icon: 'person', 
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf_yRruspGVFZXa_N1mnONdy0c8k-DP3kAXVQEqObm1VmsRkBfsHCgfbJBEGcNcUx3dSPgzjtMP_hjJdeMnsfSiLzKRVCKbtrqwANexr8Z_f_hPHAkWR2RhTwwicNsHCrzkPxWplGH7_3lzIkw0xvCFae-ju4Z6ffP2lRlMZqdSMlyiniBsjwcCzCHViy5pjbY-XXhFoVGlje_gaTTASG4CkNU20ZwQ4GHkhbEv4VEGh9h5KnWr9Z-EA45d14e-Q2JxF1r_B2KWFFN',
                    badgeColor: 'bg-green-100 text-green-800'
                  },
                  { 
                    type: PatientType.GERIATRIC, 
                    label: 'Geriatria', 
                    desc: 'Funcionalidade, cognição, rede social e análise de polifarmácia.', 
                    badge: '60+ Anos', 
                    icon: 'elderly', 
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqIJ5XkJUUt41eirZRINNU7okAxU3QHiS2496kb3q4BkrQVG3NGLsyo05IlNdQoTwoTqrauMGk5aFAKQXFFTBk1ZPH-LKwLXB9K2umawhbNONnoNsS9Do-xuXsiZ9d2en2dIugl8G3iMBvzRyLEbxiiwhHycb91Wx058S9bu2LNOy0BmboXIgMDZpCJPpkDCk_y1XnGHj6inkHBzjtMECbPYMFU8F3Oe7TKxIh0WzwdQ8QIknS8wUwBVHUatpbXbKTw2e6a3dx02dz',
                    badgeColor: 'bg-purple-100 text-purple-800'
                  },
                  { 
                    type: PatientType.SOAP, 
                    label: 'SOAP', 
                    desc: 'Evolução clínica estruturada: Subjetivo, Objetivo, Avaliação e Plano.', 
                    badge: 'Ambulatório', 
                    icon: 'assignment', 
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC044-CNjn6zhWMdxCcORzpWt4MzC3LE89waRdKNcD2Q-eaeOvoaS3MWChpR8PGH9QjGDwQ5zRhyQaunqUe_GwSGdyGHn0y4i8_mt90k1MCc1-O-zf5ljbN5K3f1T-IgtCEaIQnfh4R4iBtkGq56N-FkrxjrdibYGZz3fGZNWZ6Z2m_JqvZAiqbuErjPqYCrmhgLTsl5_auuvscKAJ6gXIA8J29_8c5S1_fc1k8NOLy3NryhghjI3Usk0gUypTrc9eX5Zm_Oxii0B6j',
                    badgeColor: 'bg-orange-100 text-orange-800'
                  },
                ].map((card) => (
                  <div key={card.type} onClick={() => startNewRecord(card.type)} className="group flex flex-col bg-white dark:bg-[#1a202c] rounded-xl overflow-hidden border border-[#e5e7eb] dark:border-[#2d3748] hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="h-40 w-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                      <div className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url("${card.img}")`}}></div>
                      <div className="absolute bottom-3 left-3 z-20">
                        <div className={`${card.badgeColor} text-[10px] font-bold px-2 py-0.5 rounded shadow-sm`}>{card.badge}</div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3 flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined shrink-0">{card.icon}</span>
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold truncate">{card.label}</h3>
                      </div>
                      <p className="text-[#617289] dark:text-gray-400 text-xs leading-relaxed mb-6 flex-1 line-clamp-3">{card.desc}</p>
                      <button className="w-full py-2 px-4 bg-[#f0f2f4] dark:bg-[#2d3748] hover:bg-primary hover:text-white text-[#111418] dark:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white">
                        Iniciar Roteiro
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {record && (
                <div className="mt-12 text-center">
                  <button onClick={() => setCurrentStep(record.patientType === PatientType.SOAP ? FormStep.QD_HMA : FormStep.IDENTIFICATION)} className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-2 mx-auto">
                    <span className="material-symbols-outlined text-sm">history</span>
                    Continuar rascunho: {record.id.nome || 'Paciente sem nome'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
        <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      </div>
    );
  }

  if (currentStep === FormStep.PEDIATRIC_SUB_SELECTION) {
    return (
      <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center py-10 px-4 sm:px-8">
            <div className="layout-content-container flex flex-col max-w-[1024px] flex-1">
              <button onClick={() => setCurrentStep(FormStep.TYPE_SELECTION)} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:underline">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Voltar ao Início
              </button>
              <div className="flex flex-col gap-2 mb-10 text-center sm:text-left">
                <h1 className="text-[#111418] dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Subdivisão Pediátrica</h1>
                <p className="text-[#617289] dark:text-gray-400 text-lg font-normal leading-normal max-w-2xl">
                  O roteiro pediátrico varia significativamente com a idade. Selecione a faixa etária correta:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { type: PediatricSubType.NEONATE, label: 'Neonato', desc: '0 a 28 dias. Foco total em parto e vida intrauterina.', icon: 'baby_changing_station' },
                  { type: PediatricSubType.INFANT, label: 'Lactante', desc: '29 dias a 2 anos. Crescimento e marcos do DNPM.', icon: 'crib' },
                  { type: PediatricSubType.PRE_SCHOOL, label: 'Pré-escolar', desc: '2 a 6 anos. Socialização e alimentação variada.', icon: 'toys' },
                  { type: PediatricSubType.SCHOOL, label: 'Escolar', desc: '6 a 12 anos. Rendimento escolar e atividades físicas.', icon: 'school' },
                  { type: PediatricSubType.ADOLESCENT, label: 'Adolescente', desc: '12 a 19 anos. Puberdade, psicossocial e riscos.', icon: 'emoji_people' },
                ].map((sub) => (
                  <div key={sub.type} onClick={() => startNewRecord(PatientType.PEDIATRIC, sub.type)} className="group flex flex-col bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e5e7eb] dark:border-[#2d3748] hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="mb-4 size-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[28px]">{sub.icon}</span>
                    </div>
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-2">{sub.label}</h3>
                    <p className="text-[#617289] dark:text-gray-400 text-xs leading-relaxed flex-1">{sub.desc}</p>
                    <div className="mt-6 flex items-center text-primary font-bold text-xs gap-2 group-hover:translate-x-1 transition-transform">
                      Selecionar Roteiro
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
        <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
      <Header />
      
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto overflow-hidden relative">
        <div className="no-print shrink-0 h-full">
          <Sidebar 
            currentStep={currentStep} 
            onStepClick={setCurrentStep} 
            patientType={record.patientType} 
            pediatricSubType={record.pediatricSubType}
            onGoBack={goToSelection}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 scroll-smooth flex flex-col">
          <div className="max-w-[1024px] mx-auto w-full flex flex-col flex-1">
            <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2d3748] p-6 md:p-10 flex-1 mb-8">
              {currentStep === FormStep.IDENTIFICATION && record.patientType !== PatientType.SOAP && (
                <IdentificationSection patientType={record.patientType} data={record.id} onChange={(id) => updateRecord({ id })} />
              )}
              
              {record.patientType === PatientType.SOAP ? (
                <>
                  {currentStep === FormStep.QD_HMA && (
                    <SoapSection 
                      part="S" 
                      data={record.soap!} 
                      idData={record.id}
                      onChange={(soap) => updateRecord({ soap })} 
                      onIdChange={(id) => updateRecord({ id })}
                      patientType={record.patientType} 
                    />
                  )}
                  {currentStep === FormStep.PHYSICAL_EXAM && (
                    <div className="space-y-10">
                      <PhysicalExamSection patientType={record.patientType} subType={record.pediatricSubType} age={record.id.idade} sex={record.id.sexo} data={record.exameFisico} onChange={(exameFisico) => updateRecord({ exameFisico })} />
                      <div className="pt-8 border-t border-[#f0f2f4] dark:border-[#2d3748]">
                        <SoapSection 
                          part="O" 
                          data={record.soap!} 
                          idData={record.id}
                          onChange={(soap) => updateRecord({ soap })} 
                          onIdChange={(id) => updateRecord({ id })}
                          patientType={record.patientType} 
                        />
                      </div>
                    </div>
                  )}
                  {currentStep === FormStep.SOAP_ASSESSMENT && (
                    <SoapSection 
                      part="AP" 
                      data={record.soap!} 
                      idData={record.id}
                      onChange={(soap) => updateRecord({ soap })} 
                      onIdChange={(id) => updateRecord({ id })}
                      patientType={record.patientType} 
                    />
                  )}
                </>
              ) : (
                <>
                  {currentStep === FormStep.QD_HMA && (
                    <HistorySection patientType={record.patientType} subType={record.pediatricSubType} qd={record.qd} hma={record.hma} onChange={(updates) => updateRecord(updates)} />
                  )}
                  {currentStep === FormStep.ISDA && (
                    <ISDASection patientType={record.patientType} data={record.isda} onChange={(isda) => updateRecord({ isda })} />
                  )}
                  {currentStep === FormStep.ANTECEDENTS && (
                    <AntecedentsSection 
                      patientType={record.patientType} 
                      subType={record.pediatricSubType} 
                      data={record.antecedentes} 
                      age={record.id.idade}
                      sex={record.id.sexo}
                      onChange={(antecedentes) => updateRecord({ antecedentes })} 
                    />
                  )}
                  {currentStep === FormStep.PHYSICAL_EXAM && (
                    <PhysicalExamSection patientType={record.patientType} subType={record.pediatricSubType} age={record.id.idade} sex={record.id.sexo} data={record.exameFisico} onChange={(exameFisico) => updateRecord({ exameFisico })} />
                  )}
                  {currentStep === FormStep.SYNTHESIS && (
                    <SynthesisSection 
                      fatoresRisco={record.fatoresRisco} 
                      conduta={record.conduta} 
                      patientType={record.patientType} 
                      onChange={(updates) => updateRecord(updates)} 
                    />
                  )}
                </>
              )}

              {currentStep === FormStep.SUMMARY && (
                <SummarySection record={record} onEdit={(step) => setCurrentStep(step)} onUpdateRecord={updateRecord} />
              )}
            </div>

            <div className="no-print pb-8">
              <Navigation currentStep={currentStep} onNext={nextStep} onPrev={prevStep} patientType={record.patientType} />
            </div>
          </div>
          <Footer />
        </main>
      </div>

      <button 
        onClick={() => setIsGlossaryOpen(true)}
        className="md:hidden fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-[60] active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-[28px]">menu_book</span>
      </button>

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
};

export default App;

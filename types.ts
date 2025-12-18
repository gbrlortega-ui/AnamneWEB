
export enum PatientType {
  ADULT = 'ADULT',
  PEDIATRIC = 'PEDIATRIC',
  GERIATRIC = 'GERIATRIC',
  SOAP = 'SOAP'
}

export enum PediatricSubType {
  NEONATE = 'NEONATO',
  INFANT = 'LACTANTE',
  PRE_SCHOOL = 'PRÉ-ESCOLAR',
  SCHOOL = 'ESCOLAR',
  ADOLESCENT = 'ADOLESCENTE'
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME';

export interface PatientIdentification {
  nome: string;
  idade: string;
  sexo: string;
  cor: string;
  estadoCivil: string;
  profissao: string;
  naturalidade: string;
  residencia: string;
  responsavel?: string;
  escolaridade?: string;
  cuidador?: string;
}

export interface ISDA {
  geral: string;
  cabecaPescoco: string;
  torax: string;
  abdome: string;
  genitourinario: string;
  musculoEsqueletico: string;
  nervoso: string;
  crescimento?: string;
  cognitivo?: string;
}

export interface Antecedents {
  fisiologicos: string; 
  patologicos: string;
  familiares: string;
  habitos: string;
  psicossocial: string;
  riscoCardiovascular?: string; 
  riscoCardiovascularLevel?: RiskLevel;
  ivcf20Score?: number;
  ivcf20Result?: string;
  ivcf20Level?: 'LOW' | 'MODERATE' | 'HIGH';
  gestacional?: string;
  neonatal?: string;
  dnpm?: string;
  vacinacao?: string;
  funcionalidade?: string;
  polifarmacia?: string;
}

export interface PhysicalExam {
  geral: string;
  sinaisVitais: {
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    sat: string;
    peso?: string;
    estatura?: string;
    pc?: string;
    imc?: string;
  };
  peleAnexos: string;
  cabecaPescoco: string;
  aparelhoRespiratorio: string;
  aparelhoCardiovascular: string;
  abdome: string;
  aparelhoGenitourinario: string;
  aparelhoMusculoEsqueletico: string;
  extremidades: string;
  neurologico: string;
  fontanelas?: string;
}

export type SoapPlanCategory = 'DIAGNOSTIC' | 'THERAPEUTIC' | 'FOLLOW_UP' | 'EDUCATION' | 'ADMINISTRATIVE';

export interface SoapAssessmentItem {
  id: string;
  text: string;
}

export interface SoapPlanItem {
  id: string;
  text: string;
  category: SoapPlanCategory;
  linkedAssessments: string[];
}

export interface SoapSubjective {
  identificacao: string;
  qpHma: string;
  isda: string;
  antFisiologicos: string;
  antPatologicos: string;
  riscoCardiovascular?: string;
  riscoCardiovascularLevel?: RiskLevel;
  ivcf20Score?: number;
  ivcf20Result?: string;
  // Added ivcf20Level to match ClinicalRecord needs and IVCF20Modal output
  ivcf20Level?: 'LOW' | 'MODERATE' | 'HIGH';
  medicacoes: string;
  antFamiliares: string;
  habitos: string;
  socioeconomico: string;
  vacinacao: string;
}

export interface SoapData {
  s: SoapSubjective;
  o: string; 
  assessments: SoapAssessmentItem[];
  plans: SoapPlanItem[];
}

export interface ClinicalRecord {
  patientType: PatientType;
  pediatricSubType?: PediatricSubType;
  id: PatientIdentification;
  qd: string;
  hma: string;
  isda: ISDA;
  antecedentes: Antecedents;
  exameFisico: PhysicalExam;
  soap?: SoapData; 
  hipoteseDiagnostica: string;
  fatoresRisco: string;
  conduta: string;
}

export enum FormStep {
  TYPE_SELECTION = -1,
  PEDIATRIC_SUB_SELECTION = -0.5,
  IDENTIFICATION = 0,
  QD_HMA = 1,
  ISDA = 2,
  ANTECEDENTS = 3,
  PHYSICAL_EXAM = 4,
  SYNTHESIS = 4.8,
  SOAP_ASSESSMENT = 4.5,
  SUMMARY = 5
}

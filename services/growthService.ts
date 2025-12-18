
/**
 * Serviço de Antropometria e Interpretação Clínica
 */

export function parseAgeToMonths(ageStr: string): number {
  const clean = ageStr.toLowerCase();
  const num = parseInt(clean.replace(/\D/g, '')) || 0;
  if (clean.includes('ano')) return num * 12;
  if (clean.includes('mês') || clean.includes('mes')) return num;
  if (clean.includes('dia')) return Math.floor(num / 30);
  return num;
}

export function classifyAdultBMI(bmi: number, ageYears: number): { label: string, color: string } {
  if (bmi <= 0) return { label: '', color: 'text-slate-400' };
  const isElderly = ageYears >= 60;

  if (isElderly) {
    if (bmi < 22) return { label: 'Baixo Peso', color: 'text-red-500' };
    if (bmi <= 27) return { label: 'Eutrofia', color: 'text-green-600' };
    return { label: 'Sobrepeso', color: 'text-orange-500' };
  } else {
    if (bmi < 18.5) return { label: 'Baixo Peso', color: 'text-red-500' };
    if (bmi < 25) return { label: 'Eutrofia', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
    if (bmi < 35) return { label: 'Obesidade I', color: 'text-orange-500' };
    if (bmi < 40) return { label: 'Obesidade II', color: 'text-red-500' };
    return { label: 'Obesidade III', color: 'text-red-700' };
  }
}

export function getVitalSignsInterpretation(vitals: any, ageMonths: number, patientType: string) {
  const fc = parseInt(vitals.fc || '0');
  const fr = parseInt(vitals.fr || '0');
  const sat = parseInt(vitals.sat || '0');
  const temp = parseFloat(vitals.temp || '0');
  const pa = vitals.pa || '';
  
  const results = {
    fc: { label: '', color: 'text-slate-400' },
    fr: { label: '', color: 'text-slate-400' },
    pa: { label: '', color: 'text-slate-400' },
    sat: { label: '', color: 'text-slate-400' },
    temp: { label: '', color: 'text-slate-400' }
  };

  let limits = { fc: [60, 100], fr: [12, 20], pas: [90, 130] };

  if (patientType === 'PEDIATRIC') {
    if (ageMonths <= 1) limits = { fc: [120, 160], fr: [40, 60], pas: [60, 90] };
    else if (ageMonths <= 12) limits = { fc: [100, 140], fr: [30, 45], pas: [70, 100] };
    else if (ageMonths <= 72) limits = { fc: [75, 115], fr: [20, 30], pas: [85, 120] };
    else limits = { fc: [60, 100], fr: [12, 20], pas: [110, 130] };
  } else if (patientType === 'GERIATRIC') {
    limits = { fc: [60, 100], fr: [14, 22], pas: [90, 140] };
  }

  if (fc > 0) {
    if (fc < limits.fc[0]) results.fc = { label: 'Bradicardia', color: 'text-red-500' };
    else if (fc > limits.fc[1]) results.fc = { label: 'Taquicardia', color: 'text-red-500' };
    else results.fc = { label: 'Normocardia', color: 'text-green-600' };
  }

  if (fr > 0) {
    if (fr < limits.fr[0]) results.fr = { label: 'Bradipneia', color: 'text-red-500' };
    else if (fr > limits.fr[1]) results.fr = { label: 'Taquipneia', color: 'text-red-500' };
    else results.fr = { label: 'Eupneia', color: 'text-green-600' };
  }

  if (sat > 0) {
    if (sat < 92) results.sat = { label: 'Hipoxemia Grave', color: 'text-red-600' };
    else if (sat < 95) results.sat = { label: 'Hipoxemia', color: 'text-orange-500' };
    else results.sat = { label: 'Normal', color: 'text-green-600' };
  }

  if (temp > 0) {
    if (temp < 35.0) results.temp = { label: 'Hipotermia', color: 'text-blue-600' };
    else if (temp <= 37.2) results.temp = { label: 'Afebril', color: 'text-green-600' };
    else if (temp <= 37.7) results.temp = { label: 'Subfebril', color: 'text-orange-500' };
    else results.temp = { label: 'Febril', color: 'text-red-600' };
  }

  if (pa.includes('/')) {
    const pas = parseInt(pa.split('/')[0]);
    if (pas > 0) {
      if (pas < limits.pas[0]) results.pa = { label: 'Hipotenso', color: 'text-blue-500' };
      else if (pas > limits.pas[1]) results.pa = { label: 'Hipertenso', color: 'text-red-600' };
      else results.pa = { label: 'Normotenso', color: 'text-green-600' };
    }
  }

  return results;
}

export function calculateZScore(value: number, ageMonths: number, type: 'weight' | 'height' | 'bmi' | 'pc', sex: string): string | null {
  if (!value || value <= 0) return null;
  // Simplificação: apenas referências masculinas para o MVP
  const ref = [
    { months: 0, weight: { m: 3.3, sd: 0.5 }, height: { m: 49.9, sd: 2.0 }, bmi: { m: 13.4, sd: 1.2 }, pc: { m: 34.5, sd: 1.2 } },
    { months: 60, weight: { m: 18.3, sd: 2.2 }, height: { m: 110.0, sd: 4.5 }, bmi: { m: 15.3, sd: 1.3 }, pc: { m: 50.7, sd: 1.3 } },
  ]; 
  let lower = ref[0];
  let upper = ref[ref.length - 1];
  const t = (ageMonths / 60);
  const m = lower[type].m + t * (upper[type].m - lower[type].m);
  const sd = lower[type].sd + t * (upper[type].sd - lower[type].sd);
  const z = (value - m) / sd;
  return z.toFixed(2);
}

export function getZScoreColor(zScore: string | null): string {
  if (!zScore) return 'text-slate-400';
  const val = parseFloat(zScore);
  if (Math.abs(val) <= 2) return 'text-green-600';
  return 'text-red-600';
}

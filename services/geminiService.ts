// IA desativada (site sem Gemini). Mantém as funções para não quebrar imports.

export async function refineMedicalText(
  text: string,
  _sectionName: string,
  _patientType: string
): Promise<string> {
  return text;
}

export async function getClinicalSuggestions(
  _qd: string,
  _hma: string,
  _patientType: string
): Promise<string[]> {
  return [];
}

// IA desativada no deploy (site estático). Mantém as funções para não quebrar o app.

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

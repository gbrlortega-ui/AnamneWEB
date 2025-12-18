
import React from 'react';
import { PatientIdentification, PatientType } from '../types';

interface Props {
  data: PatientIdentification;
  patientType: PatientType;
  onChange: (data: PatientIdentification) => void;
}

const IdentificationSection: React.FC<Props> = ({ data, patientType, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all";
  const labelClass = "block text-sm font-bold text-[#111418] dark:text-white mb-1.5";

  return (
    <section className="space-y-6">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4">
        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">Identificação (ID)</h2>
        <p className="text-sm text-[#617289] dark:text-gray-400">Dados demográficos fundamentais do paciente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={labelClass}>Nome Completo</label>
          <input name="nome" value={data.nome} onChange={handleChange} className={inputClass} placeholder="Digite o nome completo" />
        </div>

        <div>
          <label className={labelClass}>Idade</label>
          <input name="idade" value={data.idade} onChange={handleChange} placeholder={patientType === PatientType.PEDIATRIC ? "Ex: 4 meses" : "Ex: 45 anos"} className={inputClass} />
        </div>

        {patientType === PatientType.PEDIATRIC && (
          <div>
            <label className={labelClass}>Nome do Responsável</label>
            <input name="responsavel" value={data.responsavel} onChange={handleChange} className={inputClass} placeholder="Nome do pai/mãe/tutor" />
          </div>
        )}

        {patientType === PatientType.GERIATRIC && (
          <>
            <div>
              <label className={labelClass}>Escolaridade</label>
              <input name="escolaridade" value={data.escolaridade} onChange={handleChange} className={inputClass} placeholder="Analfabeto, Médio, Superior..." />
            </div>
            <div>
              <label className={labelClass}>Cuidador Principal</label>
              <input name="cuidador" value={data.cuidador} onChange={handleChange} className={inputClass} placeholder="Nome do cuidador" />
            </div>
          </>
        )}

        <div>
          <label className={labelClass}>Sexo</label>
          <select name="sexo" value={data.sexo} onChange={handleChange} className={inputClass}>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Profissão / Ocupação</label>
          <input name="profissao" value={data.profissao} onChange={handleChange} className={inputClass} placeholder="Ex: Aposentado" />
        </div>

        <div>
          <label className={labelClass}>Naturalidade</label>
          <input name="naturalidade" value={data.naturalidade} onChange={handleChange} className={inputClass} placeholder="Cidade de nascimento" />
        </div>

        <div>
          <label className={labelClass}>Residência</label>
          <input name="residencia" value={data.residencia} onChange={handleChange} className={inputClass} placeholder="Cidade/Bairro atual" />
        </div>
      </div>
    </section>
  );
};

export default IdentificationSection;

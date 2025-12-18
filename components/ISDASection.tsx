
import React from 'react';
import { ISDA, PatientType } from '../types';

interface Props {
  data: ISDA;
  patientType: PatientType;
  onChange: (data: ISDA) => void;
}

const ISDASection: React.FC<Props> = ({ data, patientType, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const getFields = () => {
    const base = [
      { name: 'geral', label: 'Geral / Sintomas Constitucionais', placeholder: 'Febre (início, aferição), calafrios, sudorese, fadiga, alteração de apetite, perda ponderal não intencional...' },
      { name: 'cabecaPescoco', label: 'Cabeça e Pescoço', placeholder: 'Cefaleia (característica), tontura, alterações visuais (diplopia, borramento), otalgia, zumbido, obstrução nasal, faringodinia, massas cervicais...' },
      { name: 'torax', label: 'Tórax (Cardiorrespiratório)', placeholder: 'Dispneia (esforço/repouso), dor torácica, tosse, palpitações, edema de MMII, ortopneia...' },
      { name: 'abdome', label: 'Abdome (Gastrintestinal)', placeholder: 'Náuseas, vômitos, dor abdominal, hábito intestinal, pirose, disfagia, melena/enterorragia...' },
      { name: 'genitourinario', label: 'Genitourinário', placeholder: 'Disúria, polaciúria, hematúria, jato urinário, corrimentos, função sexual...' },
      { name: 'musculoEsqueletico', label: 'Músculo-Esquelético', placeholder: 'Artralgias (localização, rigidez matinal), mialgias, limitações funcionais, dor em coluna...' },
      { name: 'nervoso', label: 'Nervoso e Psíquico', placeholder: 'Parestesias, força muscular, síncope, crises convulsivas, sono, humor, ansiedade...' },
    ];

    if (patientType === PatientType.PEDIATRIC) {
      return [...base, { name: 'crescimento', label: 'Crescimento e Desenvolvimento', placeholder: 'Percepção dos pais sobre ganho de peso e altura, aquisição de novas habilidades, rendimento escolar...' }];
    }

    if (patientType === PatientType.GERIATRIC) {
      return [...base, { name: 'cognitivo', label: 'Cognitivo / Comportamental', placeholder: 'Lapsos de memória, desorientação temporal/espacial, alucinações, agressividade, apatia...' }];
    }

    return base;
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#2d3748] border border-[#e5e7eb] dark:border-[#4a5568] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600";
  const labelClass = "block text-sm font-bold text-[#111418] dark:text-white mb-2";

  return (
    <section className="space-y-6">
      <div className="border-b border-[#f0f2f4] dark:border-[#2d3748] pb-4">
        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tight">ISDA</h2>
        <p className="text-sm text-[#617289] dark:text-gray-400">Interrogatório Sistemático por Órgãos e Aparelhos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {getFields().map((f) => (
          <div key={f.name}>
            <label className={labelClass}>{f.label}</label>
            <textarea
              name={f.name}
              value={(data as any)[f.name] || ''}
              onChange={handleChange}
              placeholder={f.placeholder}
              className={`${inputClass} h-24 resize-none`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ISDASection;

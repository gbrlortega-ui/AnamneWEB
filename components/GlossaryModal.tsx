
import React, { useState, useMemo } from 'react';

const GLOSSARY_DATA: Record<string, string> = {
  "Abscesso": "Acúmulo de pus, geralmente causado por infecção bacteriana. Os sintomas incluem dor, inchaço, vermelhidão e possível febre.",
  "Abulia": "Apatia; falta de motivação que pode levar o paciente à total falta de movimento (diferente da catatonia).",
  "Acalasia": "Distúrbio nervoso que interfere no peristaltismo esofágico e no relaxamento do esfíncter esofágico inferior.",
  "Acrocianose": "Distúrbio circulatório em que mãos e pés estão persistentemente frios e azuis.",
  "Acromegalia": "Aumento gradual de tecidos e ossos da face e extremidades por secreção excessiva de GH, geralmente por tumor hipofisário.",
  "Adenite": "Inflamação aguda de gânglios linfáticos.",
  "Adenomegalia": "Hipertrofia de um gânglio linfático (linfonodo).",
  "Aerofagia": "Ato de deglutir ar, podendo levar à distensão abdominal e transtornos gastrintestinais.",
  "Afasia": "Perda da habilidade de linguagem (compreensão ou expressão) devido a lesão cerebral (áreas de Wernicke ou Broca).",
  "Afagia": "Impossibilidade de deglutir.",
  "Aferese": "Remoção do sangue do paciente para retirada de elementos específicos e posterior reinfusão.",
  "Agalactia": "Ausência de leite nas mamas depois do parto; agalactose.",
  "Ageusia": "Perda ou redução do sentido do paladar.",
  "Aglossia": "Ausência congênita da língua.",
  "Agnosia": "Incapacidade de reconhecer ou associar objetos às suas funções, apesar de sentidos preservados.",
  "Agorafobia": "Medo de espaços abertos ou de estar só em público.",
  "Agrafia": "Distúrbio da capacidade de escrever.",
  "Alopécia": "Queda parcial ou total de cabelos ou pelos.",
  "Amaurose": "Perda total da visão por lesão no sistema nervoso.",
  "Amenorréia": "Ausência de menstruação por mais de 3 meses.",
  "Anafrodisia": "Falta de desejo sexual; frigidez.",
  "Anacusia": "Total perda da capacidade auditiva.",
  "Anasarca": "Edema generalizado (espaço intersticial e cavidades).",
  "Anastomose": "União entre estruturas tubulares.",
  "Angina": "Dor opressiva torácica por hipóxia do miocárdio.",
  "Aneurisma": "Dilatação anormal da luz de um vaso sanguíneo.",
  "Anisocoria": "Desigualdade no diâmetro das pupilas.",
  "Anorexia": "Falta de apetite ou inapetência.",
  "Anosmia": "Diminuição ou perda completa do olfato.",
  "Anquiloglossia": "Freio lingual curto; 'língua presa'.",
  "Anquilose": "Perda da mobilidade de uma articulação.",
  "Anúria": "Supressão ou acentuada diminuição da diurese (menor que 50ml/24h).",
  "Apnéia": "Ausência momentânea de ciclos respiratórios.",
  "Apnéia de sono": "Fechamento repetitivo das vias aéreas superiores durante o sono.",
  "Apraxia": "Dificuldade em realizar tarefas motoras previamente aprendidas e compreendidas.",
  "Artralgia": "Dor nas articulações.",
  "Artrite": "Inflamação das articulações.",
  "Artrose": "Processo degenerativo com destruição da cartilagem articular.",
  "Ascite": "Presença de líquido na cavidade peritoneal; 'barriga de água'.",
  "Astenia": "Fraqueza, cansaço físico intenso, perda de força muscular.",
  "Ataxia": "Falta de coordenação de movimentos voluntários ou de equilíbrio.",
  "Atetose": "Movimentos involuntários lentos e sinuosos, principalmente de mãos e dedos.",
  "Baqueteamento": "Engrossamento da última falange dos dedos (hipocratismo digital), comum em hipóxia crônica.",
  "Bócio": "Aumento não neoplásico da glândula tireoide.",
  "Bolha": "Coleção líquida elevada com diâmetro maior que 1 cm.",
  "Bradicardia": "Frequência cardíaca abaixo do normal (< 60 bpm no adulto).",
  "Bradicinesia": "Lentidão anormal dos movimentos.",
  "Bradipnéia": "Lentidão anormal da frequência respiratória.",
  "Bulimia": "Ingestão compulsiva de alimentos seguida de métodos compensatórios (ex: vômitos).",
  "Calázio": "Nódulo palpebral por obstrução de glândulas de Meibomius.",
  "Cacifo": "Depressão na pele edemaciada que persiste após pressão digital (Sinal de Godet).",
  "Cacofagia": "Perversão do apetite (ingestão de substâncias repugnantes).",
  "Cacosmia": "Atração por cheiros desagradáveis.",
  "Calvície": "Alopecia androgênica.",
  "Canície": "Descoloração (embranquecimento) fisiológica ou adquirida dos cabelos.",
  "Caquexia": "Emagrecimento extremo com comprometimento do estado geral.",
  "Catatonia": "Estado de imobilidade, mutismo e não responsividade; rigidez plástica.",
  "Cefaléia": "Dor de cabeça.",
  "Ceratite": "Inflamação da córnea.",
  "Ceratocone": "Deformidade da córnea em formato de cone.",
  "Cervicalgia": "Dor na região cervical (posterior do pescoço).",
  "Cervicite": "Inflamação do colo do útero.",
  "Choque": "Falência circulatória com hipóxia tecidual generalizada.",
  "Cianose": "Coloração azulada da pele/mucosas por aumento de hemoglobina reduzida.",
  "Claudicação": "Mancar ou dor ao caminhar por déficit circulatório ou musculoesquelético.",
  "Clônus": "Movimento ritmado de contração e relaxamento muscular por estiramento súbito.",
  "Colêmese": "Vômito com presença de bile.",
  "Colestase": "Redução ou interrupção do fluxo biliar.",
  "Colite": "Inflamação do cólon.",
  "Constipação": "Prisão de ventre; fezes endurecidas ou frequência reduzida.",
  "Coriza": "Corrimento de secreção nasal.",
  "Dacriocistite": "Inflamação do saco lacrimal.",
  "Delírio": "Alteração aguda da consciência, lucidez ou juízo de realidade.",
  "Derrame": "Presença de líquido em cavidade serosa (pleural, peritoneal, etc).",
  "Derrame Pleural": "Acúmulo de líquido no espaço pleural.",
  "Diarréia": "Aumento do número e redução da consistência das evacuações.",
  "Diérese": "Divisão ou separação de tecidos (acidental ou cirúrgica).",
  "Diplopia": "Visão dupla.",
  "Disacusia": "Estado mórbido com distúrbio da audição ou dor a sons.",
  "Disartria": "Dificuldade na articulação da fala por controle neuromuscular alterado.",
  "Disdiadococinesia": "Incapacidade de realizar movimentos alternados rápidos.",
  "Disenteria": "Diarreia com muco, pus ou sangue e presença de tenesmo.",
  "Disfagia": "Dificuldade para deglutir.",
  "Disfasia": "Dificuldade na compreensão ou expressão da linguagem.",
  "Disfonia": "Alteração no timbre ou volume da voz.",
  "Dislexia": "Dificuldade de leitura e processamento de símbolos gráficos.",
  "Dismenorréia": "Menstruação dolorosa (cólica uterina).",
  "Dispareunia": "Coito difícil ou doloroso.",
  "Dispepsia": "Dificuldade de digestão ou desconforto gástrico.",
  "Dispnéia": "Dificuldade para respirar; falta de ar.",
  "Dispnéia paroxística": "Falta de ar que surge em crises, comumente noturna ao deitar.",
  "Distonia": "Postura ou movimento anormal mantido por alteração do tônus.",
  "Disúria": "Micção difícil ou dolorosa.",
  "Eclâmpsia": "Crises convulsivas graves durante a gestação (associada a hipertensão).",
  "Edema": "Acúmulo de líquido no espaço intersticial.",
  "Embolia": "Obstrução vascular por corpo estranho (êmbolo).",
  "Êmese": "Vômito.",
  "Encoprese": "Emissão involuntária de fezes após idade de controle.",
  "Enfisema": "Destruição das paredes alveolares com aprisionamento de ar.",
  "Enoftalmia": "Retração do globo ocular para dentro da órbita.",
  "Enterorragia": "Sangramento vermelho vivo pelo ânus (origem digestiva baixa).",
  "Enurese": "Emissão involuntária de urina (comumente noturna).",
  "Episiotomia": "Incisão no períneo para ampliar canal de parto.",
  "Epistaxe": "Hemorragia nasal.",
  "Equimose": "Mancha por extravasamento de sangue no tecido subcutâneo (> 1cm).",
  "Erisipela": "Infecção estreptocócica da pele com bordas bem delimitadas.",
  "Eritema": "Mancha avermelhada na pele por vasodilatação (some à pressão).",
  "Eritrodermia": "Eritema generalizado e crônico com descamação.",
  "Eructação": "Eliminação de gases pela boca; 'arroto'.",
  "Escotoma": "Visão de pontos negros ou luminosos (mancha no campo visual).",
  "Esteatorréia": "Excesso de gordura nas fezes.",
  "Estridor": "Ruído áspero por obstrução de vias aéreas superiores.",
  "Exantema": "Erupção cutânea eritematosa aguda e generalizada.",
  "Exoftalmia": "Projeção do globo ocular para fora.",
  "Fácie de 'Lua Cheia'": "Rosto arredondado por excesso de cortisol (Síndrome de Cushing).",
  "Fâneros": "Anexos cutâneos: pelos, cabelos e unhas.",
  "Fasciculação": "Contrações musculares involuntárias em repouso de fascículos isolados.",
  "Fenômeno de Raynaud": "Alterações de cor nos dedos (palidez, cianose, rubor) por frio ou estresse.",
  "Fimose": "Impossibilidade de retrair o prepúcio sobre a glande.",
  "Flatulência": "Acúmulo de gases intestinais com distensão.",
  "Flebite": "Inflamação de uma veia.",
  "Flegmasia Alba dolens": "Oclusão venosa profunda com edema pálido (leitoso).",
  "Flegmasia Coerulea dolens": "Oclusão venosa grave com cianose intensa do membro.",
  "Fonofobia": "Intolerância a ruídos ou sons.",
  "Fotofobia": "Intolerância à luz.",
  "Frêmito": "Vibração percebida à palpação do tórax (ex: frêmito toracovocal).",
  "Frigidez": "Anafrodisia; insensibilidade sexual.",
  "Galactorréia": "Secreção mamária leitosa fora do período de lactação.",
  "Gangrena": "Morte tecidual por isquemia e ação de agentes externos.",
  "Gastrite": "Inflamação da mucosa gástrica.",
  "Ginecomastia": "Aumento da glândula mamária no homem.",
  "Glaucoma": "Aumento da pressão intraocular.",
  "Glicosúria": "Presença de glicose na urina.",
  "Goma": "Nódulo que se liquefaz no centro e pode ulcerar.",
  "Halitose": "Odor desagradável da boca.",
  "Halo senil": "Arco acinzentado na periferia da córnea (idosos ou dislipidemia).",
  "Hematêmese": "Vômito com sangue (origem digestiva alta).",
  "Hematoma": "Coleção de sangue circunscrita e proeminente.",
  "Hematoquezia": "Sangue nas fezes (origem em cólon ascendente/transverso).",
  "Hematúria": "Presença de sangue na urina.",
  "Hemoptise": "Expectoração de sangue (origem pulmonar/subglótica).",
  "Hemorragia": "Extravasamento de sangue dos vasos.",
  "Hipertricose": "Excesso de pelos independente de hormônios andrógenos.",
  "Hipoacusia": "Diminuição da acuidade auditiva.",
  "Hipostadia": "Abertura do meato uretral em local anômalo na face ventral do pênis.",
  "Hipotricose": "Queda ou escassez de pelos.",
  "Hirsutismo": "Pelos masculinos em mulheres (dependente de andrógenos).",
  "Histerectomia": "Cirurgia para retirada do útero.",
  "Hordéolo": "Inflamação aguda da borda palpebral; 'terçol'.",
  "Icterícia": "Coloração amarelada de pele/mucosas por excesso de bilirrubina.",
  "Ictiose": "Pele seca com aspecto de escamas de peixe.",
  "Ileite": "Inflamação do íleo.",
  "Impersistência": "Incapacidade de manter uma postura sustentada (motor).",
  "Incontinência": "Perda do controle voluntário de esfíncteres.",
  "Iridociclite": "Inflamação da íris e do corpo ciliar.",
  "Irite": "Inflamação da íris.",
  "Kernicterus": "Encefalopatia por impregnação de bilirrubina nos núcleos da base.",
  "Lagoftalmo": "Fechamento incompleto das pálpebras.",
  "Leucocitúria": "Presença de leucócitos na urina; piúria.",
  "Leucoma": "Opacificação branca da córnea.",
  "Leucotricose": "Embranquecimento dos cabelos.",
  "Leucotríquia anular": "Cabelos com áreas claras e escuras alternadas.",
  "Linfadenomegalia": "Hipertrofia de linfonodos.",
  "Lipotímia": "Desfalecimento ou tontura sem perda completa da consciência.",
  "Lombalgia": "Dor na região lombar.",
  "Mácula": "Mancha plana com alteração de cor, sem relevo.",
  "Madarose": "Queda dos pelos da sobrancelha (comumente no terço externo).",
  "Marasmo": "Desnutrição calórica grave com emagrecimento acentuado.",
  "Mecôneo": "Primeiras fezes do recém-nascido (verdes e viscosas).",
  "Melena": "Fezes negras, pastosas e fétidas (sangue digerido).",
  "Melenêmese": "Vômito com aspecto de 'borra de café'.",
  "Menarca": "Primeira menstruação da vida.",
  "Menopausa": "Cessação permanente da menstruação.",
  "Meteorismo": "Distensão abdominal por acúmulo de gases.",
  "Método não invasivo": "Procedimento que não exige penetração na pele ou contato sanguíneo.",
  "Metrorragia": "Hemorragia uterina fora do período menstrual.",
  "Midríase": "Dilatação pupilar (> 5mm).",
  "Mioclonia": "Contração muscular súbita e involuntária.",
  "Miose": "Constrição pupilar (< 2mm).",
  "Narcose": "Estado de estupor ou inconsciência por narcóticos.",
  "Nevo": "Mancha ou sinal congênito na pele; tumor benigno pigmentar.",
  "Nictúria": "Aumento do volume urinário durante a noite.",
  "Nistagmo": "Movimentos oculares rítmicos e involuntários.",
  "Nódulo": "Lesão sólida e elevada (> 1cm).",
  "Nucalgia": "Dor na região da nuca.",
  "Nulípara": "Mulher que nunca deu à luz.",
  "Obstipação": "Prisão de ventre severa (mais de 3 dias sem evacuar).",
  "Odinofagia": "Dor ao deglutir (dor de garganta).",
  "Oligúria": "Volume urinário diário reduzido (adulto < 400ml/dia ou < 0,5ml/kg/h).",
  "Ortopnéia": "Dificuldade para respirar deitado (alivia ao sentar).",
  "Osteomalácia": "Amolecimento dos ossos por deficiência de vitamina D no adulto.",
  "Otalgia": "Dor de ouvido.",
  "Otorragia": "Sangramento pelo conduto auditivo.",
  "Otorréia": "Saída de secreção (não sanguínea) pelo ouvido.",
  "Palpitação": "Percepção incômoda dos batimentos cardíacos.",
  "Pápula": "Lesão sólida e elevada de pele (< 1cm).",
  "Paralisia de Bell": "Paralisia facial periférica súbita e idiopática.",
  "Paraplegia": "Paralisia de ambos os membros inferiores.",
  "Paresia": "Diminuição parcial da força muscular.",
  "Parestesia": "Sensações anormais espontâneas (formigamento, dormência).",
  "Paroníquia": "Inflamação da borda da unha; 'unheiro'.",
  "Pectorilóquia": "Transmissão nítida da voz na ausculta pulmonar (fônica ou áfona).",
  "Pênfigo": "Doença autoimune com formação de bolhas na pele e mucosas.",
  "Pirose": "Azia; sensação de queimação retroesternal.",
  "Piúria": "Presença de pus na urina.",
  "Plegia": "Paralisia completa (ausência total de força).",
  "Pletória": "Congestão ou excesso de sangue na pele (aspecto avermelhado).",
  "Polaciúria": "Aumento da frequência urinária com baixo volume por vez.",
  "Polidipsia": "Sede excessiva.",
  "Polifagia": "Fome excessiva.",
  "Poliúria": "Aumento excessivo do volume urinário diário.",
  "Priapismo": "Ereção prolongada e dolorosa sem estímulo sexual.",
  "Proctite": "Inflamação da mucosa do reto.",
  "Pródromo": "Sintoma ou sinal que precede o início clínico de uma doença.",
  "Proptose": "Deslocamento de um órgão ou globo ocular para frente.",
  "Pterígio": "Crescimento de tecido fibrovascular sobre a conjuntiva e córnea.",
  "Ptose palpebral": "Queda da pálpebra superior.",
  "Pústula": "Pequena elevação da pele com conteúdo purulento.",
  "Puxo": "Contração espasmódica retal que precede a evacuação.",
  "Regurgitação": "Retorno do alimento do esôfago/estômago à boca sem esforço de vômito.",
  "Ressecção": "Retirada cirúrgica de parte de um órgão.",
  "Rinite": "Inflamação da mucosa nasal.",
  "Rinorreia": "Corrimento nasal.",
  "Salicismo": "Intoxicação por ácido salicílico.",
  "Sepse": "Resposta inflamatória sistêmica grave a uma infecção.",
  "Sialorréia": "Excesso de secreção de saliva.",
  "Sialosquise": "Diminuição da secreção salivar.",
  "Sinal": "Manifestação objetiva da doença percebida pelo médico.",
  "Síncope": "Perda súbita e transitória da consciência e tônus postural.",
  "Síndrome": "Conjunto de sinais e sintomas com causas diversas e padrão comum.",
  "Taquicardia": "Aceleração dos batimentos cardíacos (> 100 bpm no adulto).",
  "Taquipnéia": "Aumento da frequência respiratória.",
  "Tenesmo": "Desejo urgente de evacuar que persiste após o ato.",
  "Tinitus": "Zumbido no ouvido.",
  "Tique": "Movimento espasmódico repetitivo e involuntário.",
  "Trepanação": "Remoção de um disco ósseo (comumente no crânio).",
  "Tumor": "Lesão sólida e elevada (> 3cm).",
  "Unhas de Lindsay": "Unhas com metade proximal branca e distal vermelha (IRC).",
  "Unhas hipocráticas": "Unhas em 'vidro de relógio' associadas a baqueteamento.",
  "Urtica": "Placa eritemato-edematosa efêmera com prurido.",
  "Vegetações": "Projeções sólidas digitiformes na pele ou mucosas.",
  "Verruga": "Vegetação de superfície queratótica (comumente viral).",
  "Vertigem": "Sensação de rotação (alucinação de movimento).",
  "Vesícula": "Coleção líquida elevada de até 1 cm.",
  "Vômica": "Eliminação súbita de grande quantidade de secreção pulmonar.",
  "Xantomatose": "Depósitos lipídicos (xantomas) na pele ou tendões.",
  "Xeroftalmia": "Secura excessiva dos olhos.",
  "Xerostomia": "Boca seca por falta de saliva."
};

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGlossary = useMemo(() => {
    return Object.entries(GLOSSARY_DATA)
      .filter(([term]) => term.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a202c] w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#f0f2f4] dark:border-[#2d3748] flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111418] dark:text-white">Glossário Médico</h3>
              <p className="text-[10px] text-[#617289] dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Termos Semiológicos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-4 bg-white dark:bg-[#1a202c]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">search</span>
            <input 
              type="text" 
              placeholder="Pesquisar termo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background-light dark:bg-[#2d3748] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all shadow-inner"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {filteredGlossary.length > 0 ? (
              filteredGlossary.map(([term, definition]) => (
                <div key={term} className="group p-4 rounded-2xl border border-[#f0f2f4] dark:border-[#2d3748] hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <h4 className="font-bold text-primary mb-1 flex items-center gap-2">
                    {term}
                  </h4>
                  <p className="text-sm text-[#617289] dark:text-gray-300 leading-relaxed">
                    {definition}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-[#9ca3af] mb-3">search_off</span>
                <p className="text-slate-500 font-medium">Nenhum termo encontrado</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[#f0f2f4] dark:border-[#2d3748] bg-slate-50 dark:bg-black/20 text-center sm:block hidden">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlossaryModal;

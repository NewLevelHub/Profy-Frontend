// Направления генерируются из плоского каталога профессий, фиксированного
// enum названий нет — подбираем эмодзи по ключевым словам. Порядок важен:
// более специфичное выше общего.
const CAREER_ICON_PAIRS: [string, string][] = [
  ['engineer', '⚙️'], ['architect', '🏛️'], ['develop', '💻'], ['program', '💻'],
  ['analyst', '📊'], ['data', '📊'], ['statistic', '📊'],
  ['doctor', '🩺'], ['nurse', '🩺'], ['medic', '🩺'], ['physician', '🩺'], ['dent', '🩺'], ['pharma', '💊'],
  ['biolog', '🧬'], ['chem', '🧪'], ['physic', '⚛️'], ['math', '📐'],
  ['scien', '🔬'], ['research', '🔬'], ['geolog', '🔬'],
  ['teach', '📚'], ['professor', '📚'], ['faculty', '📚'], ['librarian', '📚'], ['instructor', '📚'],
  ['psycholog', '🧠'], ['counsel', '🧠'], ['therap', '🧠'],
  ['social', '🤝'], ['volunteer', '🤝'], ['communit', '🤝'],
  ['manager', '📈'], ['business', '📈'], ['entrepreneur', '📈'], ['executive', '📈'],
  ['financ', '💰'], ['account', '🧾'], ['bank', '🏦'], ['tax', '🧾'], ['broker', '💰'],
  ['market', '📣'], ['advertis', '📣'], ['sales', '🛒'], ['public relations', '📣'],
  ['law', '⚖️'], ['attorney', '⚖️'], ['paralegal', '⚖️'], ['judge', '⚖️'],
  ['journal', '📰'], ['report', '📰'], ['writer', '✍️'], ['editor', '✍️'], ['author', '✍️'],
  ['artist', '🎨'], ['design', '🎨'], ['illustrat', '🎨'], ['fashion', '👗'],
  ['music', '🎵'], ['danc', '💃'], ['drama', '🎭'], ['actor', '🎭'], ['entertain', '🎭'], ['photograph', '📷'],
  ['pilot', '✈️'], ['air traffic', '✈️'], ['aviation', '✈️'],
  ['farm', '🌾'], ['agri', '🌾'], ['forest', '🌲'], ['garden', '🌿'],
  ['veterinar', '🐾'], ['animal', '🐾'],
  ['polic', '👮'], ['safety', '🦺'], ['inspector', '🦺'], ['warden', '🦺'],
  ['sport', '🏅'], ['athlet', '🏅'], ['coach', '🏅'], ['recreation', '🏅'],
  ['travel', '✈️'], ['tour', '✈️'],
  ['comput', '💻'], ['technolog', '💻'], ['technic', '🔧'],
];

export function getIconForCareer(name: string): string {
  const lower = name.toLowerCase();
  for (const [kw, icon] of CAREER_ICON_PAIRS) {
    if (lower.includes(kw)) return icon;
  }
  return '🧭';
}

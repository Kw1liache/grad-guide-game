export const characters = [
  { id: 'char_a', name: 'Алекс', color: 0x4488ff },
  { id: 'char_b', name: 'Кира', color: 0xff6688 },
];

export const institutes = [
  { id: 'irit_rtf', name: 'ИРИТ-РТФ', description: 'Институт радиоэлектроники и информационных технологий', active: true },
  { id: 'coming_soon', name: 'Другой институт', description: 'Скоро', active: false },
];

export const quizCards = [
  { id: 1, text: 'ИРИТ-РТФ основан в 1912 году', answer: false },
  { id: 2, text: 'Директор бакалавриата — Новиков М.Ю.', answer: true },
  { id: 3, text: 'Столовая в РТФ на первом этаже', answer: true },
  { id: 4, text: 'В РТФ есть направление Социология', answer: false },
  { id: 5, text: 'Неофициально РТФ называют "Радиком"', answer: true },
  { id: 6, text: 'В РТФ нет ИОТа (индивидуальной образовательной траектории)', answer: false },
];

export interface GameState {
  selectedCharacter: string | null;
  selectedInstitute: string | null;
  achievements: { quiz_master: boolean };
}

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem('pixelUniGame');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { selectedCharacter: null, selectedInstitute: null, achievements: { quiz_master: false } };
}

export function saveGameState(state: GameState) {
  localStorage.setItem('pixelUniGame', JSON.stringify(state));
}

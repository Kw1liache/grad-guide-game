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

// Radik NPC lines — rotates through these when talked to
export const radikLines = [
  'Привет! Я Радик — неофициальный талисман РТФ! 😎',
  'Знаешь, что РТФ — один из старейших институтов УрФУ?',
  'Загляни в библиотеку — там можно узнать интересные факты!',
  'В лаборатории есть крутые эксперименты, попробуй!',
  'Деканат — место силы. Там висит расписание и доска почёта!',
  'Если все достижения соберёшь — станешь настоящим знатоком РТФ!',
  'А ты уже прошёл викторину на ноутбуке у лектора? 🤓',
];

// Library book facts
export const libraryFacts = [
  { id: 1, title: '📗 История РТФ', text: 'Радиотехнический факультет был основан в 1952 году на базе УПИ. Сегодня это ИРИТ-РТФ — один из крупнейших институтов УрФУ.' },
  { id: 2, title: '📘 Направления', text: 'В ИРИТ-РТФ более 15 направлений подготовки: от программной инженерии до инфокоммуникационных технологий.' },
  { id: 3, title: '📙 Выпускники', text: 'Среди выпускников РТФ — основатели IT-компаний, учёные и руководители крупных технологических проектов.' },
  { id: 4, title: '📕 Студенческая жизнь', text: 'На РТФ активно работают студенческие клубы, хакатоны, и ежегодно проводится легендарный «День Радио»!' },
];

// Lab experiments
export const labExperiments = [
  { id: 1, name: 'Сигнальный генератор', description: 'Генерирует сигналы разных частот. Покрути частоту!', emoji: '📡' },
  { id: 2, name: 'Осциллограф', description: 'Показывает форму электрического сигнала в реальном времени.', emoji: '📊' },
  { id: 3, name: 'Робот-манипулятор', description: 'Запрограммируй последовательность движений робота!', emoji: '🤖' },
];

// Dean office info
export const deanNotices = [
  { id: 1, title: '📋 Расписание', text: 'Занятия начинаются в 8:30. Расписание обновляется каждый семестр на сайте института.' },
  { id: 2, title: '🏆 Доска почёта', text: 'Лучшие студенты семестра: Иванов А., Петрова Б., Сидоров В. — отличная учёба и активная научная работа!' },
  { id: 3, title: '📢 Объявления', text: 'Открыта запись на хакатон «РТФ-Хак 2025»! Призовой фонд 500 000 ₽. Регистрация до конца месяца.' },
];

export type AchievementKey = 'quiz_master' | 'bookworm' | 'scientist' | 'explorer' | 'radik_friend';

export const achievementDefs: Record<AchievementKey, { name: string; description: string; emoji: string }> = {
  quiz_master: { name: 'Знаток институтов', description: 'Прошёл викторину на 6/6', emoji: '🏆' },
  bookworm: { name: 'Книжный червь', description: 'Прочитал все книги в библиотеке', emoji: '📚' },
  scientist: { name: 'Юный учёный', description: 'Испытал все эксперименты в лаборатории', emoji: '🔬' },
  explorer: { name: 'Исследователь', description: 'Побывал во всех комнатах', emoji: '🗺️' },
  radik_friend: { name: 'Друг Радика', description: 'Поговорил с Радиком 3 раза', emoji: '🤝' },
};

export interface Achievements {
  quiz_master: boolean;
  bookworm: boolean;
  scientist: boolean;
  explorer: boolean;
  radik_friend: boolean;
}

export interface GameState {
  selectedCharacter: string | null;
  selectedInstitute: string | null;
  achievements: Achievements;
  visitedRooms: string[];
  radikTalks: number;
  booksRead: number[];
  experimentsUsed: number[];
}

const defaultState: GameState = {
  selectedCharacter: null,
  selectedInstitute: null,
  achievements: { quiz_master: false, bookworm: false, scientist: false, explorer: false, radik_friend: false },
  visitedRooms: [],
  radikTalks: 0,
  booksRead: [],
  experimentsUsed: [],
};

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem('pixelUniGame');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed, achievements: { ...defaultState.achievements, ...parsed.achievements } };
    }
  } catch {}
  return { ...defaultState };
}

export function saveGameState(state: GameState) {
  localStorage.setItem('pixelUniGame', JSON.stringify(state));
}

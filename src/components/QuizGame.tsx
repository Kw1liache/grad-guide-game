import { useState } from 'react';
import { quizCards } from '../game/data';

interface Props {
  onClose: () => void;
  onAchievement: () => void;
  achieved: boolean;
}

export default function QuizGame({ onClose, onAchievement, achieved }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>(
    Object.fromEntries(quizCards.map(c => [c.id, null]))
  );
  const [checked, setChecked] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const allAnswered = quizCards.every(c => answers[c.id] !== null);

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = quizCards.every(c => answers[c.id] === c.answer);
    if (allCorrect && !achieved) {
      setTimeout(() => setShowAchievement(true), 600);
      onAchievement();
    }
  };

  const handleRetry = () => {
    setChecked(false);
  };

  const allCorrect = checked && quizCards.every(c => answers[c.id] === c.answer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-sm">💻 Мини-игра: Факт или нет?</h2>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        <div className="space-y-3 mb-4">
          {quizCards.map(card => {
            const isCorrect = checked && answers[card.id] === card.answer;
            const isWrong = checked && answers[card.id] !== card.answer;
            
            return (
              <div
                key={card.id}
                className={`p-3 border-2 transition-all ${
                  isCorrect ? 'border-primary bg-primary/10' :
                  isWrong ? 'border-destructive bg-destructive/10' :
                  'border-border bg-card'
                }`}
              >
                <p className="text-foreground text-[8px] mb-2 leading-relaxed">{card.text}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { if (!checked) setAnswers(a => ({ ...a, [card.id]: true })); }}
                    className={`text-[7px] px-3 py-1 border-2 transition-all ${
                      answers[card.id] === true
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Верно
                  </button>
                  <button
                    onClick={() => { if (!checked) setAnswers(a => ({ ...a, [card.id]: false })); }}
                    className={`text-[7px] px-3 py-1 border-2 transition-all ${
                      answers[card.id] === false
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Неверно
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          {!checked ? (
            <button
              disabled={!allAnswered}
              onClick={handleCheck}
              className="pixel-btn text-[8px]"
            >
              Проверить
            </button>
          ) : !allCorrect ? (
            <button onClick={handleRetry} className="pixel-btn pixel-btn-accent text-[8px]">
              Исправить ответы
            </button>
          ) : (
            <span className="text-primary text-[8px]">✓ Все верно! Отличная работа!</span>
          )}
        </div>

        {/* Achievement popup */}
        {showAchievement && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center pixel-overlay" onClick={() => setShowAchievement(false)}>
            <div className="pixel-card pixel-card-selected p-8 text-center animate-bounce" onClick={e => e.stopPropagation()}>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-primary text-sm mb-2">Достижение получено!</h3>
              <p className="text-foreground text-[8px] mb-4">«А ты знаток в этом деле!»</p>
              <button onClick={() => setShowAchievement(false)} className="pixel-btn text-[8px]">
                Круто!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

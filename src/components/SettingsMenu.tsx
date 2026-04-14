import { characters } from '../game/data';

interface Props {
  onClose: () => void;
  currentCharacter: string;
  onChangeCharacter: (id: string) => void;
  onResetProgress: () => void;
}

export default function SettingsMenu({ onClose, currentCharacter, onChangeCharacter, onResetProgress }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[520px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground text-sm">⚙️ Настройки</h2>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        {/* Character selection */}
        <div className="mb-6">
          <h3 className="text-foreground text-[8px] mb-3">Персонаж</h3>
          <div className="flex gap-4">
            {characters.map(c => (
              <button
                key={c.id}
                onClick={() => onChangeCharacter(c.id)}
                className={`pixel-card flex flex-col items-center p-3 cursor-pointer transition-all ${
                  currentCharacter === c.id ? 'pixel-card-selected' : ''
                }`}
              >
                <img
                  src={c.id === 'char_b' ? '/sprites/girl_right.png' : '/sprites/boy_right.png'}
                  alt={c.name}
                  className="w-12 h-14 object-contain mb-2"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-foreground text-[7px]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls reminder */}
        <div className="mb-6">
          <h3 className="text-foreground text-[8px] mb-2">Управление</h3>
          <div className="p-3 bg-muted text-muted-foreground text-[7px] leading-loose">
            <div>A/D — влево/вправо</div>
            <div>Space — прыжок</div>
            <div>E — взаимодействие</div>
            <div>ESC — настройки</div>
          </div>
        </div>

        {/* Reset progress */}
        <div className="mb-4">
          <button
            onClick={() => {
              if (confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) {
                onResetProgress();
              }
            }}
            className="pixel-btn text-[7px]"
            style={{ borderColor: 'hsl(0, 60%, 50%)', color: 'hsl(0, 60%, 70%)' }}
          >
            🗑️ Сбросить прогресс
          </button>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="pixel-btn text-[8px]">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

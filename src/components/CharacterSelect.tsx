import { useState } from 'react';
import { characters } from '../game/data';

interface Props {
  onSelect: (id: string) => void;
}

export default function CharacterSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-foreground text-lg mb-2">Выберите персонажа</h1>
      <p className="text-muted-foreground text-[8px] mb-8">Кто вы в мире ИРИТ-РТФ?</p>
      
      <div className="flex gap-8 mb-8">
        {characters.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`pixel-card flex flex-col items-center p-6 cursor-pointer transition-all w-40 ${
              selected === c.id ? 'pixel-card-selected' : ''
            }`}
          >
            <img
              src={c.id === 'char_b' ? '/sprites/girl_right.png' : '/sprites/boy_right.png'}
              alt={c.name}
              className="w-16 h-20 object-contain mb-4"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-foreground text-xs">{c.name}</span>
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className="pixel-btn text-xs"
      >
        Продолжить
      </button>
    </div>
  );
}

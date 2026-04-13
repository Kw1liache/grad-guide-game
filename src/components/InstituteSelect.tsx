import { useState } from 'react';
import { institutes } from '../game/data';

interface Props {
  onSelect: (id: string) => void;
}

export default function InstituteSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-foreground text-lg mb-2">Выберите институт</h1>
      <p className="text-muted-foreground text-[8px] mb-8">Куда отправимся?</p>

      <div className="flex gap-6 mb-8">
        {institutes.map(inst => (
          <button
            key={inst.id}
            disabled={!inst.active}
            onClick={() => inst.active && setSelected(inst.id)}
            className={`pixel-card flex flex-col items-center p-6 w-56 transition-all ${
              selected === inst.id ? 'pixel-card-selected' : ''
            } ${!inst.active ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-3xl mb-3">{inst.active ? '🏛️' : '🔒'}</div>
            <span className="text-foreground text-xs mb-2">{inst.name}</span>
            <span className="text-muted-foreground text-[7px] text-center leading-relaxed">
              {inst.active ? inst.description : 'Скоро'}
            </span>
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className="pixel-btn text-xs"
      >
        Войти
      </button>
    </div>
  );
}

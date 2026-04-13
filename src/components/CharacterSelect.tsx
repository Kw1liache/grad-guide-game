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
            {/* Pixel character preview */}
            <div className="w-16 h-20 mb-4 relative">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-1" style={{ background: c.color === 0x4488ff ? '#4488ff' : '#ff6688' }} />
              <div className="absolute left-1/2 top-1 -translate-x-1/2 w-3.5 h-3.5 bg-[#ffccaa]" />
              <div className="absolute left-[calc(50%-4px)] top-[6px] w-[3px] h-[3px] bg-[#222]" />
              <div className="absolute left-[calc(50%+2px)] top-[6px] w-[3px] h-[3px] bg-[#222]" />
              <div className="absolute left-1/2 top-5 -translate-x-1/2 w-4 h-5" style={{ background: c.color === 0x4488ff ? '#4488ff' : '#ff6688' }} />
              <div className="absolute left-[calc(50%-5px)] top-[42px] w-[6px] h-2" style={{ background: c.color === 0x4488ff ? '#2244aa' : '#aa3355' }} />
              <div className="absolute left-[calc(50%+1px)] top-[42px] w-[6px] h-2" style={{ background: c.color === 0x4488ff ? '#2244aa' : '#aa3355' }} />
            </div>
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

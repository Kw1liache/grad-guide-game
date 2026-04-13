import { useState } from 'react';
import { radikLines } from '../game/data';

interface Props {
  onClose: () => void;
  talkCount: number;
}

export default function RadikDialog({ onClose, talkCount }: Props) {
  const lineIndex = (talkCount - 1) % radikLines.length;
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[480px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <h2 className="text-foreground text-sm" style={{ color: '#ff8844' }}>Радик</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        <div className="min-h-[60px] mb-3 p-3 bg-muted text-foreground text-[8px] leading-relaxed">
          {radikLines[lineIndex]}
        </div>

        {talkCount >= 3 && !showMore && (
          <div className="mb-3 p-2 border-2 text-[7px] text-foreground leading-relaxed"
            style={{ borderColor: 'hsl(var(--accent))' }}>
            <span className="text-accent">💡 Совет от Радика:</span> Побывай во всех комнатах и попробуй все интерактивные объекты — собери все достижения!
          </div>
        )}

        <div className="flex gap-2 justify-between items-center">
          <span className="text-muted-foreground text-[7px]">
            Разговор #{talkCount}
          </span>
          <button onClick={onClose} className="pixel-btn text-[8px]">
            Пока, Радик!
          </button>
        </div>
      </div>
    </div>
  );
}

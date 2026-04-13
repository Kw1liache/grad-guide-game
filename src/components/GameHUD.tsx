import { characters } from '../game/data';

interface Props {
  characterId: string;
  achievementCount: number;
}

export default function GameHUD({ characterId, achievementCount }: Props) {
  const char = characters.find(c => c.id === characterId) || characters[0];
  const color = char.color === 0x4488ff ? '#4488ff' : '#ff6688';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      {/* Top Left - Character + Achievements */}
      <div className="absolute top-3 left-3 flex items-center gap-3 pointer-events-auto">
        <div className="pixel-card flex items-center gap-2 p-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: color }} />
          <span className="text-foreground text-[7px]">{char.name}</span>
        </div>
        <div className="pixel-card flex items-center gap-2 p-2">
          <span className="text-[10px]">🏆</span>
          <span className="text-foreground text-[7px]">{achievementCount}/1</span>
        </div>
      </div>

      {/* Top Right - Settings (inactive) */}
      <div className="absolute top-3 right-3">
        <div className="pixel-card p-2 opacity-40">
          <span className="text-muted-foreground text-[8px]">⚙️</span>
        </div>
      </div>

      {/* Bottom Right - Controls hint */}
      <div className="absolute bottom-3 right-3">
        <div className="pixel-card p-2 text-[6px] text-muted-foreground leading-loose">
          <div>A/D — влево/вправо</div>
          <div>Space — прыжок</div>
          <div>E — взаимодействие</div>
          <div className="opacity-40">O — инвентарь</div>
        </div>
      </div>
    </div>
  );
}

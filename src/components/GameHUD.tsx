import { characters, achievementDefs, type Achievements, type AchievementKey } from '../game/data';
import { useState } from 'react';

interface Props {
  characterId: string;
  achievements: Achievements;
}

export default function GameHUD({ characterId, achievements }: Props) {
  const char = characters.find(c => c.id === characterId) || characters[0];
  const color = char.color === 0x4488ff ? '#4488ff' : '#ff6688';
  const [showAchList, setShowAchList] = useState(false);

  const totalAch = Object.keys(achievementDefs).length;
  const earnedAch = (Object.keys(achievements) as AchievementKey[]).filter(k => achievements[k]).length;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      {/* Top Left - Character + Achievements */}
      <div className="absolute top-3 left-3 flex items-center gap-3 pointer-events-auto">
        <div className="pixel-card flex items-center gap-2 p-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: color }} />
          <span className="text-foreground text-[7px]">{char.name}</span>
        </div>
        <button
          className="pixel-card flex items-center gap-2 p-2 cursor-pointer hover:border-primary transition-colors"
          style={{ borderColor: showAchList ? 'hsl(var(--primary))' : undefined }}
          onClick={() => setShowAchList(!showAchList)}
        >
          <span className="text-[10px]">🏆</span>
          <span className="text-foreground text-[7px]">{earnedAch}/{totalAch}</span>
        </button>
      </div>

      {/* Achievement list dropdown */}
      {showAchList && (
        <div className="absolute top-14 left-3 pointer-events-auto pixel-card p-3 w-64">
          <h3 className="text-foreground text-[8px] mb-2">Достижения</h3>
          {(Object.keys(achievementDefs) as AchievementKey[]).map(key => {
            const def = achievementDefs[key];
            const earned = achievements[key];
            return (
              <div key={key} className={`flex items-center gap-2 p-1.5 mb-1 text-[6px] ${earned ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                <span className="text-[10px]">{earned ? def.emoji : '🔒'}</span>
                <div>
                  <div className="text-[7px]">{def.name}</div>
                  <div className="text-[5px]">{def.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          <div>ESC — назад</div>
          <div className="opacity-40">O — инвентарь</div>
        </div>
      </div>
    </div>
  );
}

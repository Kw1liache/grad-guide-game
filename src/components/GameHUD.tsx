import { characters, achievementDefs, type Achievements, type AchievementKey } from '../game/data';
import { useState } from 'react';

interface Props {
  characterId: string;
  achievements: Achievements;
}

export default function GameHUD({ characterId, achievements }: Props) {
  const char = characters.find(c => c.id === characterId) || characters[0];
  const [showAchList, setShowAchList] = useState(false);

  const totalAch = Object.keys(achievementDefs).length;
  const earnedAch = (Object.keys(achievements) as AchievementKey[]).filter(k => achievements[k]).length;

  const spriteUrl = char.id === 'char_b' ? '/sprites/girl_right.png' : '/sprites/boy_right.png';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      {/* Top Left */}
      <div className="absolute top-3 left-3 flex items-center gap-3 pointer-events-auto">
        <div className="pixel-card flex items-center gap-2 p-2">
          <img src={spriteUrl} alt={char.name} className="w-5 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
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

      {/* Top Right - Settings hint */}
      <div className="absolute top-3 right-3">
        <div className="pixel-card p-2">
          <span className="text-muted-foreground text-[7px]">ESC — настройки</span>
        </div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-3 right-3">
        <div className="pixel-card p-2 text-[6px] text-muted-foreground leading-loose">
          <div>A/D — влево/вправо</div>
          <div>Space — прыжок</div>
          <div>E — взаимодействие</div>
          <div>ESC — настройки</div>
        </div>
      </div>
    </div>
  );
}

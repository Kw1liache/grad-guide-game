import { achievementDefs, type AchievementKey } from '../game/data';

interface Props {
  achievementKey: AchievementKey;
  onClose: () => void;
}

export default function AchievementPopup({ achievementKey, onClose }: Props) {
  const ach = achievementDefs[achievementKey];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card pixel-card-selected p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-4">{ach.emoji}</div>
        <h3 className="text-primary text-sm mb-2">Достижение получено!</h3>
        <p className="text-foreground text-[9px] mb-1">«{ach.name}»</p>
        <p className="text-muted-foreground text-[7px] mb-4">{ach.description}</p>
        <button onClick={onClose} className="pixel-btn text-[8px]">
          Круто!
        </button>
      </div>
    </div>
  );
}

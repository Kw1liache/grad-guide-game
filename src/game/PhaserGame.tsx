import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { CorridorScene } from './scenes/CorridorScene';
import { LectureRoomScene } from './scenes/LectureRoomScene';
import { LibraryScene } from './scenes/LibraryScene';
import { LabScene } from './scenes/LabScene';
import { DeanScene } from './scenes/DeanScene';

interface PhaserGameProps {
  characterId: string;
  onOpenDialog: () => void;
  onOpenQuiz: () => void;
  onTalkRadik: () => void;
  onReadBook: (index: number) => void;
  onUseExperiment: (index: number) => void;
  onReadNotice: (index: number) => void;
  onVisitRoom: (room: string) => void;
}

export default function PhaserGame({
  characterId, onOpenDialog, onOpenQuiz, onTalkRadik,
  onReadBook, onUseExperiment, onReadNotice, onVisitRoom,
}: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 540,
      pixelArt: true,
      backgroundColor: '#1a1e2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 800 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [CorridorScene, LectureRoomScene, LibraryScene, LabScene, DeanScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set('characterId', characterId);
    game.registry.set('onOpenDialog', onOpenDialog);
    game.registry.set('onOpenQuiz', onOpenQuiz);
    game.registry.set('onTalkRadik', onTalkRadik);
    game.registry.set('onReadBook', onReadBook);
    game.registry.set('onUseExperiment', onUseExperiment);
    game.registry.set('onReadNotice', onReadNotice);
    game.registry.set('onVisitRoom', onVisitRoom);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [characterId, onOpenDialog, onOpenQuiz, onTalkRadik, onReadBook, onUseExperiment, onReadNotice, onVisitRoom]);

  return <div ref={containerRef} className="w-full h-full" />;
}

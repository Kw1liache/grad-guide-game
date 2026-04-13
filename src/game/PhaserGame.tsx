import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { CorridorScene } from './scenes/CorridorScene';
import { LectureRoomScene } from './scenes/LectureRoomScene';

interface PhaserGameProps {
  characterId: string;
  onOpenDialog: () => void;
  onOpenQuiz: () => void;
}

export default function PhaserGame({ characterId, onOpenDialog, onOpenQuiz }: PhaserGameProps) {
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
      scene: [CorridorScene, LectureRoomScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set('characterId', characterId);
    game.registry.set('onOpenDialog', onOpenDialog);
    game.registry.set('onOpenQuiz', onOpenQuiz);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [characterId, onOpenDialog, onOpenQuiz]);

  return <div ref={containerRef} className="w-full h-full" />;
}

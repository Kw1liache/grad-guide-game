import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { CorridorScene } from './scenes/CorridorScene';
import { LectureRoomScene } from './scenes/LectureRoomScene';
import { LibraryScene } from './scenes/LibraryScene';
import { LabScene } from './scenes/LabScene';
import { DeanScene } from './scenes/DeanScene';

interface PhaserGameProps {
  characterId: string;
  uiOpen: boolean;
  onOpenDialog: () => void;
  onOpenQuiz: () => void;
  onTalkRadik: () => void;
  onReadBook: (index: number) => void;
  onUseExperiment: (index: number) => void;
  onReadNotice: (index: number) => void;
  onVisitRoom: (room: string) => void;
  onOpenSettings: () => void;
}

export default function PhaserGame({
  characterId, uiOpen, onOpenDialog, onOpenQuiz, onTalkRadik,
  onReadBook, onUseExperiment, onReadNotice, onVisitRoom, onOpenSettings,
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
    game.registry.set('uiOpen', false);
    game.registry.set('onOpenDialog', onOpenDialog);
    game.registry.set('onOpenQuiz', onOpenQuiz);
    game.registry.set('onTalkRadik', onTalkRadik);
    game.registry.set('onReadBook', onReadBook);
    game.registry.set('onUseExperiment', onUseExperiment);
    game.registry.set('onReadNotice', onReadNotice);
    game.registry.set('onVisitRoom', onVisitRoom);
    game.registry.set('onOpenSettings', onOpenSettings);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Update registry values when props change (without recreating game)
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('uiOpen', uiOpen);
    }
  }, [uiOpen]);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('characterId', characterId);
      // Restart current scene to load+apply new character sprite
      const activeScenes = gameRef.current.scene.getScenes(true);
      activeScenes.forEach(scene => {
        // Pass current scene init data so floor/spawn is preserved
        const sceneKey = scene.scene.key;
        if (sceneKey === 'CorridorScene') {
          // @ts-ignore — read private state if present
          const floor = (scene as any).currentFloor ?? 1;
          // @ts-ignore
          const sx = (scene as any).player?.x ?? 100;
          scene.scene.restart({ floor, spawnX: sx });
        } else {
          // @ts-ignore
          const rf = (scene as any).returnFloor;
          // @ts-ignore
          const rx = (scene as any).returnX;
          // @ts-ignore
          const px = (scene as any).player?.x ?? 100;
          scene.scene.restart({ returnFloor: rf, returnX: rx, spawnX: px });
        }
      });
    }
  }, [characterId]);

  return <div ref={containerRef} className="w-full h-full" />;
}

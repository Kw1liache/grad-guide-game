import { useState, useCallback, useEffect } from 'react';
import CharacterSelect from '../components/CharacterSelect';
import InstituteSelect from '../components/InstituteSelect';
import GameHUD from '../components/GameHUD';
import NPCDialog from '../components/NPCDialog';
import QuizGame from '../components/QuizGame';
import PhaserGame from '../game/PhaserGame';
import { loadGameState, saveGameState } from '../game/data';

type Screen = 'character' | 'institute' | 'game';

export default function Index() {
  const [gameState, setGameState] = useState(loadGameState);
  const [screen, setScreen] = useState<Screen>(() => {
    const s = loadGameState();
    if (s.selectedCharacter && s.selectedInstitute) return 'game';
    if (s.selectedCharacter) return 'institute';
    return 'character';
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleCharacterSelect = (id: string) => {
    setGameState(s => ({ ...s, selectedCharacter: id }));
    setScreen('institute');
  };

  const handleInstituteSelect = (id: string) => {
    setGameState(s => ({ ...s, selectedInstitute: id }));
    setScreen('game');
  };

  const handleOpenDialog = useCallback(() => setDialogOpen(true), []);
  const handleOpenQuiz = useCallback(() => setQuizOpen(true), []);

  const handleAchievement = () => {
    setGameState(s => ({ ...s, achievements: { ...s.achievements, quiz_master: true } }));
  };

  const achievementCount = gameState.achievements.quiz_master ? 1 : 0;

  if (screen === 'character') {
    return <CharacterSelect onSelect={handleCharacterSelect} />;
  }

  if (screen === 'institute') {
    return <InstituteSelect onSelect={handleInstituteSelect} />;
  }

  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative">
      <PhaserGame
        characterId={gameState.selectedCharacter!}
        onOpenDialog={handleOpenDialog}
        onOpenQuiz={handleOpenQuiz}
      />
      <GameHUD characterId={gameState.selectedCharacter!} achievementCount={achievementCount} />
      {dialogOpen && <NPCDialog onClose={() => setDialogOpen(false)} />}
      {quizOpen && (
        <QuizGame
          onClose={() => setQuizOpen(false)}
          onAchievement={handleAchievement}
          achieved={gameState.achievements.quiz_master}
        />
      )}
    </div>
  );
}

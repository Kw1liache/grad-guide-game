import { useState, useCallback, useEffect, useRef } from 'react';
import CharacterSelect from '../components/CharacterSelect';
import InstituteSelect from '../components/InstituteSelect';
import GameHUD from '../components/GameHUD';
import NPCDialog from '../components/NPCDialog';
import QuizGame from '../components/QuizGame';
import RadikDialog from '../components/RadikDialog';
import BookViewer from '../components/BookViewer';
import ExperimentViewer from '../components/ExperimentViewer';
import NoticeViewer from '../components/NoticeViewer';
import AchievementPopup from '../components/AchievementPopup';
import PhaserGame from '../game/PhaserGame';
import { loadGameState, saveGameState, type AchievementKey, libraryFacts, labExperiments } from '../game/data';

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
  const [radikOpen, setRadikOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState<number | null>(null);
  const [experimentOpen, setExperimentOpen] = useState<number | null>(null);
  const [noticeOpen, setNoticeOpen] = useState<number | null>(null);
  const [achievementPopup, setAchievementPopup] = useState<AchievementKey | null>(null);
  const pendingAchievement = useRef<AchievementKey | null>(null);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const tryAchievement = useCallback((key: AchievementKey) => {
    setGameState(prev => {
      if (prev.achievements[key]) return prev;
      // Show popup after state update
      pendingAchievement.current = key;
      return { ...prev, achievements: { ...prev.achievements, [key]: true } };
    });
    // Use setTimeout to show popup after state update
    setTimeout(() => {
      if (pendingAchievement.current) {
        setAchievementPopup(pendingAchievement.current);
        pendingAchievement.current = null;
      }
    }, 100);
  }, []);

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

  const handleTalkRadik = useCallback(() => {
    setGameState(prev => {
      const newCount = prev.radikTalks + 1;
      const newState = { ...prev, radikTalks: newCount };
      // Check radik_friend achievement
      if (newCount >= 3 && !prev.achievements.radik_friend) {
        pendingAchievement.current = 'radik_friend';
        newState.achievements = { ...newState.achievements, radik_friend: true };
        setTimeout(() => {
          if (pendingAchievement.current) {
            setAchievementPopup(pendingAchievement.current);
            pendingAchievement.current = null;
          }
        }, 300);
      }
      return newState;
    });
    setRadikOpen(true);
  }, []);

  const handleReadBook = useCallback((index: number) => {
    setGameState(prev => {
      const newBooks = prev.booksRead.includes(index) ? prev.booksRead : [...prev.booksRead, index];
      const newState = { ...prev, booksRead: newBooks };
      // Check bookworm achievement
      if (newBooks.length >= libraryFacts.length && !prev.achievements.bookworm) {
        pendingAchievement.current = 'bookworm';
        newState.achievements = { ...newState.achievements, bookworm: true };
        setTimeout(() => {
          if (pendingAchievement.current) {
            setAchievementPopup(pendingAchievement.current);
            pendingAchievement.current = null;
          }
        }, 300);
      }
      return newState;
    });
    setBookOpen(index);
  }, []);

  const handleUseExperiment = useCallback((index: number) => {
    setGameState(prev => {
      const newExps = prev.experimentsUsed.includes(index) ? prev.experimentsUsed : [...prev.experimentsUsed, index];
      const newState = { ...prev, experimentsUsed: newExps };
      if (newExps.length >= labExperiments.length && !prev.achievements.scientist) {
        pendingAchievement.current = 'scientist';
        newState.achievements = { ...newState.achievements, scientist: true };
        setTimeout(() => {
          if (pendingAchievement.current) {
            setAchievementPopup(pendingAchievement.current);
            pendingAchievement.current = null;
          }
        }, 300);
      }
      return newState;
    });
    setExperimentOpen(index);
  }, []);

  const handleReadNotice = useCallback((index: number) => {
    setNoticeOpen(index);
  }, []);

  const handleVisitRoom = useCallback((room: string) => {
    setGameState(prev => {
      const newVisited = prev.visitedRooms.includes(room) ? prev.visitedRooms : [...prev.visitedRooms, room];
      const newState = { ...prev, visitedRooms: newVisited };
      // All 5 rooms: corridor, library, lecture, lab, dean
      if (newVisited.length >= 5 && !prev.achievements.explorer) {
        pendingAchievement.current = 'explorer';
        newState.achievements = { ...newState.achievements, explorer: true };
        setTimeout(() => {
          if (pendingAchievement.current) {
            setAchievementPopup(pendingAchievement.current);
            pendingAchievement.current = null;
          }
        }, 500);
      }
      return newState;
    });
  }, []);

  const handleQuizAchievement = useCallback(() => {
    tryAchievement('quiz_master');
  }, [tryAchievement]);

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
        onTalkRadik={handleTalkRadik}
        onReadBook={handleReadBook}
        onUseExperiment={handleUseExperiment}
        onReadNotice={handleReadNotice}
        onVisitRoom={handleVisitRoom}
      />
      <GameHUD
        characterId={gameState.selectedCharacter!}
        achievements={gameState.achievements}
      />
      {dialogOpen && <NPCDialog onClose={() => setDialogOpen(false)} />}
      {quizOpen && (
        <QuizGame
          onClose={() => setQuizOpen(false)}
          onAchievement={handleQuizAchievement}
          achieved={gameState.achievements.quiz_master}
        />
      )}
      {radikOpen && (
        <RadikDialog
          onClose={() => setRadikOpen(false)}
          talkCount={gameState.radikTalks}
        />
      )}
      {bookOpen !== null && (
        <BookViewer bookIndex={bookOpen} onClose={() => setBookOpen(null)} />
      )}
      {experimentOpen !== null && (
        <ExperimentViewer experimentIndex={experimentOpen} onClose={() => setExperimentOpen(null)} />
      )}
      {noticeOpen !== null && (
        <NoticeViewer noticeIndex={noticeOpen} onClose={() => setNoticeOpen(null)} />
      )}
      {achievementPopup && (
        <AchievementPopup
          achievementKey={achievementPopup}
          onClose={() => setAchievementPopup(null)}
        />
      )}
    </div>
  );
}

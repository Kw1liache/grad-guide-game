import { labExperiments } from '../game/data';
import { useState } from 'react';

interface Props {
  experimentIndex: number;
  onClose: () => void;
}

export default function ExperimentViewer({ experimentIndex, onClose }: Props) {
  const exp = labExperiments[experimentIndex];
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!exp) return null;

  const results = [
    'Сигнал генерируется на частоте 440 Гц... Слышите? Это нота «Ля»! 🎵',
    'Синусоида стабильна! Амплитуда 5В, частота 1кГц. Всё в норме! 📈',
    'Робот выполнил последовательность: ↑ → ↓ ← захват! Деталь собрана! 🎯',
  ];

  const handleRun = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult(results[experimentIndex]);
      setRunning(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[520px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-sm">{exp.emoji} {exp.name}</h2>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        <div className="p-3 bg-muted text-muted-foreground text-[8px] leading-relaxed mb-4">
          {exp.description}
        </div>

        {/* Experiment visualization */}
        <div className="p-4 mb-4 border-2 border-border bg-card min-h-[80px] flex items-center justify-center">
          {running ? (
            <div className="text-center">
              <div className="text-2xl mb-2 animate-spin">⚙️</div>
              <span className="text-foreground text-[7px] animate-pulse">Эксперимент запущен...</span>
            </div>
          ) : result ? (
            <div className="text-center">
              <p className="text-foreground text-[8px] leading-relaxed">{result}</p>
            </div>
          ) : (
            <span className="text-muted-foreground text-[7px]">Нажмите «Запустить» для начала эксперимента</span>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleRun} disabled={running} className="pixel-btn text-[8px]">
            {result ? 'Повторить' : 'Запустить'} 🚀
          </button>
          <button onClick={onClose} className="pixel-btn pixel-btn-secondary text-[8px]">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

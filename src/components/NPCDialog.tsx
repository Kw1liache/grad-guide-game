import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function NPCDialog({ onClose }: Props) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) {
      setResponse('Введите вопрос.');
      return;
    }
    setLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse('Здесь будет ответ от вашего ИИ-спутника.');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[480px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-sm">Лектор</h2>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        <div className="min-h-[80px] mb-4 p-3 bg-muted text-muted-foreground text-[8px] leading-relaxed">
          {loading && <span className="animate-pulse">Думаю...</span>}
          {response && <span>{response}</span>}
          {!loading && !response && <span className="text-muted-foreground/50">Задайте вопрос лектору...</span>}
        </div>

        <div className="flex gap-2">
          <input
            className="pixel-input flex-1"
            placeholder="О чем хотите спросить?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="pixel-btn text-[8px]">
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

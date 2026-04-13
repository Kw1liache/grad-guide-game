import { deanNotices } from '../game/data';

interface Props {
  noticeIndex: number;
  onClose: () => void;
}

export default function NoticeViewer({ noticeIndex, onClose }: Props) {
  const notice = deanNotices[noticeIndex];
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pixel-overlay" onClick={onClose}>
      <div className="pixel-card w-[500px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-sm">{notice.title}</h2>
          <button onClick={onClose} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>

        <div className="p-4 bg-muted text-foreground text-[8px] leading-[1.8] mb-4">
          {notice.text}
        </div>

        <button onClick={onClose} className="pixel-btn text-[8px]">
          Понятно
        </button>
      </div>
    </div>
  );
}

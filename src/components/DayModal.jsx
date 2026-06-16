import { useEffect } from 'react';
import RichTextArea from './RichTextArea';

export default function DayModal({ isOpen, onClose, dayName, dateLabel, value, onChange }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.15s ease-out' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 600, maxHeight: '80vh', borderRadius: 12 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e8e9ef] flex-shrink-0">
          <div>
            <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-0.5">
              {dayName}
            </div>
            <div className="text-[20px] font-extrabold text-[#1a1a2e] leading-none">
              {dateLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9b9eb0] hover:text-[#3d3f4e] transition-colors bg-transparent border-0 cursor-pointer text-[22px] leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 300 }}>
          <RichTextArea
            value={value}
            onChange={onChange}
            placeholder="What's happening this day..."
          />
        </div>
      </div>
    </div>
  );
}

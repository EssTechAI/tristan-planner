import { useState, useRef, useEffect } from 'react';

const STATUS = {
  not_started: { label: 'Not started', bg: '#e3e5e8', color: '#6b6e80' },
  in_progress: { label: 'In progress', bg: '#e8f4ff', color: '#4e9af1' },
  done:        { label: 'Done',        bg: '#e8f9f0', color: '#2ecc71' },
};
const STATUS_ORDER = ['not_started', 'in_progress', 'done'];

export default function TaskModal({ task, onClose, onUpdate }) {
  const [local, setLocal] = useState(task);
  const subtaskRefs = useRef([]);
  const titleRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [local.text]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const patch = (updates) => {
    const next = { ...local, ...updates };
    setLocal(next);
    onUpdate(next);
  };

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(local.status || 'not_started');
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    patch({ status: next, done: next === 'done' });
  };

  const patchSubtask = (id, field, val) => {
    const subtasks = (local.subtasks || []).map(s =>
      s.id === id ? { ...s, [field]: val } : s
    );
    patch({ subtasks });
  };

  const addSubtask = (focusIdx) => {
    const newSub = { id: crypto.randomUUID(), text: '', done: false };
    const subtasks = [...(local.subtasks || []), newSub];
    patch({ subtasks });
    setTimeout(() => subtaskRefs.current[focusIdx ?? subtasks.length - 1]?.focus(), 0);
  };

  const status = local.status || 'not_started';
  const cfg = STATUS[status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.15s ease-out' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 640, maxHeight: '80vh', borderRadius: 12 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-start gap-3 mb-3">
            <textarea
              ref={titleRef}
              value={local.text}
              onChange={e => patch({ text: e.target.value })}
              rows={1}
              placeholder="Task title..."
              className="flex-1 text-[24px] font-bold text-[#1a1a2e] border-0 outline-none bg-transparent resize-none leading-tight overflow-hidden placeholder:text-[#c4c7d5]"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#9b9eb0] hover:text-[#3d3f4e] transition-colors bg-transparent border-0 cursor-pointer text-[22px] leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={cycleStatus}
              className="px-3 py-1 rounded-full text-[12px] font-semibold border-0 cursor-pointer transition-all"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </button>
          </div>

          <div className="border-b border-[#e8e9ef]" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="text-[10px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-2">
            Description
          </div>
          <textarea
            value={local.description || ''}
            onChange={e => patch({ description: e.target.value })}
            placeholder="Add a description..."
            className="w-full border-0 outline-none bg-transparent text-[13px] text-[#3d3f4e] resize-none leading-relaxed placeholder:text-[#c4c7d5]"
            style={{ fontFamily: 'inherit', minHeight: 80 }}
          />

          <div className="border-b border-[#e8e9ef] my-4" />

          <div className="text-[10px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-3">
            Sub-tasks
          </div>
          {(local.subtasks || []).map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={s.done}
                onChange={e => patchSubtask(s.id, 'done', e.target.checked)}
                className="flex-shrink-0 w-[14px] h-[14px] cursor-pointer accent-[#7c5cbf]"
              />
              <input
                ref={el => subtaskRefs.current[i] = el}
                value={s.text}
                onChange={e => patchSubtask(s.id, 'text', e.target.value)}
                placeholder="Sub-task..."
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  const subs = local.subtasks || [];
                  if (i === subs.length - 1) {
                    addSubtask(i + 1);
                  } else {
                    subtaskRefs.current[i + 1]?.focus();
                  }
                }}
                className="border-0 bg-transparent text-[13px] w-full outline-none placeholder:text-[#c4c7d5]"
                style={{
                  fontFamily: 'inherit',
                  color: s.done ? '#9b9eb0' : '#3d3f4e',
                  textDecoration: s.done ? 'line-through' : 'none',
                }}
              />
            </div>
          ))}
          <button
            onClick={() => addSubtask()}
            className="text-[12px] text-[#9b9eb0] hover:text-[#7c5cbf] transition-colors bg-transparent border-0 cursor-pointer p-0 mt-1"
          >
            + Add sub-task
          </button>
        </div>
      </div>
    </div>
  );
}

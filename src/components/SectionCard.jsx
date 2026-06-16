export default function SectionCard({ title, children, className = '', showHint = false }) {
  return (
    <div
      className={`bg-white rounded-[10px] p-[16px_18px] border border-[#e8e9ef] relative group ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.07em] uppercase mb-3">
        {title}
      </div>
      {children}
      {showHint && (
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] mt-2 select-none"
          style={{ color: '#c0c3d0' }}
        >
          + add
        </div>
      )}
    </div>
  );
}

export default function SectionCard({ title, children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[10px] p-[16px_18px] border border-[#e8e9ef] ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.07em] uppercase mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

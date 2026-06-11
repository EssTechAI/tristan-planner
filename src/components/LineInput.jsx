export default function LineInput({ value, placeholder, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] outline-none pb-1 mb-2 box-border placeholder:text-[#c4c7d5] focus:border-[#7c5cbf] transition-colors"
    />
  );
}

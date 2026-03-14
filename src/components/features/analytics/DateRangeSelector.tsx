type DateRangeSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
    >
      <option value={7}>Last 7 days</option>
      <option value={14}>Last 14 days</option>
      <option value={30}>Last 30 days</option>
    </select>
  );
}

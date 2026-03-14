type MessageInputProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function MessageInput({ value, disabled, onChange, onSend }: MessageInputProps) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type secure message"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Send
      </button>
    </div>
  );
}

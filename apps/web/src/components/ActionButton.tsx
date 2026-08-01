interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function ActionButton({
  label,
  onClick,
  variant = 'primary',
  disabled,
}: ActionButtonProps) {
  const styles =
    variant === 'primary'
      ? 'border-red-800 bg-red-950/60 text-red-100 hover:bg-red-900/60'
      : 'border-stone-700 bg-stone-900/60 text-stone-300 hover:bg-stone-800/60';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {label}
    </button>
  );
}

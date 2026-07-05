interface EndTurnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  line1?: string;
  line2?: string;
}

export function EndTurnButton({
  onClick,
  disabled,
  line1 = 'END',
  line2 = 'TURN',
}: EndTurnButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border font-cinzel text-[15px] leading-tight tracking-[.12em] text-[#f6e6da] transition-[filter,transform] duration-150 hover:brightness-[1.18] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        borderColor: 'rgba(224,82,74,.65)',
        background: 'radial-gradient(circle at 50% 34%,#b5322a,#5a1713)',
        boxShadow: '0 0 46px -10px rgba(224,82,74,.85)',
      }}
    >
      {line1}
      {line2 ? (
        <>
          <br />
          {line2}
        </>
      ) : null}
    </button>
  );
}

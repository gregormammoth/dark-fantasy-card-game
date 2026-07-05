interface PileInfoProps {
  deckSize: number;
  discardSize: number;
}

export function PileInfo({ deckSize, discardSize }: PileInfoProps) {
  return (
    <div className="flex gap-4 text-sm text-stone-400">
      <span className="rounded-md border border-stone-800 bg-stone-900/60 px-3 py-1">
        Deck: {deckSize}
      </span>
      <span className="rounded-md border border-stone-800 bg-stone-900/60 px-3 py-1">
        Discard: {discardSize}
      </span>
    </div>
  );
}

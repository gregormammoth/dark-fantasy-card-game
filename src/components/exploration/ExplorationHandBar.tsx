import type { ExplorationContext } from '@/types/exploration';
import { Card } from '@/components/Card';

interface ExplorationHandBarProps {
  context: ExplorationContext;
  onSelectCard: (cardInstanceId: string) => void;
  onEndTurn: () => void;
}

export function ExplorationHandBar({
  context,
  onSelectCard,
  onEndTurn,
}: ExplorationHandBarProps) {
  const deckStack = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex items-end gap-5 rounded-[14px] border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,rgba(20,15,12,.9),rgba(12,9,8,.94))] px-5 py-4">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative h-[150px] w-[130px]">
          {deckStack.map((i) => (
            <div
              key={i}
              className="absolute flex h-[120px] w-[88px] items-center justify-center rounded-[9px] border border-[rgba(201,162,74,.4)] bg-[linear-gradient(150deg,#282011_0%,#151009_100%)] shadow-[0_5px_12px_-8px_#000]"
              style={{
                left: i * 0.9,
                top: i * 4.2,
                transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)`,
              }}
            >
              <div className="h-[26px] w-[26px] rotate-45 border border-[rgba(201,162,74,.5)] opacity-80" />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className="font-cinzel text-[24px] text-[#e0b552]">{context.deck.length}</span>
          <span className="mt-1 text-[9px] tracking-[.2em] text-[#8a7f72]">YOUR DECK</span>
        </div>
      </div>

      <div className="w-px self-stretch bg-[rgba(201,162,74,.16)]" />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">
            CARDS IN HAND · SELECT ONE TO ACT
          </span>
          <span className="text-[9px] tracking-[.18em] text-[#8a7f72]">
            DISCARD {context.discard.length}
          </span>
        </div>
        <div className="flex h-[150px] items-end">
          {context.hand.map((card, index) => {
            const selected = context.selectedCardInstanceId === card.instanceId;
            return (
              <div
                key={card.instanceId}
                className={selected ? 'relative z-10 -translate-y-3' : ''}
              >
                <Card
                  card={card}
                  variant="hand"
                  handIndex={index}
                  handTotal={context.hand.length}
                  onClick={() => onSelectCard(card.instanceId)}
                />
              </div>
            );
          })}
          {context.hand.length === 0 && (
            <span className="pb-8 text-[13px] text-[#8a7f72]">Hand is empty.</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="text-center">
          <div className="font-cinzel text-[28px] text-[#e0b552]">{context.actionsRemaining}</div>
          <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">ACTIONS LEFT</div>
        </div>
        <button
          type="button"
          onClick={onEndTurn}
          className="rounded-[10px] border border-[rgba(201,162,74,.45)] bg-[rgba(224,181,82,.12)] px-5 py-3 font-cinzel text-[12px] tracking-[.16em] text-[#e0b552] transition hover:border-[rgba(201,162,74,.8)] hover:bg-[rgba(224,181,82,.2)]"
        >
          END TURN
        </button>
      </div>
    </div>
  );
}

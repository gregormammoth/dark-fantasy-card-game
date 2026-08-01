import type { ReactNode } from 'react';
import type { ComboPreview } from '@/types/comboPreview';
import { isComboPreviewEmpty } from '@/types/comboPreview';
import { AttackIcon, BarrierIcon, PierceIcon, PoisonIcon, ShieldIcon } from './EffectIcons';

interface ComboPreviewPanelProps {
  preview: ComboPreview | null;
  comboSize: number;
  enemyHealth: number;
  playerShield: number;
  playerMaxShield: number;
}

export function ComboPreviewPanel({
  preview,
  comboSize,
  enemyHealth,
  playerShield,
  playerMaxShield,
}: ComboPreviewPanelProps) {
  if (!preview || isComboPreviewEmpty(preview)) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-[rgba(201,162,74,.14)] bg-gradient-to-b from-[rgba(20,15,12,.7)] to-[rgba(12,9,8,.7)] p-4">
        <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">IF YOU END TURN</span>
        <p className="text-sm text-[#5a5147]">Add cards to your combo to see the preview.</p>
      </div>
    );
  }

  const enemyAfter = Math.max(0, enemyHealth - preview.damageToEnemy);
  const shieldAfter = Math.min(playerMaxShield, playerShield + preview.shieldGain);

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[rgba(201,162,74,.24)] bg-gradient-to-b from-[rgba(20,15,12,.9)] to-[rgba(12,9,8,.9)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">IF YOU END TURN</span>
        <span className="text-[10px] text-[#6f6659]">
          {comboSize} card{comboSize === 1 ? '' : 's'}
        </span>
      </div>

      {preview.damageToEnemy > 0 && (
        <PreviewRow
          tone="damage"
          icon={<AttackIcon className="inline-block h-[22px] w-5 shrink-0" />}
          title={
            <>
              <b className="font-cinzel text-[17px]">{preview.damageToEnemy}</b> cards burn from
              enemy
            </>
          }
          detail={
            preview.enemyShieldBlocked > 0
              ? `${preview.totalDamageToEnemy} damage − ${preview.enemyShieldBlocked} enemy shield`
              : `${preview.totalDamageToEnemy} damage`
          }
        />
      )}

      {preview.ignoresShield && (
        <PreviewRow
          tone="pierce"
          icon={<PierceIcon className="inline-block h-4 w-4 shrink-0" />}
          title="Ignores shield"
          detail="Attack pierces armor"
        />
      )}

      {preview.poison && (
        <PreviewRow
          tone="poison"
          icon={<PoisonIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title={
            <>
              Poison <b className="font-cinzel">{preview.poison.damagePerTurn}</b> / turn ×{' '}
              {preview.poison.turns}
            </>
          }
          detail="bypasses shield & barrier"
        />
      )}

      {preview.shieldGain > 0 && (
        <PreviewRow
          tone="shield"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title={
            <>
              You gain <b className="font-cinzel">+{preview.shieldGain}</b> shield
            </>
          }
          detail={`now at ${shieldAfter} / ${playerMaxShield} max`}
        />
      )}

      {preview.barrierGain > 0 && (
        <PreviewRow
          tone="barrier"
          icon={<BarrierIcon className="inline-block h-[13px] w-3.5 shrink-0" />}
          title={
            <>
              You gain <b className="font-cinzel">+{preview.barrierGain}</b> barrier
            </>
          }
          detail="expires end of round"
        />
      )}

      {preview.damageReductionPercent !== undefined && preview.damageReductionPercent > 0 && (
        <PreviewRow
          tone="reduced"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" style={{ background: '#6fae5a' }} />}
          title={
            <>
              <b className="font-cinzel">{preview.damageReductionPercent}%</b> damage reduction
            </>
          }
          detail="this round only"
        />
      )}

      {preview.cardsRecovered > 0 && (
        <PreviewRow
          tone="heal"
          icon={<span className="shrink-0 text-[#c9a24a]">↩</span>}
          title={
            <>
              Recover <b className="font-cinzel">{preview.cardsRecovered}</b> cards
            </>
          }
          detail="from discard to hand"
        />
      )}

      {preview.damageToEnemy > 0 && (
        <>
          <div className="my-0.5 h-px bg-[rgba(201,162,74,.16)]" />
          <div className="flex items-center justify-between text-xs text-[#b7ab9c]">
            <span>Enemy deck</span>
            <span>
              <b className="font-cinzel text-[15px] text-[#f0b3aa]">{enemyHealth}</b>
              <span className="mx-1.5 text-[#6f6659]">→</span>
              <b className="font-cinzel text-[15px] text-[#f0b3aa]">{enemyAfter}</b> cards
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewRow({
  icon,
  title,
  detail,
  tone,
}: {
  icon: ReactNode;
  title: ReactNode;
  detail: string;
  tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'heal';
}) {
  const styles = {
    damage: {
      bg: 'rgba(224,82,74,.1)',
      border: '#e0524a',
      title: '#ffd9d2',
      detail: '#a98',
    },
    pierce: {
      bg: 'rgba(201,162,74,.08)',
      border: '#c9a24a',
      title: '#ecd9b0',
      detail: '#8a7f72',
    },
    poison: {
      bg: 'rgba(111,174,90,.1)',
      border: '#6fae5a',
      title: '#c8ecb8',
      detail: '#7a8a6a',
    },
    shield: {
      bg: 'rgba(91,134,196,.1)',
      border: '#5b86c4',
      title: '#cfe0f5',
      detail: '#7f92ac',
    },
    barrier: {
      bg: 'rgba(154,122,224,.1)',
      border: '#9a7ae0',
      title: '#ddd0f5',
      detail: '#8a7f9a',
    },
    reduced: {
      bg: 'rgba(111,174,90,.08)',
      border: '#6fae5a',
      title: '#c8ecb8',
      detail: '#7a8a6a',
    },
    heal: {
      bg: 'rgba(201,162,74,.08)',
      border: '#c9a24a',
      title: '#ecd9b0',
      detail: '#8a7f72',
    },
  }[tone];

  return (
    <div
      className="flex items-center gap-3 rounded-[9px] px-2.5 py-2"
      style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}` }}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm" style={{ color: styles.title }}>
          {title}
        </div>
        <div className="text-[10px]" style={{ color: styles.detail }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

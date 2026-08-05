'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastKind = 'started' | 'updated' | 'completed' | 'failed';

export interface ExplorationToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  body: string;
}

const KIND_COLOR: Record<ToastKind, string> = {
  started: '#e0b552',
  updated: '#e0b552',
  completed: '#4a965e',
  failed: '#d6443a',
};

interface ExplorationToastsProps {
  toasts: ExplorationToastItem[];
  onDismiss: (id: number) => void;
}

export function ExplorationToasts({ toasts, onDismiss }: ExplorationToastsProps) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[80] flex -translate-x-1/2 flex-col items-center gap-2.5">
      {toasts.map((toast) => {
        const color = KIND_COLOR[toast.kind];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex min-w-[340px] max-w-[440px] animate-[modalIn_.2s_ease-out] items-start gap-3 rounded-md border bg-[rgba(12,9,8,.96)] px-[18px] py-3.5 shadow-[0_20px_50px_-16px_#000]"
            style={{ borderColor: `${color}55` }}
            role="status"
          >
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
            <div className="flex-1">
              <div
                className="font-cinzel text-[12px] tracking-wide"
                style={{ color: toast.kind === 'started' || toast.kind === 'updated' ? '#f0dfcb' : color }}
              >
                {toast.title}
              </div>
              <div className="mt-1 text-[12px] leading-snug text-[#c7bba9]">{toast.body}</div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-[11px] text-[#8a7f72] transition hover:text-[#e8ddcf]"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useExplorationToasts() {
  const [toasts, setToasts] = useState<ExplorationToastItem[]>([]);
  const seqRef = useRef(0);

  const pushToast = useCallback((kind: ToastKind, title: string, body: string) => {
    seqRef.current += 1;
    const id = seqRef.current;
    setToasts((current) => [...current, { id, kind, title, body }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}

export function useQuestToastWatcher(
  quests: Array<{ id: string; name: string; status: string }>,
  flags: Record<string, boolean>,
  pushToast: (kind: ToastKind, title: string, body: string) => void,
) {
  useEffect(() => {
    const key = 'dfcg-quest-toast-snap';
    const snapshot = {
      quests: quests.map((quest) => ({ id: quest.id, status: quest.status, name: quest.name })),
      lavender: Boolean(flags.ingredient_lavender),
      mushroom: Boolean(flags.ingredient_mushroom),
      keyring: Boolean(flags.has_dining_keyring),
      dining: Boolean(flags.dining_hall_path_open),
    };
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      sessionStorage.setItem(key, JSON.stringify(snapshot));
      return;
    }
    let prev: typeof snapshot;
    try {
      prev = JSON.parse(raw) as typeof snapshot;
    } catch {
      sessionStorage.setItem(key, JSON.stringify(snapshot));
      return;
    }

    for (const quest of snapshot.quests) {
      const old = prev.quests.find((item) => item.id === quest.id);
      if (!old) {
        pushToast('started', 'QUEST STARTED', quest.name);
      } else if (old.status === 'active' && quest.status === 'completed') {
        pushToast('completed', 'QUEST COMPLETE', quest.name);
      }
    }

    if (!prev.lavender && snapshot.lavender) {
      pushToast('updated', 'QUEST UPDATED', 'Dried lavender recovered — Infirmary.');
    }
    if (!prev.mushroom && snapshot.mushroom) {
      pushToast('updated', 'QUEST UPDATED', 'Lowcap mushroom recovered — Underground Tunnels.');
    }
    if (!prev.keyring && snapshot.keyring) {
      pushToast('updated', 'QUEST UPDATED', "Executioner's keyring recovered.");
    }
    if (!prev.dining && snapshot.dining) {
      pushToast('updated', 'QUEST UPDATED', 'Dining Hall path opened.');
    }

    sessionStorage.setItem(key, JSON.stringify(snapshot));
  }, [quests, flags, pushToast]);
}

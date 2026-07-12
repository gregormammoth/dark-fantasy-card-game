import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useActorRef } from '@xstate/react';
import { battleMachine } from '@/machine/battleMachine';
import { explorationMachine } from '@/machine/explorationMachine';
import { BattleScreen } from '@/screens/BattleScreen';
import { ExplorationScreen } from '@/screens/ExplorationScreen';
import './index.css';

function App() {
  const [mode, setMode] = useState<'exploration' | 'battle'>('exploration');
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);

  if (mode === 'battle') {
    return (
      <div>
        <div className="fixed left-4 top-4 z-[60]">
          <button
            type="button"
            onClick={() => setMode('exploration')}
            className="rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 text-[11px] tracking-wider text-[#e0b552]"
          >
            ← PRISON MAP
          </button>
        </div>
        <BattleScreen actor={battleActor} />
      </div>
    );
  }

  return (
    <ExplorationScreen actor={explorationActor} onOpenBattle={() => setMode('battle')} />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

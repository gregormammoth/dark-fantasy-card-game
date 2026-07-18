import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useActorRef } from '@xstate/react';
import { battleMachine } from '@/machine/battleMachine';
import { explorationMachine } from '@/machine/explorationMachine';
import { BattleScreen } from '@/screens/BattleScreen';
import { ExplorationScreen } from '@/screens/ExplorationScreen';
import { WorldMapScreen } from '@/screens/WorldMapScreen';
import type { AppScreen } from '@/types/world';
import worldMapData from '@/data/worldMap.json';
import type { WorldMapDefinition } from '@/types/world';
import './index.css';

const worldMap = worldMapData as WorldMapDefinition;

function App() {
  const [screen, setScreen] = useState<AppScreen>('world');
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);

  function enterLocation(locationId: string) {
    const location = worldMap.locations.find((item) => item.id === locationId);
    if (!location?.enabled) {
      return;
    }
    if (location.targetScreen === 'exploration' || locationId === 'prison') {
      setScreen('exploration');
      if (explorationActor.getSnapshot().matches('idle')) {
        explorationActor.send({ type: 'START_EXPLORATION' });
      }
      return;
    }
    if (location.targetScreen === 'battle') {
      setScreen('battle');
      if (battleActor.getSnapshot().matches('idle')) {
        battleActor.send({ type: 'START_BATTLE' });
      }
    }
  }

  if (screen === 'battle') {
    return (
      <div>
        <div className="fixed left-4 top-4 z-[60] flex gap-2">
          <button
            type="button"
            onClick={() => setScreen('exploration')}
            className="rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 text-[11px] tracking-wider text-[#e0b552]"
          >
            ← PRISON MAP
          </button>
          <button
            type="button"
            onClick={() => setScreen('world')}
            className="rounded-lg border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.7)] px-3 py-2 text-[11px] tracking-wider text-[#8a7f72] hover:text-[#c9a24a]"
          >
            THE REALM
          </button>
        </div>
        <BattleScreen actor={battleActor} />
      </div>
    );
  }

  if (screen === 'exploration') {
    return (
      <ExplorationScreen
        actor={explorationActor}
        onOpenBattle={() => {
          setScreen('battle');
          if (battleActor.getSnapshot().matches('idle')) {
            battleActor.send({ type: 'START_BATTLE' });
          }
        }}
        onBackToWorld={() => setScreen('world')}
      />
    );
  }

  return <WorldMapScreen onEnterLocation={enterLocation} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

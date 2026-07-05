import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useActorRef } from '@xstate/react';
import { battleMachine } from '@/machine/battleMachine';
import { BattleScreen } from '@/screens/BattleScreen';
import './index.css';

function App() {
  const actor = useActorRef(battleMachine);

  return <BattleScreen actor={actor} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

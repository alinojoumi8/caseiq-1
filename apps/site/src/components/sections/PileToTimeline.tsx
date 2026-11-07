import '@/app/sections-a.css';
import { PileStage } from './a/PileStage';

/**
 * S4: the pile becomes a timeline. The heading, body, camera roll and rail all live inside the stage (a client
 * component that also renders on the server, in its finished state), so the heading pins with the scene and the
 * timeline reads without JavaScript.
 */
export function PileToTimeline() {
  return (
    <section id="pile" className="section pile-section" aria-labelledby="pile-h">
      <PileStage />
    </section>
  );
}

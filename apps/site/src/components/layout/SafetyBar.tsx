import { en } from '@/content/en';
import { QuickExitButton, QuickExitKey } from './QuickExit';
import { SafeCta } from './SafeCta';

/** S0: the status-bar strip. Safety line on the left, Quick exit on the right. It stays at the top of the viewport. */
export function SafetyBar() {
  return (
    <div className="safe">
      <p className="safe__status">
        <span className="safe__dot" aria-hidden="true" />
        <span className="safe__text">{en.bar.status}</span>
      </p>
      <QuickExitButton />
      <SafeCta targetId="hero-reply-bar" />
      <QuickExitKey />
    </div>
  );
}

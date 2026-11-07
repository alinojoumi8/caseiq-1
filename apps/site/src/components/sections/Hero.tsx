import { en } from '@/content/en';
import { Bubble } from '@/components/world/Bubble';
import { FilmMessage } from '@/components/world/FilmMessage';
import { PinIcon } from '@/components/world/icons';
import { ReplyBar } from '@/components/world/ReplyBar';
import { HeroInteractive } from './HeroInteractive';
import { StickyReplyBar } from './StickyReplyBar';

/**
 * S2: the first viewport. Mobile reading order: headline, film message, sub, who checks, reply bar, reassurance, fine print, chips, thread.
 * From 640px the film message sits beside the sub. From 1200px the grid areas in hero.css put the thread beside the headline
 * and the reply bar underneath, as in the approved sketch. HeroMotion brings the pieces in on load (see there).
 */
export function Hero() {
  const h = en.hero;
  return (
    <section id="top" className="hero" aria-labelledby="hero-h1">
      <div className="hero-left">
        <Bubble as="h1" id="hero-h1" tail className="hero-h1">
          {h.h1}
          <span className="pin" aria-hidden="true">
            <PinIcon />
          </span>
        </Bubble>
        <p className="hero-pinned">{en.world.pinned}</p>
        <div className="hero-subrow">
          <FilmMessage />
          <Bubble as="p" className="hero-sub">
            {h.sub}
          </Bubble>
        </div>
        <Bubble as="p" className="hero-who">
          {h.who}
        </Bubble>
      </div>

      <div className="hero-bar">
        <ReplyBar id="hero-reply-bar" helper={en.world.replyPlaceholder} label={h.cta} cta="hero" />
      </div>

      <p className="hero-reassure">{h.reassure.join(' · ')}</p>
      <p className="hero-fine">{h.disclaimer}</p>

      <HeroInteractive />
      <StickyReplyBar targetId="hero-reply-bar" />
    </section>
  );
}

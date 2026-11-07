import { en } from '@/content/en';
import { siteConfig } from '@/content/site';
import { emailLine } from '@/lib/placeholders';
import { EmailText } from '@/components/world/EmailText';
import { ConversationLauncher, EarlyAccessLink } from './ConversationLauncher';
import '@/app/sections-b.css';

/**
 * S12. The closing section is the first message of the intake. Its right-hand card shows question 1 and opens the
 * conversation sheet (which holds the one and only intake, and the early-access list); every other call to action on the
 * page opens that same sheet. id="start" stays so a link without JavaScript still lands here.
 * data-reply-bar-hide keeps the phone's sticky reply bar out of the way while this section is on screen.
 */
export function FinalCta() {
  const email = emailLine(en.final.email);
  return (
    <section id="start" className="section final" aria-labelledby="start-h" data-reply-bar-hide="">
      <div className="final__layout">
        <div className="final__text">
          <h2 id="start-h" className="h-section">{en.final.h2}</h2>
          <p className="final__body">{en.final.body}</p>
          {email ? (
            <p className="final__email">
              <EmailText text={email} email={siteConfig.contactEmail} />
            </p>
          ) : null}
        </div>
        <div className="final__card">
          <ConversationLauncher />
        </div>
        <div className="final__link">
          <EarlyAccessLink />
        </div>
      </div>
    </section>
  );
}

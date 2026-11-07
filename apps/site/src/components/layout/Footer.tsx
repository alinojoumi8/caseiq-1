import Link from 'next/link';
import { en } from '@/content/en';
import { copyrightLine } from '@/lib/placeholders';
import { QuickExitButton } from './QuickExit';

// The static export writes no prefetch files for these pages (a prefetch asks for /privacy/__next.privacy.__PAGE__.txt and gets a 404), so
// there it does not prefetch; the links still navigate. Read as the literal expression so the bundler folds it.
const prefetch = process.env.NEXT_PUBLIC_HERENOW === '1' ? false : undefined;

// Both are named in @iconify-json/solar/info.json: the set's page, and its licence.
const SOLAR_URL = 'https://www.figma.com/community/file/1166831539721848736';
const LICENCE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/** The credits line, with the icon set and its licence as links to where they are. */
function Credits({ text }: { text: string }) {
  return text.split(/(Solar|CC BY 4.0)/).map((part, i) =>
    part === 'Solar' || part === 'CC BY 4.0' ? (
      <a key={i} className="link" href={part === 'Solar' ? SOLAR_URL : LICENCE_URL} target="_blank" rel="noopener noreferrer">
        {part}
        <span className="sr-only"> ({en.ui.external})</span>
      </a>
    ) : (
      part
    ),
  );
}

/** S13: plain and quiet, on the ground colour. */
export function Footer() {
  const f = en.footer;
  return (
    <footer className="footer" data-reply-bar-hide="">
      <div className="footer__inner">
        <p>{f.disclaimer}</p>
        <p>{f.selfCite}</p>
        <p>{f.examples}</p>
        <p>
          <Credits text={f.credits} />
        </p>
        <p>
          {f.pros.text}{' '}
          <Link className="link" href="/#waitlist" data-cta="footer">
            {f.pros.link}
          </Link>
        </p>
        <nav aria-label={en.brand.name}>
          <ul className="footer__links">
            <li>
              <Link href="/privacy" prefetch={prefetch}>
                {f.links.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" prefetch={prefetch}>
                {f.links.terms}
              </Link>
            </li>
            <li>
              <Link href="/accessibility" prefetch={prefetch}>
                {f.links.accessibility}
              </Link>
            </li>
            <li>
              <Link href="/#start" data-cta="footer">{f.links.contact}</Link>
            </li>
            <li>
              <Link href="/#limits">{f.links.help}</Link>
            </li>
            <li>
              <QuickExitButton className="" asLink />
            </li>
          </ul>
        </nav>
        <p>{copyrightLine(f.copyright, en.brand.name)}</p>
      </div>
    </footer>
  );
}

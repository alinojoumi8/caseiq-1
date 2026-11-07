import Link from 'next/link';
import { en } from '@/content/en';
import { ChatGlyph } from '@/components/world/icons';
import { NavMenu } from './NavMenu';

const LINKS = [
  { href: '/#how', label: en.nav.how },
  { href: '/#get', label: en.nav.get },
  { href: '/#privacy', label: en.nav.privacy },
  { href: '/#faq', label: en.nav.faq },
] as const;

/** S1: nav row. Desktop shows the links and an outline call to action; narrower screens get a disclosure menu. */
export function Nav() {
  return (
    <nav className="nav" aria-label={en.ui.nav}>
      <div className="nav__row" style={{ flexWrap: 'wrap' }}>
        <Link className="logo" href="/">
          <ChatGlyph />
          {en.brand.name}
        </Link>
        <div className="nav__links">
          {LINKS.map((l) => (
            <Link key={l.href} className="nav__link" href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link className="btn-outline nav__cta" href="/#start" data-cta="nav">
          {en.nav.cta}
        </Link>
        <NavMenu />
      </div>
    </nav>
  );
}

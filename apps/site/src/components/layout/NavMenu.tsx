'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { en } from '@/content/en';
import { CloseIcon, MenuIcon } from '@/components/world/icons';

const LINKS = [
  { href: '/#how', label: en.nav.how },
  { href: '/#get', label: en.nav.get },
  { href: '/#privacy', label: en.nav.privacy },
  { href: '/#faq', label: en.nav.faq },
] as const;

/** Mobile disclosure menu: a button that toggles a list of links. Esc closes it and returns focus to the button. */
export function NavMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="btn-outline nav__menu-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
        {en.ui.menu}
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className="nav__panel"
        hidden={!open}
        data-layer-open={open ? '' : undefined}
        data-lenis-prevent
        style={{ gridColumn: '1 / -1', flexBasis: '100%' }}
      >
        {LINKS.map((l) => (
          <Link key={l.href} className="nav__link" href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link className="btn-outline" href="/#start" data-cta="menu" onClick={() => setOpen(false)}>
          {en.nav.cta}
        </Link>
      </div>
    </>
  );
}

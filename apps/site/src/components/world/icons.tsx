// Interface icons. Solar (480 Design, CC BY 4.0) through Iconify, bundled: scripts/icons.mjs copies the few glyphs the site uses into
// solar-icons.ts, so no icon is ever fetched, from Iconify or anywhere else. Linear glyphs (1.5 stroke, the hairline world) for outlines;
// Bold where a solid glyph sits in a filled circle (the pin badge, the send arrows, the play triangle). The chat glyph is the brand mark and stays authored.
// All are decorative: the control that holds them carries the accessible name.
import type { CSSProperties } from 'react';
import { solar, type SolarIcon } from './solar-icons';

interface IconProps {
  size?: number;
  className?: string;
}

/** One Solar glyph as an inline SVG, drawn in the colour of its text (currentColor). */
function Glyph({ icon, size, className, style }: { icon: SolarIcon; size: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

export function ChatGlyph({ size = 30 }: IconProps) {
  return (
    <svg width={size} height={(size * 26) / 30} viewBox="0 0 30 26" aria-hidden="true" focusable="false">
      <path d="M6 1h18a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H13l-7 5v-5a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5z" fill="#111" />
      <path d="M8 8h14M8 13h9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** White, for the ink badge on the headline. */
export function PinIcon({ size = 20 }: IconProps) {
  return <Glyph icon={solar.pin} size={size} style={{ color: '#fff' }} />;
}

export function PlusIcon({ size = 20 }: IconProps) {
  return <Glyph icon={solar.plus} size={size} />;
}

export function ArrowUpIcon({ size = 18 }: IconProps) {
  return <Glyph icon={solar.arrowUp} size={size} />;
}

export function ArrowRightIcon({ size = 18 }: IconProps) {
  return <Glyph icon={solar.arrowRight} size={size} />;
}

/** Solar has no bare X, so this is its plus turned a quarter of the way round: the same 1.5 stroke, and nothing doubled inside the Close circle. */
export function CloseIcon({ size = 20 }: IconProps) {
  return <Glyph icon={solar.plus} size={size} style={{ transform: 'rotate(45deg)' }} />;
}

export function MenuIcon({ size = 20 }: IconProps) {
  return <Glyph icon={solar.menu} size={size} />;
}

export function PageIcon({ size = 16 }: IconProps) {
  return <Glyph icon={solar.page} size={size} />;
}

/** The attachment glyph, in the colour of its text: ink, and indigo only where the attachment can be pressed (world.css). */
export function PdfIcon({ size = 26 }: IconProps) {
  return <Glyph icon={solar.file} size={size} />;
}

export function ExternalIcon({ size = 14 }: IconProps) {
  return <Glyph icon={solar.external} size={size} />;
}

export function ChevronIcon({ size = 18, dir = 'right' }: IconProps & { dir?: 'left' | 'right' | 'down' }) {
  const icon = dir === 'left' ? solar.chevronLeft : dir === 'down' ? solar.chevronDown : solar.chevronRight;
  return <Glyph icon={icon} size={size} />;
}

export function SourceIcon({ size = 14 }: IconProps) {
  return <Glyph icon={solar.source} size={size} />;
}

/** A solid play triangle, drawn to sit in the visual centre of a circle. */
export function PlayIcon({ size = 22 }: IconProps) {
  return <Glyph icon={solar.play} size={size} />;
}

/** The tick in a circle, for the "checked by a person" receipt. */
export function ReceiptIcon({ size = 15 }: IconProps) {
  return <Glyph icon={solar.receipt} size={size} />;
}

/** A bare tick, for a chosen chip. */
export function TickIcon({ size = 16, className }: IconProps) {
  return <Glyph icon={solar.check} size={size} className={className} />;
}

export function AlertGlyph({ size = 18, className }: IconProps) {
  return <Glyph icon={solar.alert} size={size} className={className} />;
}

export function InfoGlyph({ size = 22, className }: IconProps) {
  return <Glyph icon={solar.note} size={size} className={className} />;
}

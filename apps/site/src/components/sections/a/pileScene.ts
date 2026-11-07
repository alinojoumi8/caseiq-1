// The numbers the S4 filing scene is built from. Shared by the markup (PileStage) and the motion (PileMotion).

// Scene timing in the pinned mode, as fractions of the pinned scroll (0 to 1).
export const ROW_START = 0.05;
export const ROW_STEP = 0.115;
export const ROW_DUR = 0.14;
export const DUPES_OUT: [number, number] = [0.7, 0.8];
export const GAP_IN: [number, number] = [0.78, 0.86];
export const RECEIPT_IN: [number, number] = [0.86, 0.93];
export const STRIP_EMPTIES: [number, number] = [0.3, 0.8]; // phones: a row's slot in the compact strip empties over this part of the row's scene
export const PIN_VH = 1.1; // pinned scroll distance, in viewport heights
export const PILE_TOP = 44; // where the stage pins, below the status strip

// The camera roll has eight tiles. Six of them are the timeline's sources (row index -> tile number); the other two are
// duplicates that are set aside. When the scene ends every slot is an empty, dashed outline.
export const TILE_FOR_ROW = [4, 2, 3, 1, 6, 5];
export const DUPLICATE_TILES = [7, 8];
export const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
// Each tile's natural size in the roll (px): the big chat shot spans 2x2 cells, the photo spans 2x1, the rest are one cell.
const TILE_SIZE: Record<number, [number, number]> = { 1: [108, 108], 6: [108, 52] };
export const sizeOf = (tile: number): [number, number] => TILE_SIZE[tile] ?? [52, 52];
export const ROW_TILE_W = 72; // phones: a row's tile starts at this width, a full thumbnail
export const STRIP_SLOT = 30; // phones: the compact roll strip's slot size, px
export const SHRINK_FROM = 0.7; // a tile keeps its size for the first 70% of its flight and shrinks to the node only at landing

/** Where across a tile (0 to 1) the strip's slot is centred, for a tile whose picture is not centred on what matters. The posting's title runs from 10% to 51% of its width (x 33 to 166 of the built 324px tile), so 31%. */
const STRIP_FOCUS: Record<number, number> = { 6: 0.307 };

/**
 * Phones: a tile drawn at its natural size and brought into the strip's square slot with one scale, covering it; what spills over is cropped
 * by the slot. (Two scales would squeeze the 2:1 posting.) The slot is centred on the tile, or on the tile's focus where it has one (the
 * posting shows its whole title, and not the button), moved no further than keeps the tile covering the slot.
 */
export function stripFit(tile: number, tw: number, th: number): string {
  const scale = Math.max(STRIP_SLOT / tw, STRIP_SLOT / th);
  const spill = (size: number, focus: number) => Math.min(0, Math.max(STRIP_SLOT - size * scale, STRIP_SLOT / 2 - focus * size * scale));
  return `translate(${spill(tw, STRIP_FOCUS[tile] ?? 0.5)}px, ${spill(th, 0.5)}px) scale(${scale})`;
}

/** Phones: the row whose landing empties a strip slot. The two duplicates are set aside along with the later rows. */
export function stripRow(tile: number): number {
  const row = TILE_FOR_ROW.indexOf(tile);
  if (row >= 0) return row;
  return tile === 7 ? 3 : 4;
}

/** Phones: a row's tile, drawn at its natural size and scaled up to a full thumbnail. Its starting scale and the height of its centre. */
export function rowTileStart(row: number) {
  const [tw, th] = sizeOf(TILE_FOR_ROW[row]);
  const scale = ROW_TILE_W / tw;
  return { tw, th, scale, centreY: (scale * th) / 2 };
}

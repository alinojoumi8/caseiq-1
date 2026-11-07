import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { sheetTargetForClick, sheetTargetForHash, type ClickInfo } from '../src/lib/sheetTrigger';

const plain: ClickInfo = {
  href: '#start',
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
};
const click = (over: Partial<ClickInfo>): ClickInfo => ({ ...plain, ...over });

describe('which clicks open the conversation sheet', () => {
  it('opens for a plain click on each of the four hrefs of this page', () => {
    expect(sheetTargetForClick(click({ href: '#start' }))).toBe('start');
    expect(sheetTargetForClick(click({ href: '/#start' }))).toBe('start');
    expect(sheetTargetForClick(click({ href: '#waitlist' }))).toBe('waitlist');
    expect(sheetTargetForClick(click({ href: '/#waitlist' }))).toBe('waitlist');
  });

  it('leaves a modified click to the browser (new tab, new window, download)', () => {
    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
      expect(sheetTargetForClick(click({ [key]: true }))).toBeNull();
    }
  });

  it('ignores the middle and right buttons', () => {
    expect(sheetTargetForClick(click({ button: 1 }))).toBeNull();
    expect(sheetTargetForClick(click({ button: 2 }))).toBeNull();
  });

  it('ignores a click something else already handled', () => {
    expect(sheetTargetForClick(click({ defaultPrevented: true }))).toBeNull();
  });

  it('ignores links that open elsewhere or download', () => {
    expect(sheetTargetForClick(click({ target: '_blank' }))).toBeNull();
    expect(sheetTargetForClick(click({ target: '_self' }))).toBe('start');
    expect(sheetTargetForClick(click({ download: true }))).toBeNull();
  });

  it('ignores every other link, and links with no href', () => {
    for (const href of ['#limits', '/#limits', '#', '/', '/privacy', 'https://example.com/#start', '#start-h', '/#startx', '']) {
      expect(sheetTargetForClick(click({ href }))).toBeNull();
    }
    expect(sheetTargetForClick(click({ href: null }))).toBeNull();
  });
});

describe('which hashes open the sheet when the page loads', () => {
  it('opens for #start and #waitlist only', () => {
    expect(sheetTargetForHash('#start')).toBe('start');
    expect(sheetTargetForHash('#waitlist')).toBe('waitlist');
    for (const hash of ['', '#', '#limits', '#Start', '#start?x=1']) expect(sheetTargetForHash(hash)).toBeNull();
  });
});

describe('conversation sheet copy', () => {
  it('has the six strings, with typographic apostrophes', () => {
    expect(en.convo).toEqual({
      status: 'A person replies within one business day',
      dialogName: 'Your request to Case IQ',
      chipHint: 'Opens the questions with this answer chosen',
      resume: 'You’re partway through the questions. Pick up where you left off.',
      resumeCta: 'Continue',
      reopen: 'See your answers',
    });
  });

  it('never says chat, live or conversation in the visible copy', () => {
    for (const text of Object.values(en.convo)) expect(text).not.toMatch(/\b(chat|live|conversation)\b/i);
  });
});

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmailText } from '../src/components/world/EmailText';

const html = (text: string, email: string | null) => renderToStaticMarkup(createElement(EmailText, { text, email }));

describe('EmailText', () => {
  it('wraps the address in a mailto link and leaves the rest as text', () => {
    expect(html('Prefer email? Write to caseiq@agentmail.to', 'caseiq@agentmail.to')).toBe(
      'Prefer email? Write to <a class="link" href="mailto:caseiq@agentmail.to">caseiq@agentmail.to</a>',
    );
  });

  it('keeps the full stop after the address outside the link', () => {
    expect(html('Write to caseiq@agentmail.to.', 'caseiq@agentmail.to')).toBe(
      'Write to <a class="link" href="mailto:caseiq@agentmail.to">caseiq@agentmail.to</a>.',
    );
  });

  it('links every copy of the address', () => {
    const out = html('a@b.ca or a@b.ca', 'a@b.ca');
    expect(out.match(/<a /g)).toHaveLength(2);
  });

  it('renders plain text when the address is not in the text', () => {
    expect(html('Your request wasn’t sent. Please try again.', 'caseiq@agentmail.to')).toBe('Your request wasn’t sent. Please try again.');
  });

  it('renders plain text when there is no address', () => {
    expect(html('Write to caseiq@agentmail.to.', null)).toBe('Write to caseiq@agentmail.to.');
  });
});

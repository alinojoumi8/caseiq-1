import { Fragment } from 'react';

/**
 * Text with the contact address made tappable: every copy of `email` in `text` becomes a mailto link, in the running-text link style.
 * With no address, or an address that is not in the text, the text comes back as it is.
 * Server-safe: no state and no effects. Keep it out of anything inside a <label>, where a link breaks the tap target.
 */
export function EmailText({ text, email }: { text: string; email: string | null | undefined }) {
  if (!email || !text.includes(email)) return <>{text}</>;
  const parts = text.split(email);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <a className="link" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

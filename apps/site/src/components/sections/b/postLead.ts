/** POSTs a form to one of the lead routes. Resolves true only when the server says the lead was sent or stored. */
export async function postLead(url: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const body: unknown = await res.json();
    return typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true;
  } catch {
    return false;
  }
}

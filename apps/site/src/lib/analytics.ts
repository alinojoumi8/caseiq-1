// Analytics stub. Logs in development, does nothing in production until a vendor is chosen.
// Never pass personal data in props.

export type TrackEvent =
  | 'chip_select'
  | 'see_page_open'
  | 'cite_open'
  | 'convo_open'
  | 'convo_close'
  | 'intake_start'
  | 'intake_step'
  | 'intake_submit'
  | 'intake_error'
  | 'waitlist_submit'
  | 'quick_exit'
  | 'film_open'
  | 'film_play'
  | 'film_complete'
  | 'film_text'
  | 'film_cta'
  | 'film_error'
  | 'film_described';

export function track(name: TrackEvent, props?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[track]', name, props ?? {});
  }
}

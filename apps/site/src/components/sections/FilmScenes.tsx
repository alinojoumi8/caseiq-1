import { en } from '@/content/en';
import { timelineExamples } from '@/content/examples';
import { PageTag } from '@/components/world/PageTag';
import { QuoteCard } from '@/components/world/QuoteCard';

/** The three rows the film's timeline lands, by their number in the timeline examples (never copied: they are rendered from there). */
const SCENE_ROWS = [1, 3, 4];
const sceneRows = timelineExamples.filter((item) => SCENE_ROWS.includes(item.n));
/** The scene that ends with those rows. */
const ROWS_SCENE = 2;

/**
 * The film as text, scene by scene: the time, what is on screen, and what the voice says. Scene 3 lists the timeline's three rows,
 * drawn from the timeline examples. Plain markup with no state, so the player's text view and the /film-text page (which works
 * with no JavaScript) share it. Each puts its own heading above it and its own way to start below.
 */
export function FilmScenes() {
  return (
    <ol className="film-scenes">
      {en.film.scenes.map((scene, i) => (
        <li key={scene.at} className="film-scene">
          <p className="film-scene__at">{scene.at}</p>
          <p className="film-scene__label">{en.film.onScreen}</p>
          <p className="film-scene__text">{scene.shows}</p>
          {i === ROWS_SCENE ? (
            <ul className="film-rows">
              {sceneRows.map((row) => (
                <li key={row.n}>
                  <time className="film-row__date" dateTime={row.iso}>
                    {row.date}
                  </time>
                  <QuoteCard
                    reference={
                      <>
                        <span>{row.what}</span>
                        <PageTag variant="pill">{row.source}</PageTag>
                      </>
                    }
                    quote={row.quote}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          <p className="film-scene__label">{en.film.voice}</p>
          {scene.says.map((n) => (
            <p key={n} className="film-scene__text">
              {en.film.says[n]}
            </p>
          ))}
        </li>
      ))}
    </ol>
  );
}

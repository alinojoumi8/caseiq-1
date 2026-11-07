// Where the film's text version lives as a page of its own: for visitors without JavaScript, and for anyone whose player code
// did not load. The static export writes every page as name/index.html, so its links end in a slash (as next/link's do there).
import { BUILD_MODE } from './buildMode';

export const FILM_TEXT_HREF = BUILD_MODE === 'herenow' ? '/film-text/' : '/film-text';

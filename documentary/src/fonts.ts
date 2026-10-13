// Fonts are bundled from npm (@fontsource) so rendering needs no network access.
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/caveat/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import {continueRender, delayRender} from 'remotion';

export const SERIF = '"Cormorant Garamond", serif';
export const SANS = 'Inter, sans-serif';
export const HAND = 'Caveat, cursive';
export const MONO = '"IBM Plex Mono", monospace';

export const GOLD = '#d9b77a';
export const INK = '#f3efe6';

// Hold the first frame until every face is loaded, so no frame renders in a fallback font.
const handle = delayRender('Loading fonts');
Promise.all(
	[
		'300 40px "Cormorant Garamond"',
		'400 40px "Cormorant Garamond"',
		'italic 400 40px "Cormorant Garamond"',
		'500 40px "Cormorant Garamond"',
		'300 40px Inter',
		'400 40px Inter',
		'500 40px Inter',
		'600 40px Caveat',
		'400 40px "IBM Plex Mono"',
	].map((f) => document.fonts.load(f)),
)
	.catch(() => undefined)
	.then(() => continueRender(handle));

// Fonts are bundled from npm (@fontsource) so rendering needs no network access.
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import {continueRender, delayRender} from 'remotion';

export const SERIF = '"Cormorant Garamond", serif';
export const SANS = 'Inter, sans-serif';
export const MONO = '"IBM Plex Mono", monospace';

// Same palette as the long-form documentary, so Shorts read as the same channel.
export const BG = '#03040a';
export const INK = '#f3efe6';
export const DIM = 'rgba(243,239,230,0.55)';
export const GOLD = '#d9b77a';
export const CYAN = '#86d3e6';
export const EARTH = '#6fb6ff';

const handle = delayRender('Loading fonts');
Promise.all(
	[
		'italic 400 40px "Cormorant Garamond"',
		'italic 500 40px "Cormorant Garamond"',
		'500 40px "Cormorant Garamond"',
		'300 40px Inter',
		'400 40px Inter',
		'500 40px Inter',
		'600 40px Inter',
		'800 40px Inter',
		'400 40px "IBM Plex Mono"',
		'500 40px "IBM Plex Mono"',
	].map((f) => document.fonts.load(f)),
)
	.catch(() => undefined)
	.then(() => continueRender(handle));

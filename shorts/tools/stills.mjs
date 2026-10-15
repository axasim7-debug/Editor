// Render stills at given times (seconds) after a single bundle: node tools/stills.mjs out/dir 0 1.5 4.2 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...times] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'DrakeShort'});
for (const s of times) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
	const output = path.join(outDir, `t${String(s).padStart(5, '0')}.jpg`);
	await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5});
	console.log(output);
}

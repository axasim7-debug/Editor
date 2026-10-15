import React, {useMemo} from 'react';
import {random} from 'remotion';
import {clamp01, outExpo} from '../lib/ease';
import {CYAN, EARTH, GOLD, MONO} from '../theme';
import {CLIMAX, GALAXY, YAH} from './script';

type Star = {x: number; y: number; r: number; c: string; a: number};

const gauss = (seed: string) => {
	const u = Math.max(1e-6, random(seed + 'u'));
	const v = random(seed + 'v');
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// A two-armed barred spiral drawn from particles (log-spiral arms + bulge + halo).
const makeStars = (n: number, prefix: string, armsOnly = false): Star[] => {
	const out: Star[] = [];
	for (let i = 0; i < n; i++) {
		const s = `${prefix}${i}`;
		const kind = armsOnly ? 1 : random(s + 'k');
		let x: number;
		let y: number;
		if (kind < 0.18) {
			const rr = Math.abs(gauss(s + 'b')) * 80;
			const th = random(s + 'bt') * Math.PI * 2;
			x = Math.cos(th) * rr * 1.25;
			y = Math.sin(th) * rr * 0.8;
		} else if (kind < 0.26) {
			const rr = 120 + random(s + 'hr') * 440;
			const th = random(s + 'ht') * Math.PI * 2;
			x = Math.cos(th) * rr;
			y = Math.sin(th) * rr * 0.92;
		} else {
			const arm = random(s + 'a') < 0.5 ? 0 : Math.PI;
			const u = Math.pow(random(s + 'r'), 0.8);
			const rr = 70 + u * 480;
			const th = arm + Math.log(rr / 70) * 2.35 + gauss(s + 'j') * (0.28 - u * 0.1);
			const spread = gauss(s + 'w') * (14 + u * 26);
			x = Math.cos(th) * rr + Math.cos(th + Math.PI / 2) * spread;
			y = (Math.sin(th) * rr + Math.sin(th + Math.PI / 2) * spread) * 0.92;
		}
		const hot = random(s + 'c');
		const c = hot < 0.12 ? '#9fc4ff' : hot < 0.3 ? '#ffd9a8' : '#ffffff';
		out.push({x, y, r: 0.45 + Math.pow(random(s + 's'), 3) * 1.9, c, a: 0.35 + random(s + 'o') * 0.65});
	}
	return out;
};

const STARS = makeStars(3200, 'g');
// Extra density around the Sun so the opening close-up is rich.
const LOCAL: Star[] = new Array(260).fill(0).map((_, i) => {
	const a = random(`la${i}`) * Math.PI * 2;
	const r = Math.pow(random(`lr${i}`), 0.7) * 110;
	return {x: YAH.x * Math.cos(0.314) - YAH.y * Math.sin(0.314) + Math.cos(a) * r, y: YAH.x * Math.sin(0.314) + YAH.y * Math.cos(0.314) + Math.sin(a) * r, r: 0.4 + Math.pow(random(`ls${i}`), 3) * 1.6, c: random(`lc${i}`) < 0.2 ? '#9fc4ff' : '#fff', a: 0.3 + random(`lo${i}`) * 0.6};
});
// Glowing star-forming knots and blue haze along the arms.
const KNOTS = makeStars(55, 'knot', true).map((k, i) => ({...k, r: 3.5 + random(`kr${i}`) * 6, c: random(`kc${i}`) < 0.6 ? '#ff7fb0' : '#8fb8ff'}));
const HAZE = makeStars(260, 'haze', true).map((k, i) => ({...k, r: 16 + random(`hr${i}`) * 22, c: random(`hc${i}`) < 0.7 ? '#5a7fd6' : '#c9a2ff'}));
const CIVS = makeStars(2000, 'civ', true).map((c, i) => ({...c, t: CLIMAX.reveal + Math.pow(random(`ct${i}`), 2.2) * 1.4}));

export const Galaxy: React.FC<{t: number; z: number; energy: number}> = ({t, z, energy}) => {
	const close = clamp01((z - 2.2) / 2.5); // bokeh when the camera is deep inside
	const civOn = t >= CLIMAX.reveal - 0.05 && t < CLIMAX.diveEnd + 0.3;
	// The galaxy steps back while the civilizations light up, then returns for the dive.
	const recede = clamp01((t - CLIMAX.reveal + 0.1) / 0.4) * (1 - clamp01((t - CLIMAX.dive) / 0.8));
	const civFade = 1 - clamp01((t - CLIMAX.dive) / 1.0);
	const dims = clamp01((t - 1.4) / 0.6) * (1 - clamp01((t - 4.1) / 0.5));
	const yahLabel = clamp01((z - 1.6) / 1.5);
	const stars = useMemo(
		() => [...STARS, ...LOCAL].map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity={s.a} />),
		[],
	);
	const haze = useMemo(() => HAZE.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity={0.22} />), []);
	const knots = useMemo(() => KNOTS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity={0.32} />), []);
	return (
		<g transform={`translate(${GALAXY.x} ${GALAXY.y}) rotate(-18)`}>
			<defs>
				<radialGradient id="core">
					<stop offset="0%" stopColor="#fff4e0" stopOpacity={0.95} />
					<stop offset="18%" stopColor="#f3c98f" stopOpacity={0.55} />
					<stop offset="55%" stopColor="#7d6bb8" stopOpacity={0.12} />
					<stop offset="100%" stopColor="#000" stopOpacity={0} />
				</radialGradient>
				<filter id="gblur" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={6} />
				</filter>
				<filter id="hblur" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={22} />
				</filter>
				<filter id="kblur" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={5} />
				</filter>
				<filter id="cblur" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation={3.5} />
				</filter>
			</defs>
			<ellipse cx={0} cy={0} rx={560} ry={520} fill="url(#core)" opacity={0.5 + energy * 0.15} />
			<g opacity={1 - recede * 0.6}>
				<g filter="url(#hblur)">{haze}</g>
				<g filter="url(#kblur)">{knots}</g>
				<g filter="url(#gblur)" opacity={0.55 + close * 0.35}>{stars}</g>
				<g opacity={1 - close * 0.75}>{stars}</g>
			</g>
			{civOn ? (
				<g opacity={civFade}>
					<g filter="url(#cblur)">
						{CIVS.map((c, i) => {
							const p = clamp01((t - c.t) / 0.5);
							return p > 0 ? <circle key={i} cx={c.x} cy={c.y} r={3.2 + (1 - outExpo(p)) * 10} fill="#5ff2ff" opacity={0.85} /> : null;
						})}
					</g>
					{CIVS.map((c, i) => {
						const p = clamp01((t - c.t) / 0.5);
						return p > 0 ? <circle key={i} cx={c.x} cy={c.y} r={2} fill="#f2feff" /> : null;
					})}
				</g>
			) : null}
			{/* The Sun: "you are here" */}
			<g transform={`rotate(18) translate(${YAH.x} ${YAH.y})`}>
				<circle r={2.2} fill="#fff6dd" />
				<circle r={6} fill={GOLD} opacity={0.35} filter="url(#cblur)" />
				<g opacity={yahLabel}>
					<circle r={34 / z} fill="none" stroke={EARTH} strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.9} />
					<circle r={(34 + 18 * ((t * 0.8) % 1)) / z} fill="none" stroke={EARTH} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.6 * (1 - ((t * 0.8) % 1))} />
					<line x1={34 / z} y1={0} x2={120 / z} y2={0} stroke={EARTH} strokeWidth={1} vectorEffect="non-scaling-stroke" />
					<text x={130 / z} y={8 / z} fontFamily={MONO} fontSize={24 / z} fill={EARTH} letterSpacing={3 / z}>
						YOU ARE HERE
					</text>
				</g>
			</g>
			{/* Blueprint dimension line under the galaxy during the hook */}
			<g transform="rotate(18)" opacity={dims}>
				<line x1={-500} y1={600} x2={500} y2={600} stroke={GOLD} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
				<line x1={-500} y1={585} x2={-500} y2={615} stroke={GOLD} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
				<line x1={500} y1={585} x2={500} y2={615} stroke={GOLD} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
				<text x={0} y={652} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={GOLD} letterSpacing={4}>
					THE MILKY WAY · 100,000 LIGHT-YEARS
				</text>
			</g>
		</g>
	);
};

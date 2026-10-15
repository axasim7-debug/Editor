import {noise2D} from '@remotion/noise';
import React from 'react';
import {random} from 'remotion';
import {clamp01, outExpo, prog} from '../lib/ease';
import {CYAN, EARTH, GOLD, INK, MONO} from '../theme';

// Each illustration is drawn around (0,0), inside a radius of ~260 world units.
// `t` is seconds since the camera landed on the node (negative while it approaches),
// `acc` is the current musical accent (0..1).
export type IllProps = {t: number; acc: number};

const draw = (t: number, start: number, dur: number) => prog(t, start, dur);
const dash = (len: number, p: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - p)});

const StarGlow: React.FC<{r: number; color?: string; id: string; intensity?: number}> = ({r, color = '#ffe2b0', id, intensity = 1}) => (
	<>
		<defs>
			<radialGradient id={id}>
				<stop offset="0%" stopColor="#fff" stopOpacity={1} />
				<stop offset="25%" stopColor={color} stopOpacity={0.9 * intensity} />
				<stop offset="60%" stopColor={color} stopOpacity={0.18 * intensity} />
				<stop offset="100%" stopColor={color} stopOpacity={0} />
			</radialGradient>
		</defs>
		<circle r={r} fill={`url(#${id})`} />
	</>
);

const Spikes: React.FC<{len: number; o: number}> = ({len, o}) => (
	<g opacity={o} stroke="#fff" strokeLinecap="round">
		<line x1={-len} y1={0} x2={len} y2={0} strokeWidth={1.6} />
		<line x1={0} y1={-len} x2={0} y2={len} strokeWidth={1.6} />
		<line x1={-len * 0.35} y1={-len * 0.35} x2={len * 0.35} y2={len * 0.35} strokeWidth={0.8} opacity={0.6} />
		<line x1={len * 0.35} y1={-len * 0.35} x2={-len * 0.35} y2={len * 0.35} strokeWidth={0.8} opacity={0.6} />
	</g>
);

// R* — a stellar nursery where two new stars switch on.
export const Nursery: React.FC<IllProps> = ({t, acc}) => {
	const clouds = [
		{x: -60, y: -30, rx: 190, ry: 120, c: '#7a4fb5', s: 'a'},
		{x: 70, y: 40, rx: 170, ry: 110, c: '#c0607a', s: 'b'},
		{x: 0, y: 90, rx: 150, ry: 80, c: '#3f8fa8', s: 'c'},
		{x: -30, y: -90, rx: 120, ry: 70, c: '#d79a6a', s: 'd'},
	];
	const births = [
		{x: -70, y: -20, at: 0.1},
		{x: 85, y: 55, at: 0.75},
	];
	const appear = draw(t, -0.9, 1.2);
	return (
		<g opacity={appear}>
			<defs>
				<filter id="neb" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation={28} />
				</filter>
			</defs>
			<g filter="url(#neb)">
				{clouds.map((c) => (
					<ellipse
						key={c.s}
						cx={c.x + noise2D(c.s, t * 0.2, 0) * 20}
						cy={c.y + noise2D(c.s, 0, t * 0.2) * 14}
						rx={c.rx}
						ry={c.ry}
						fill={c.c}
						opacity={0.45 + acc * 0.1}
					/>
				))}
			</g>
			{new Array(60).fill(0).map((_, i) => (
				<circle key={i} cx={(random(`nx${i}`) - 0.5) * 460} cy={(random(`ny${i}`) - 0.5) * 320} r={0.6 + random(`nr${i}`) * 1.4} fill="#fff" opacity={0.3 + random(`no${i}`) * 0.5} />
			))}
			{births.map((b, i) => {
				const p = prog(t, b.at, 0.9);
				const flash = Math.exp(-Math.max(0, t - b.at) * 2.2) * (t > b.at ? 1 : 0);
				return (
					<g key={i} transform={`translate(${b.x} ${b.y})`} opacity={p > 0 ? 1 : 0}>
						<g transform={`scale(${0.2 + p * 0.8 + flash * 0.6})`}>
							<StarGlow r={60} id={`birth${i}`} intensity={1 + flash} />
							<Spikes len={70} o={0.5 + flash * 0.5} />
						</g>
						<text x={34} y={-34} fontFamily={MONO} fontSize={26} fill={GOLD} opacity={clamp01((t - b.at - 0.2) * 3)}>
							+1
						</text>
					</g>
				);
			})}
		</g>
	);
};

// f_p — a star with planets on tilted orbits (planets pass behind and in front of the star).
const ORBITS = [
	{rx: 105, ry: 40, sp: 0.9, r: 7, c: '#d9a77a', ph: 0.3},
	{rx: 165, ry: 63, sp: 0.55, r: 11, c: EARTH, ph: 2.1},
	{rx: 235, ry: 90, sp: 0.35, r: 15, c: '#cf9b6d', ph: 4.0},
];
export const Orbits: React.FC<IllProps> = ({t, acc}) => {
	const planets = ORBITS.map((o, i) => {
		const p = draw(t, -0.6 + i * 0.18, 1.0);
		const a = o.ph + t * o.sp;
		return {
			front: Math.sin(a) > 0,
			el: (
				<g key={`p${i}`} transform={`translate(${Math.cos(a) * o.rx} ${Math.sin(a) * o.ry})`} opacity={clamp01(p * 2 - 0.6)}>
					<circle r={o.r * 2.2} fill={o.c} opacity={0.15} />
					<circle r={o.r} fill={o.c} />
					<circle r={o.r} fill="url(#shade)" />
				</g>
			),
		};
	});
	return (
		<g transform="rotate(-14)">
			<defs>
				<radialGradient id="shade" cx="35%" cy="35%">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.45} />
					<stop offset="60%" stopColor="#000" stopOpacity={0} />
					<stop offset="100%" stopColor="#000" stopOpacity={0.55} />
				</radialGradient>
			</defs>
			{ORBITS.map((o, i) => {
				const p = draw(t, -0.6 + i * 0.18, 1.0);
				const len = Math.PI * (o.rx + o.ry) * 1.05;
				return <ellipse key={i} rx={o.rx} ry={o.ry} fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={1.5} vectorEffect="non-scaling-stroke" style={dash(len, p)} />;
			})}
			{planets.filter((p) => !p.front).map((p) => p.el)}
			<g transform={`scale(${1 + acc * 0.06})`}>
				<StarGlow r={70} id="fpstar" />
			</g>
			{planets.filter((p) => p.front).map((p) => p.el)}
		</g>
	);
};

// n_e — top-down system with the habitable zone band; one planet in five sits inside it.
export const Habitable: React.FC<IllProps> = ({t}) => {
	const radii = [62, 100, 160, 205, 245];
	const zone = draw(t, 0.0, 0.9);
	const pick = clamp01((t - 0.5) * 2.5);
	return (
		<g>
			<defs>
				<radialGradient id="hz" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={190}>
					<stop offset="68%" stopColor={CYAN} stopOpacity={0} />
					<stop offset="76%" stopColor={CYAN} stopOpacity={0.28} />
					<stop offset="92%" stopColor={CYAN} stopOpacity={0.28} />
					<stop offset="100%" stopColor={CYAN} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle r={190 * (0.8 + zone * 0.2)} fill="url(#hz)" opacity={zone} />
			{radii.map((r, i) => {
				const p = draw(t, -0.8 + i * 0.1, 1.0);
				const a = random(`hz${i}`) * 6.28 + t * (0.5 / Math.sqrt(r / 60));
				const inZone = i === 2;
				const len = 2 * Math.PI * r;
				return (
					<g key={i}>
						<circle r={r} fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={1} vectorEffect="non-scaling-stroke" style={dash(len, p)} />
						<g transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r})`} opacity={clamp01(p * 2 - 0.8)}>
							<circle r={inZone ? 11 : 8} fill={inZone ? EARTH : '#b9a58c'} opacity={inZone ? 1 : 0.55 + 0.45 * (1 - pick)} />
							{inZone ? (
								<>
									<circle r={11 + 20 * pick} fill="none" stroke={CYAN} strokeWidth={2} vectorEffect="non-scaling-stroke" opacity={pick} />
									<circle r={11 + 26 * pick + 10 * ((t * 1.2) % 1)} fill="none" stroke={CYAN} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={pick * (1 - ((t * 1.2) % 1))} />
								</>
							) : null}
						</g>
					</g>
				);
			})}
			<StarGlow r={52} id="nestar" />
			<text x={0} y={-198} textAnchor="middle" fontFamily={MONO} fontSize={18} letterSpacing={4} fill={CYAN} opacity={zone}>
				HABITABLE ZONE
			</text>
		</g>
	);
};

// Orthographic globe texture from noise: dots where the noise field passes a threshold.
const planetDots = (t: number, seed: string, step: number, thr: number, color: (v: number) => string, alpha: number) => {
	const out: React.ReactNode[] = [];
	for (let y = -140; y <= 140; y += step) {
		for (let x = -140; x <= 140; x += step) {
			const u = x / 140;
			const v = y / 140;
			if (u * u + v * v >= 1) continue;
			const lat = Math.asin(v);
			const lon = Math.asin(u / Math.cos(lat)) + t * 0.12;
			const n = noise2D(seed, Math.cos(lon) * 1.4 + Math.cos(lat) * 0.6, Math.sin(lon) * 1.4 + lat * 1.2);
			if (n > thr) out.push(<circle key={`${x}_${y}`} cx={x} cy={y} r={step * 0.75} fill={color(n)} opacity={alpha} />);
		}
	}
	return out;
};

// f_l — a planet and a magnified first cell.
export const FirstLife: React.FC<IllProps> = ({t, acc}) => {
	const p = draw(t, -0.7, 1.0);
	const lens = draw(t, 0.0, 0.8);
	const L = {x: 105, y: -95, r: 100};
	const cell = new Array(48)
		.fill(0)
		.map((_, i) => {
			const a = (i / 48) * Math.PI * 2;
			const r = 52 + noise2D('cell', Math.cos(a) * 1.3 + t * 0.5, Math.sin(a) * 1.3) * 9;
			return `${i ? 'L' : 'M'} ${L.x + Math.cos(a) * r} ${L.y + Math.sin(a) * r}`;
		})
		.join(' ');
	return (
		<g>
			<defs>
				<radialGradient id="pl" cx="38%" cy="35%">
					<stop offset="0%" stopColor="#8fd0ff" />
					<stop offset="45%" stopColor="#2e6fa8" />
					<stop offset="100%" stopColor="#071a33" />
				</radialGradient>
				<clipPath id="plclip">
					<circle r={140} />
				</clipPath>
				<radialGradient id="term" cx="30%" cy="28%" r="85%">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.12} />
					<stop offset="55%" stopColor="#000" stopOpacity={0} />
					<stop offset="100%" stopColor="#000" stopOpacity={0.85} />
				</radialGradient>
				<filter id="soft">
					<feGaussianBlur stdDeviation={2.5} />
				</filter>
				<filter id="soft2">
					<feGaussianBlur stdDeviation={5} />
				</filter>
				<clipPath id="lensclip">
					<circle cx={L.x} cy={L.y} r={L.r * lens} />
				</clipPath>
			</defs>
			<g opacity={p} transform={`translate(-60 50) scale(${0.9 + p * 0.1})`}>
				<circle r={165} fill={CYAN} opacity={0.07} />
				<circle r={140} fill="url(#pl)" />
				<g clipPath="url(#plclip)">
					<g filter="url(#soft)">{planetDots(t, 'land', 11, 0.12, (v) => (v > 0.38 ? '#a08a5c' : '#3f8a5a'), 0.9)}</g>
					<g filter="url(#soft2)">{planetDots(t * 1.6, 'cloud', 13, 0.3, () => '#ffffff', 0.4)}</g>
					<circle r={140} fill="url(#term)" />
				</g>
				<circle r={141} fill="none" stroke="#bfe8ff" strokeOpacity={0.55} strokeWidth={3} vectorEffect="non-scaling-stroke" />
				<circle r={150} fill="none" stroke={CYAN} strokeOpacity={0.18} strokeWidth={10} vectorEffect="non-scaling-stroke" />
			</g>
			<g opacity={lens}>
				<line x1={10} y1={-10} x2={L.x - L.r * 0.75} y2={L.y + L.r * 0.66} stroke={CYAN} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7} />
				<line x1={20} y1={0} x2={L.x + L.r * 0.1} y2={L.y + L.r} stroke={CYAN} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7} />
				<circle cx={L.x} cy={L.y} r={L.r * lens} fill="#02121a" stroke={CYAN} strokeWidth={2} vectorEffect="non-scaling-stroke" />
				<g clipPath="url(#lensclip)">
					<path d={cell + ' Z'} fill="rgba(120,230,190,0.18)" stroke="#9ff0cf" strokeWidth={2} vectorEffect="non-scaling-stroke" />
					<circle cx={L.x - 8 + noise2D('nu', t * 0.4, 0) * 5} cy={L.y + 4} r={17 + acc * 3} fill="rgba(160,255,210,0.45)" />
					{[0, 1, 2, 3, 4].map((i) => (
						<circle key={i} cx={L.x + Math.cos(i * 1.3 + t) * 30} cy={L.y + Math.sin(i * 1.7 + t * 0.8) * 26} r={4} fill="#c9ffe8" opacity={0.6} />
					))}
				</g>
				<text x={L.x + L.r + 16} y={L.y - L.r + 30} fontFamily={MONO} fontSize={40} fill={CYAN}>
					?
				</text>
			</g>
		</g>
	);
};

// f_i — a neural web lighting up as a signal spreads.
const NEURONS = new Array(28).fill(0).map((_, i) => {
	const a = random(`na${i}`) * Math.PI * 2;
	const r = Math.sqrt(random(`nr${i}`));
	return {x: Math.cos(a) * r * 240, y: Math.sin(a) * r * 175 - 10};
});
const SYNAPSES: [number, number][] = [];
NEURONS.forEach((a, i) =>
	NEURONS.forEach((b, j) => {
		if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 120) SYNAPSES.push([i, j]);
	}),
);
const ORIGIN = NEURONS.reduce((best, n, i) => (n.x < NEURONS[best].x ? i : best), 0);

export const Mind: React.FC<IllProps> = ({t, acc}) => {
	const appear = draw(t, -0.8, 1.0);
	// Signal front spreads from the leftmost neuron at ~260 units/s once we land.
	const front = Math.max(0, (t - 0.05) * 260);
	const d = (i: number) => Math.hypot(NEURONS[i].x - NEURONS[ORIGIN].x, NEURONS[i].y - NEURONS[ORIGIN].y);
	return (
		<g opacity={appear}>
			<ellipse rx={270} ry={200} fill={CYAN} opacity={0.04 + acc * 0.03} />
			{SYNAPSES.map(([i, j], k) => {
				const lit = clamp01((front - Math.max(d(i), d(j))) / 60);
				return (
					<line key={k} x1={NEURONS[i].x} y1={NEURONS[i].y} x2={NEURONS[j].x} y2={NEURONS[j].y} stroke={lit > 0 ? CYAN : INK} strokeOpacity={0.15 + lit * 0.6} strokeWidth={1.2 + lit * 1.6} vectorEffect="non-scaling-stroke" />
				);
			})}
			{SYNAPSES.map(([i, j], k) => {
				const di = d(i);
				const dj = d(j);
				const [s, e] = di < dj ? [i, j] : [j, i];
				const q = clamp01((front - Math.min(di, dj)) / Math.max(1, Math.abs(dj - di)));
				if (q <= 0 || q >= 1) return null;
				return <circle key={`s${k}`} cx={NEURONS[s].x + (NEURONS[e].x - NEURONS[s].x) * q} cy={NEURONS[s].y + (NEURONS[e].y - NEURONS[s].y) * q} r={3.5} fill="#e8fbff" />;
			})}
			{NEURONS.map((n, i) => {
				const lit = clamp01((front - d(i)) / 40);
				const flash = lit > 0 ? Math.exp(-(front - d(i)) / 120) : 0;
				return (
					<g key={i} transform={`translate(${n.x} ${n.y})`}>
						<circle r={14 + flash * 22} fill={CYAN} opacity={0.1 + flash * 0.35 + lit * 0.08} />
						<circle r={7.5} fill={lit > 0 ? '#e8fbff' : INK} opacity={0.35 + lit * 0.65} />
					</g>
				);
			})}
		</g>
	);
};

// f_c — a radio dish broadcasting into space: wavefronts leave the feed along the dish axis.
export const Broadcast: React.FC<IllProps> = ({t, acc}) => {
	const appear = draw(t, -0.8, 1.0);
	const on = clamp01(t * 2);
	const F = {x: -40, y: 10}; // feed point
	const AX = -50; // dish axis, degrees (pointing up-right)
	const waves = new Array(5).fill(0).map((_, i) => (((t * 0.7 + i / 5) % 1) + 1) % 1);
	const arc = (r: number) => {
		const a0 = ((AX - 32) * Math.PI) / 180;
		const a1 = ((AX + 32) * Math.PI) / 180;
		return `M ${F.x + Math.cos(a0) * r} ${F.y + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${F.x + Math.cos(a1) * r} ${F.y + Math.sin(a1) * r}`;
	};
	return (
		<g opacity={appear}>
			{waves.map((w, i) => (
				<path key={i} d={arc(50 + w * 230)} fill="none" stroke={CYAN} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={on * (1 - w) * (0.8 + acc * 0.2)} />
			))}
			<g transform={`translate(${F.x} ${F.y}) rotate(${AX + 90})`}>
				{/* bowl */}
				<path d="M -130 40 Q 0 150 130 40 L 118 52 Q 0 168 -118 52 Z" fill="rgba(243,239,230,0.85)" />
				<path d="M -130 40 Q 0 150 130 40" fill="none" stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
				<ellipse cx={0} cy={40} rx={130} ry={22} fill="rgba(134,211,230,0.12)" stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
				{/* feed struts */}
				<line x1={-90} y1={50} x2={0} y2={-30} stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
				<line x1={90} y1={50} x2={0} y2={-30} stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
				<circle cx={0} cy={-34} r={8} fill={GOLD} />
				<circle cx={0} cy={-34} r={18 + acc * 10} fill={GOLD} opacity={0.3} />
			</g>
			{/* mount */}
			<path d="M -10 120 L -60 230 L 60 230 Z" fill="rgba(243,239,230,0.12)" stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
			<line x1={-200} y1={230} x2={200} y2={230} stroke={INK} strokeOpacity={0.4} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
		</g>
	);
};

// L — a log-scale timeline. The bar grows from our ~100 years of radio to a million years.
export const Lifetime: React.FC<IllProps & {grow: number}> = ({t, grow}) => {
	const appear = draw(t, -0.8, 1.0);
	const X0 = -420;
	const X1 = 420;
	const lg = (y: number) => X0 + ((Math.log10(y) - 1) / 5) * (X1 - X0); // 10 .. 1,000,000 years
	const ticks = [10, 100, 1000, 10_000, 100_000, 1_000_000];
	const value = Math.pow(10, 2 + 4 * grow);
	const tip = lg(value);
	const fmt = (y: number) => (y >= 1_000_000 ? '1M' : y >= 1000 ? `${Math.round(y / 1000)}k` : `${y}`);
	return (
		<g opacity={appear}>
			<line x1={X0} y1={0} x2={X1} y2={0} stroke={INK} strokeOpacity={0.35} strokeWidth={2} vectorEffect="non-scaling-stroke" />
			{ticks.map((y, i) => (
				<g key={y} transform={`translate(${lg(y)} 0)`} opacity={clamp01(t * 3 + 2 - i * 0.25)}>
					<line y1={-14} y2={14} stroke={INK} strokeOpacity={0.6} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
					<text y={58} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={INK} opacity={0.7}>
						{fmt(y)}
					</text>
				</g>
			))}
			<text x={X1} y={100} textAnchor="end" fontFamily={MONO} fontSize={20} letterSpacing={3} fill={INK} opacity={0.45}>
				YEARS · LOG SCALE
			</text>
			<rect x={lg(100)} y={-10} width={Math.max(0, tip - lg(100))} height={20} rx={10} fill={CYAN} opacity={0.85} />
			<rect x={lg(100)} y={-22} width={Math.max(0, tip - lg(100))} height={44} rx={22} fill={CYAN} opacity={0.15} />
			{grow > 0 ? (
				<g transform={`translate(${tip} 0)`}>
					<circle r={16} fill="#e8fbff" />
					<circle r={34} fill={CYAN} opacity={0.3} />
					<text y={-48} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={CYAN}>
						{Math.round(value).toLocaleString('en-US')}
					</text>
				</g>
			) : null}
			<g transform={`translate(${lg(100)} 0)`}>
				<circle r={11} fill={EARTH} />
				<line y1={-18} y2={-120} stroke={EARTH} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
				<text y={-134} textAnchor="middle" fontFamily={MONO} fontSize={24} letterSpacing={3} fill={EARTH}>
					US · ~100 YRS
				</text>
			</g>
		</g>
	);
};

export const ILLUSTRATIONS: Record<string, React.FC<IllProps>> = {R: Nursery, P: Orbits, E: Habitable, LIFE: FirstLife, I: Mind, C: Broadcast};
export {outExpo};

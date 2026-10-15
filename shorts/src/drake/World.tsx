import React from 'react';
import {clamp01, outExpo, prog, travel} from '../lib/ease';
import {CYAN, DIM, GOLD, INK, MONO, SANS, SERIF} from '../theme';
import {Grid} from '../components/Grid';
import {bezier, Cam, Link, linkPath, LINKS} from './camera';
import {Galaxy} from './Galaxy';
import {ILLUSTRATIONS, Lifetime} from './Illustrations';
import {arrival, CLIMAX, EQ, FOCUS, H, STOP, Term, TERMS, TRAVEL_S, W} from './script';

// Light travelling along a link: leads the camera slightly so the network "draws" the route.
export const linkProgress = (l: Link, t: number) => travel(clamp01((t - l.t0) / (TRAVEL_S * 0.88)));

const NS = {vectorEffect: 'non-scaling-stroke' as const};

const Network: React.FC<{t: number; z: number}> = ({t, z}) => {
	const all = clamp01((t - CLIMAX.mapOut) / 0.6) * (1 - clamp01((t - CLIMAX.reveal - 0.6) / 0.8));
	// The route bows out once the answer lands, so nothing crosses the galaxy reveal.
	const gone = clamp01((t - CLIMAX.reveal + 0.1) / 0.35);
	if (gone >= 1) return null;
	return (
		<g opacity={1 - gone}>
			<defs>
				<filter id="lglow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation={4 / z} />
				</filter>
			</defs>
			{LINKS.map((l, i) => {
				const p = linkProgress(l, t);
				const guess = i >= 4;
				const col = guess ? CYAN : GOLD;
				const d = linkPath(l);
				// Next route previewed as a faint dotted line once the current stop is solved.
				const prev = i > 0 ? arrival(LINKS[i - 1].t0) + STOP.chipLand : 0.5;
				const preview = clamp01((t - prev) / 0.5) * (p < 1 ? 1 : 0);
				const head = bezier(l, p);
				const nextL = LINKS[i + 1];
				const old = nextL ? clamp01((t - nextL.t0 - TRAVEL_S) / 0.8) * (1 - all) : 0;
				const moving = p > 0 && p < 1;
				return (
					<g key={i}>
						<path d={d} fill="none" stroke={INK} strokeOpacity={0.22 * preview} strokeWidth={1.5} strokeDasharray="2 10" {...NS} />
						{p > 0 ? (
							<>
								<path d={d} pathLength={1} fill="none" stroke={col} strokeOpacity={(0.35 + all * 0.4) * (1 - old * 0.7)} strokeWidth={5 + all * 4} strokeDasharray={`${p} 1`} filter="url(#lglow)" {...NS} />
								<path d={d} pathLength={1} fill="none" stroke={col} strokeOpacity={0.9 * (1 - old * 0.6)} strokeWidth={2 + all * 1.5} strokeDasharray={`${p} 1`} {...NS} />
							</>
						) : null}
						{moving
							? [0.05, 0.035, 0.02, 0.01, 0].map((k, j) => {
									const q = bezier(l, Math.max(0, p - k));
									return <circle key={j} cx={q.x} cy={q.y} r={(4 + j * 1.6) / z} fill={j === 4 ? '#fff' : col} opacity={0.15 + j * 0.2} />;
								})
							: null}
						{moving ? <circle cx={head.x} cy={head.y} r={22 / z} fill={col} opacity={0.35} filter="url(#lglow)" /> : null}
					</g>
				);
			})}
		</g>
	);
};

// Reveal helper for SVG text lines: rise + fade, landing on time `at`.
const rise = (t: number, at: number) => {
	const p = prog(t, at, 0.55);
	return {opacity: p, transform: `translate(0px, ${(1 - p) * 26}px)`};
};

const Tag: React.FC<{measured: boolean; y: number}> = ({measured, y}) => {
	const label = measured ? 'MEASURED' : 'GUESS';
	const w = measured ? 196 : 140;
	const col = measured ? GOLD : CYAN;
	return (
		<g transform={`translate(0 ${y})`}>
			<rect x={-w / 2} y={-24} width={w} height={44} rx={22} fill={measured ? 'rgba(217,183,122,0.12)' : 'rgba(134,211,230,0.08)'} stroke={col} strokeWidth={1.5} strokeDasharray={measured ? undefined : '6 5'} {...NS} />
			<text y={7} textAnchor="middle" fontFamily={MONO} fontSize={21} letterSpacing={4} fill={col}>
				{label}
			</text>
		</g>
	);
};

export const VALUE_Y = 548;

const TermNode: React.FC<{term: Term; idx: number; t: number; z: number; acc: number; inView: boolean}> = ({term, idx, t, z, acc, inView}) => {
	const a = arrival(term.pulse);
	const link = LINKS[idx + 1];
	const appear = outExpo(clamp01((linkProgress(link, t) - 0.45) / 0.45));
	if (appear <= 0 || !inView) return null;
	const next = TERMS[idx + 1];
	const leave = next ? clamp01((t - next.pulse - 0.2) / 0.6) : 0;
	const map = clamp01((t - CLIMAX.mapOut) / 0.5);
	const opacity = appear * (1 - leave * 0.55 * (1 - map));
	const textOn = 1 - leave * (1 - map);
	const col = term.measured ? GOLD : CYAN;
	const lt = t - a;
	const Ill = ILLUSTRATIONS[term.id];
	const isL = term.id === 'L';
	const grow = isL ? travel(clamp01((t - CLIMAX.countStart) / (CLIMAX.countEnd - CLIMAX.countStart))) : 0;
	const ty = isL ? 200 : 330;
	return (
		<g transform={`translate(${term.x} ${term.y})`} opacity={opacity}>
			{isL ? null : (
				<g transform={`scale(${0.92 + appear * 0.08})`}>
					<circle r={292} fill="rgba(3,4,10,0.97)" />
					<circle r={292} fill="none" stroke={col} strokeOpacity={0.55} strokeWidth={1.5} {...NS} />
					<circle r={306} fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={1} strokeDasharray="1 7" {...NS} />
					{new Array(60).fill(0).map((_, i) => {
						const ang = (i / 60) * Math.PI * 2 + lt * 0.02;
						const long = i % 5 === 0;
						return <line key={i} x1={Math.cos(ang) * 292} y1={Math.sin(ang) * 292} x2={Math.cos(ang) * (long ? 276 : 284)} y2={Math.sin(ang) * (long ? 276 : 284)} stroke={col} strokeOpacity={long ? 0.7 : 0.35} strokeWidth={1} {...NS} />;
					})}
					<text x={-292} y={-318} fontFamily={MONO} fontSize={22} letterSpacing={4} fill={DIM}>
						{`TERM ${String(idx + 1).padStart(2, '0')} / 07`}
					</text>
					<g clipPath={`url(#disc${term.id})`}>
						<clipPath id={`disc${term.id}`}>
							<circle r={288} />
						</clipPath>
						<Ill t={lt} acc={acc} />
					</g>
				</g>
			)}
			{isL ? (
				<>
					<text x={-420} y={-210} fontFamily={MONO} fontSize={22} letterSpacing={4} fill={DIM}>
						TERM 07 / 07
					</text>
					<Lifetime t={lt} acc={acc} grow={grow} />
				</>
			) : null}
			<g opacity={textOn}>
			<g style={rise(t, a + STOP.label - 0.15)}>
				<Tag measured={term.measured} y={ty + 18} />
			</g>
			<text y={ty + 96} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={36} letterSpacing={3} fill={INK} style={rise(t, a + STOP.label)}>
				{term.label.toUpperCase()}
			</text>
			<text y={ty + 218} textAnchor="middle" fill={col} style={rise(t, a + STOP.value)}>
				<tspan fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={128}>
					{term.sym}
				</tspan>
				{term.sub ? (
					<tspan fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={66} dy={24}>
						{term.sub}
					</tspan>
				) : null}
				<tspan fontFamily={MONO} fontWeight={500} fontSize={isL ? 72 : 88} fill={INK} dx={28} dy={term.sub ? -24 : 0}>
					{term.value}
				</tspan>
			</text>
			<text y={ty + 286} textAnchor="middle" fontFamily={SANS} fontWeight={300} fontSize={34} fill={DIM} style={rise(t, a + STOP.value + 0.3)}>
				{term.note}
			</text>
			</g>
		</g>
	);
};

const EQ_TERMS: {s: string; sub?: string; m: boolean}[] = [
	{s: 'R', sub: '*', m: true},
	{s: 'f', sub: 'p', m: true},
	{s: 'n', sub: 'e', m: true},
	{s: 'f', sub: 'l', m: false},
	{s: 'f', sub: 'i', m: false},
	{s: 'f', sub: 'c', m: false},
	{s: 'L', m: false},
];

const Equation: React.FC<{t: number; inView: boolean}> = ({t, inView}) => {
	const appear = outExpo(clamp01((linkProgress(LINKS[0], t) - 0.45) / 0.45));
	if (appear <= 0 || !inView) return null;
	const a = arrival(EQ.pulse);
	const leave = clamp01((t - TERMS[0].pulse - 0.2) / 0.6) * (1 - clamp01((t - CLIMAX.mapOut) / 0.5));
	const STEP = 100;
	const x0 = -((EQ_TERMS.length - 1) * STEP) / 2 + 75;
	return (
		<g transform={`translate(${EQ.x} ${EQ.y})`} opacity={appear * (1 - leave * 0.55)}>
			<rect x={-470} y={-250} width={940} height={500} rx={28} fill="rgba(3,4,10,0.9)" stroke={GOLD} strokeOpacity={0.45} strokeWidth={1.5} {...NS} />
			{[
				[-470, -250, 1, 1],
				[470, -250, -1, 1],
				[-470, 250, 1, -1],
				[470, 250, -1, -1],
			].map(([x, y, sx, sy], i) => (
				<path key={i} d={`M ${x + sx * 40} ${y - sy * 14} L ${x - sx * 14} ${y - sy * 14} L ${x - sx * 14} ${y + sy * 40}`} fill="none" stroke={GOLD} strokeWidth={2} {...NS} />
			))}
			<text y={-160} textAnchor="middle" fontFamily={MONO} fontSize={26} letterSpacing={6} fill={GOLD} style={rise(t, a - 0.5)}>
				THE DRAKE EQUATION · 1961
			</text>
			<text x={x0 - 140} y={38} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={104} fill={INK} style={rise(t, a - 0.3)}>
				N =
			</text>
			{EQ_TERMS.map((q, i) => {
				const lit = prog(t, a + 0.15 + i * 0.24, 0.5);
				const col = q.m ? GOLD : CYAN;
				return (
					<g key={i} transform={`translate(${x0 + i * STEP} 0)`}>
					<g style={rise(t, a - 0.25 + i * 0.05)}>
						<text y={40} textAnchor="middle" fill={lit > 0.5 ? col : INK}>
							<tspan fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={100}>
								{q.s}
							</tspan>
							{q.sub ? (
								<tspan fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={52} dy={18}>
									{q.sub}
								</tspan>
							) : null}
						</text>
						<line x1={-38} x2={38} y1={84} y2={84} stroke={col} strokeWidth={3} opacity={lit} {...NS} />
						{i < EQ_TERMS.length - 1 ? <circle cx={STEP / 2} cy={8} r={5} fill={INK} opacity={0.6} /> : null}
					</g>
					</g>
				);
			})}
			<g style={rise(t, a + 1.9)}>
				<circle cx={-200} cy={168} r={8} fill={GOLD} />
				<text x={-180} y={177} fontFamily={MONO} fontSize={24} letterSpacing={3} fill={GOLD}>
					MEASURED
				</text>
				<circle cx={60} cy={168} r={8} fill="none" stroke={CYAN} strokeWidth={2} {...NS} />
				<text x={80} y={177} fontFamily={MONO} fontSize={24} letterSpacing={3} fill={CYAN}>
					GUESSED
				</text>
			</g>
		</g>
	);
};

export const World: React.FC<{cam: Cam; t: number; acc: number; energy: number}> = ({cam, t, acc, energy}) => {
	const halfW = (Math.hypot(W, H) / 2) / cam.z;
	const cx = cam.x + (W / 2 - FOCUS.x) / cam.z;
	const cy = cam.y + (H / 2 - FOCUS.y) / cam.z;
	const visible = (x: number, y: number, r: number) => Math.abs(x - cx) < halfW + r && Math.abs(y - cy) < halfW + r;
	const fog = clamp01((t - TERMS[3].pulse) / 1.5) * (1 - clamp01((t - CLIMAX.mapOut) / 1));
	return (
		<svg width={1} height={1} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
			<Grid cam={cam} fog={fog} />
			<Network t={t} z={cam.z} />
			{visible(0, 0, 700) ? <Galaxy t={t} z={cam.z} energy={energy} /> : null}
			<Equation t={t} inView={visible(EQ.x, EQ.y, 600)} />
			{TERMS.map((term, i) => (
				<TermNode key={term.id} term={term} idx={i} t={t} z={cam.z} acc={acc} inView={visible(term.x, term.y, 700)} />
			))}
		</svg>
	);
};

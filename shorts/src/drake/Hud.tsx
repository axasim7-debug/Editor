import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Words} from '../components/Kinetic';
import {clamp01, inOut, lerp, outExpo, prog, travel} from '../lib/ease';
import {CYAN, DIM, EARTH, GOLD, INK, MONO, SANS, SERIF} from '../theme';
import {Cam, worldToScreen} from './camera';
import {arrival, CLIMAX, STOP, TERMS} from './script';
import {VALUE_Y} from './World';

const HUD = {x: 540, y: 262};

// Running value of N after each factor lands; the last factor (L) is counted up live.
const stepsAt = TERMS.slice(0, -1).map((term, i) => ({
	t: arrival(term.pulse) + STOP.chipLand,
	v: TERMS.slice(0, i + 1).reduce((p, q) => p * q.factor, 1),
}));
const PRE_L = stepsAt[stepsAt.length - 1].v;
const FINAL = PRE_L * TERMS[TERMS.length - 1].factor;

export const nAt = (t: number): number | null => {
	if (t < stepsAt[0].t) return null;
	if (t >= CLIMAX.countStart) {
		const p = travel(clamp01((t - CLIMAX.countStart) / (CLIMAX.countEnd - CLIMAX.countStart)));
		return Math.exp(lerp(Math.log(PRE_L), Math.log(FINAL), p));
	}
	let v = stepsAt[0].v;
	let prev = v;
	for (const s of stepsAt) {
		if (t >= s.t) {
			prev = v;
			v = s.v;
			const p = outExpo(clamp01((t - s.t) / 0.45));
			if (p < 1) return Math.exp(lerp(Math.log(prev), Math.log(v), p));
		}
	}
	return v;
};

export const fmtN = (v: number) => {
	if (v >= 100) return Math.round(v).toLocaleString('en-US');
	if (v >= 10) return v.toFixed(0);
	if (v >= 1) return (Math.round(v * 10) / 10).toString();
	const digits = Math.max(1, Math.ceil(-Math.log10(v)));
	return v.toFixed(digits);
};

// Time since the most recent update of N (for the landing pulse).
const sinceUpdate = (t: number) => {
	let last = -10;
	for (const s of stepsAt) if (t >= s.t) last = s.t;
	return t - last;
};

export const Hud: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
	const n = nAt(t);
	const show = prog(t, arrival(TERMS[0].pulse) - 0.2, 0.6);
	const guessy = t >= stepsAt[3].t; // after f_l lands, N includes guesses
	const toResult = inOut(clamp01((t - (CLIMAX.reveal - 0.1)) / 0.6));
	const out = clamp01((t - CLIMAX.dive) / 0.45);
	const pulse = Math.exp(-sinceUpdate(t) * 5);
	const counting = t >= CLIMAX.countStart && t < CLIMAX.countEnd + 0.2;

	// Flying multiplier chips, from the node's value to the HUD.
	const chips = TERMS.slice(0, -1).map((term, i) => {
		const a = arrival(term.pulse);
		const p = clamp01((t - a - STOP.chipFly) / (STOP.chipLand - STOP.chipFly));
		if (p <= 0 || p >= 1) return null;
		const from = worldToScreen(cam, {x: term.x, y: term.y + VALUE_Y - 30});
		const e = travel(p);
		const x = lerp(from.x, HUD.x, e) + Math.sin(e * Math.PI) * (term.x < 0 ? -120 : 120);
		const y = lerp(from.y, HUD.y + 40, e);
		const col = term.measured ? GOLD : CYAN;
		return (
			<div
				key={i}
				style={{
					position: 'absolute',
					left: x,
					top: y,
					transform: `translate(-50%, -50%) scale(${lerp(1.1, 0.7, e)})`,
					padding: '10px 26px',
					borderRadius: 40,
					border: `2px solid ${col}`,
					background: 'rgba(3,4,10,0.85)',
					boxShadow: `0 0 40px ${col}66`,
					fontFamily: MONO,
					fontSize: 46,
					color: col,
					opacity: Math.min(1, p * 6) * (1 - clamp01((p - 0.85) / 0.15)),
					whiteSpace: 'nowrap',
				}}
			>
				{term.chip}
			</div>
		);
	});

	if (n === null && show <= 0) return null;
	const size = lerp(104, 210, toResult);
	const y = lerp(HUD.y, 420, toResult);
	const col = toResult > 0.5 ? CYAN : guessy ? CYAN : GOLD;
	return (
		<AbsoluteFill style={{opacity: 1 - out, transform: `translateY(${-out * 40}px)`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 470, opacity: show * (1 - toResult), background: 'linear-gradient(rgba(3,4,10,0.85), rgba(3,4,10,0.55) 60%, rgba(3,4,10,0))'}} />
			{chips}
			<div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.62 - 64 - toResult * 30, textAlign: 'center', opacity: show * (1 - toResult), fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: DIM}}>
				CIVILIZATIONS IN OUR GALAXY
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: y - size * 0.62,
					textAlign: 'center',
					opacity: show,
					fontFamily: toResult > 0.01 ? SANS : MONO,
					fontWeight: toResult > 0.01 ? 800 : 500,
					fontSize: size,
					letterSpacing: toResult > 0.01 ? -4 : 0,
					lineHeight: 1.1,
					color: INK,
					transform: `scale(${1 + pulse * 0.08 + (counting ? 0.04 : 0)})`,
					textShadow: `0 0 ${30 + pulse * 50 + toResult * 40}px ${col}${toResult > 0 ? 'aa' : '66'}`,
				}}
			>
				{toResult > 0.01 ? (
					<>
						<span style={{color: CYAN, fontWeight: 300}}>≈ </span>
						{fmtN(n ?? FINAL)}
					</>
				) : (
					<>
						<span style={{color: col}}>N = </span>
						{n === null ? '?' : fmtN(n)}
					</>
				)}
			</div>
			{toResult > 0 ? (
				<>
					<Words
						t={t}
						start={CLIMAX.reveal + 0.25}
						text="alien civilizations in our galaxy"
						style={{position: 'absolute', left: 60, right: 60, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 50, color: INK, textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}
					/>
					<Words
						t={t}
						start={CLIMAX.reveal + 0.9}
						text="(with hopeful guesses)"
						style={{position: 'absolute', left: 60, right: 60, top: 632, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: DIM}}
					/>
				</>
			) : null}
		</AbsoluteFill>
	);
};

// The hook (frame 0) and the closing question share one layout so the loop reads as one thought.
const block: React.CSSProperties = {position: 'absolute', left: 64, right: 64, top: 236, textAlign: 'center', textShadow: '0 6px 40px rgba(0,0,0,0.95)'};
const big: React.CSSProperties = {fontFamily: SANS, fontWeight: 800, fontSize: 88, lineHeight: 1.05, letterSpacing: -2, color: INK};
const accent: React.CSSProperties = {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 128, lineHeight: 1.0, color: GOLD};

export const HookAndQuestion: React.FC<{t: number}> = ({t}) => {
	const hookEnd = 3.75;
	const q0 = CLIMAX.dive + 0.35;
	return (
		<AbsoluteFill>
			{t < hookEnd + 0.5 ? (
				<div style={block}>
					<Words t={t} start={0} instant end={hookEnd} text="How many alien" style={big} />
					<Words t={t} start={0} instant end={hookEnd} text="civilizations share" style={big} />
					<Words t={t} start={0} instant end={hookEnd} text="our galaxy?" style={{...accent, marginTop: 8}} />
					<Words t={t} start={1.25} end={hookEnd} stagger={0.12} text="LET'S DO THE MATH" style={{marginTop: 34, fontFamily: MONO, fontSize: 36, letterSpacing: 8, color: CYAN}} />
				</div>
			) : null}
			{t >= q0 - 0.1 ? (
				<div style={block}>
					<Words t={t} start={q0} stagger={0.07} text="So why haven't we" style={big} />
					<Words t={t} start={q0 + 0.25} stagger={0.07} text="heard from a" style={big} />
					<Words t={t} start={q0 + 0.5} text="single one?" style={{...accent, marginTop: 8}} />
					<Words t={t} start={q0 + 0.95} stagger={0.1} text="THE FERMI PARADOX" style={{marginTop: 34, fontFamily: MONO, fontSize: 36, letterSpacing: 8, color: EARTH}} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

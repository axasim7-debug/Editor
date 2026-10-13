import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {GOLD, INK, MONO, SANS, SERIF} from '../fonts';
import {makeStars, Nebula, StarLayer, starColor} from './Starfield';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// The SETI haystack: a vast ocean, and the speck that has been searched so far.
export const OceanAnalogy: React.FC<{durationInFrames: number}> = ({durationInFrames: D}) => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [D * 0.15, D * 0.85], [1, 9], {...clamp});
	const t1 = interpolate(frame, [10, 40, D * 0.38, D * 0.45], [0, 1, 1, 0], clamp);
	const t2 = interpolate(frame, [D * 0.45, D * 0.52, D * 0.7, D * 0.75], [0, 1, 1, 0], clamp);
	const t3 = interpolate(frame, [D * 0.75, D * 0.82], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #021226 0%, #04345a 55%, #0a5a7d 100%)'}}>
			{new Array(40).fill(0).map((_, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -200,
						right: -200,
						top: 120 + i * 26,
						height: 2,
						background: `rgba(160,220,255,${0.04 + 0.04 * Math.sin(i + frame * 0.03)})`,
						transform: `translateX(${Math.sin(frame * 0.02 + i) * 60}px)`,
					}}
				/>
			))}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{transform: `scale(${zoom})`, width: 14, height: 14, borderRadius: 7, background: '#fff6d0', boxShadow: '0 0 20px 6px rgba(255,240,190,0.8)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170, color: INK, textAlign: 'center'}}>
				<div style={{position: 'absolute', bottom: 170, opacity: t1, fontFamily: SERIF, fontSize: 56}}>The cosmic haystack: all of Earth's oceans</div>
				<div style={{position: 'absolute', bottom: 170, opacity: t2, fontFamily: SERIF, fontSize: 56}}>Searched by 2010: about one glass of water</div>
				<div style={{position: 'absolute', bottom: 170, opacity: t3, fontFamily: SERIF, fontSize: 56}}>Searched by 2018: about one hot tub</div>
				<div style={{position: 'absolute', bottom: 120, opacity: Math.max(t2, t3), fontFamily: SANS, fontSize: 20, letterSpacing: 5, color: GOLD}}>
					{t3 > 0 ? 'WRIGHT, KANODIA & LUBAR · 2018' : 'JILL TARTER'}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// Silent hunters: civilizations light up, and some are quickly extinguished.
export const DarkForest: React.FC<{durationInFrames: number}> = ({durationInFrames: D}) => {
	const frame = useCurrentFrame();
	const lights = useMemo(
		() =>
			new Array(14).fill(0).map((_, i) => ({
				x: 200 + random(`fx${i}`) * 1520,
				y: 120 + random(`fy${i}`) * 700,
				on: random(`fo${i}`) * D * 0.7,
				killed: random(`fk${i}`) < 0.6,
				life: 60 + random(`fl${i}`) * 90,
			})),
		[D],
	);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 120%, #0b1410 0%, #020403 60%)'}}>
			<StarLayer seed="forest" count={600} opacity={0.45} driftX={-0.02} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{lights.map((l, i) => {
					if (frame < l.on) return null;
					const age = frame - l.on;
					const dead = l.killed && age > l.life;
					const flare = interpolate(age, [0, 20], [0, 1], clamp);
					const fade = dead ? interpolate(age - l.life, [0, 10], [1, 0], clamp) : 1;
					const strike = l.killed ? interpolate(age, [l.life - 18, l.life], [0, 1], clamp) : 0;
					return (
						<g key={i}>
							{strike > 0 && strike < 1 ? (
								<line x1={l.x - 900 * (1 - strike)} y1={l.y - 500 * (1 - strike)} x2={l.x} y2={l.y} stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
							) : null}
							<circle cx={l.x} cy={l.y} r={4 + 10 * flare} fill={`rgba(120,255,200,${0.25 * fade * flare})`} />
							<circle cx={l.x} cy={l.y} r={3} fill={`rgba(200,255,230,${fade})`} />
							{dead ? <circle cx={l.x} cy={l.y} r={(age - l.life) * 3} fill="none" stroke={`rgba(255,255,255,${0.4 * fade})`} /> : null}
						</g>
					);
				})}
				{/* treeline silhouette */}
				<path
					d={
						'M0 1080 L0 930 ' +
						new Array(48)
							.fill(0)
							.map((_, i) => `L${i * 40 + 20} ${860 - random(`tr${i}`) * 140} L${i * 40 + 40} ${940 - random(`tb${i}`) * 30}`)
							.join(' ') +
						' L1920 1080 Z'
					}
					fill="#010201"
				/>
			</svg>
		</AbsoluteFill>
	);
};

// Reality as computation: stars quantize onto a grid while faint digits scroll.
export const DigitalUniverse: React.FC<{durationInFrames: number}> = ({durationInFrames: D}) => {
	const frame = useCurrentFrame();
	const stars = useMemo(() => makeStars('digi', 700, 1920, 1080), []);
	const q = interpolate(frame, [D * 0.15, D * 0.6], [0, 1], clamp);
	const cell = 24;
	return (
		<AbsoluteFill style={{backgroundColor: '#02040a'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{new Array(Math.ceil(1920 / cell)).fill(0).map((_, i) => (
					<line key={`v${i}`} x1={i * cell} y1={0} x2={i * cell} y2={1080} stroke="rgba(90,170,255,0.08)" strokeOpacity={q} />
				))}
				{new Array(Math.ceil(1080 / cell)).fill(0).map((_, i) => (
					<line key={`h${i}`} x1={0} y1={i * cell} x2={1920} y2={i * cell} stroke="rgba(90,170,255,0.08)" strokeOpacity={q} />
				))}
				{stars.map((s, i) => {
					const gx = Math.round(s.x / cell) * cell;
					const gy = Math.round(s.y / cell) * cell;
					const x = s.x + (gx - s.x) * q;
					const y = s.y + (gy - s.y) * q;
					const size = s.r * 2 * (1 - q) + 5 * q;
					return <rect key={i} x={x - size / 2} y={y - size / 2} width={size} height={size} fill={starColor(s.hue, s.a)} rx={(1 - q) * size} />;
				})}
				<rect x={0} y={((frame * 6) % 1300) - 110} width={1920} height={3} fill="rgba(120,200,255,0.25)" />
			</svg>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					fontFamily: MONO,
					fontSize: 18,
					lineHeight: '24px',
					color: `rgba(120,200,255,${0.1 * q})`,
					whiteSpace: 'pre',
					overflow: 'hidden',
					transform: `translateY(${-(frame * 2) % 24}px)`,
				}}
			>
				{new Array(48)
					.fill(0)
					.map((_, r) => new Array(150).fill(0).map((__, c) => (random(`d${r}-${c}-${Math.floor((frame + r * 7) / 10)}`) > 0.5 ? '1' : '0')).join(''))
					.join('\n')}
			</div>
		</AbsoluteFill>
	);
};

// Endosymbiosis: a large cell engulfs a bacterium, which becomes a mitochondrion.
export const CellMerger: React.FC<{durationInFrames: number}> = ({durationInFrames: D}) => {
	const frame = useCurrentFrame();
	const blob = (cx: number, cy: number, r: number, wob: number, seed: number) => {
		const pts = 64;
		let d = '';
		for (let i = 0; i <= pts; i++) {
			const a = (i / pts) * Math.PI * 2;
			const rr = r + wob * (Math.sin(a * 3 + frame * 0.03 + seed) + 0.6 * Math.sin(a * 5 - frame * 0.02 + seed * 2));
			d += `${i === 0 ? 'M' : 'L'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
		}
		return d + 'Z';
	};
	const approach = interpolate(frame, [D * 0.1, D * 0.55], [0, 1], clamp);
	const inside = interpolate(frame, [D * 0.55, D * 0.8], [0, 1], clamp);
	const bx = interpolate(approach, [0, 1], [1650, 1140]) + interpolate(inside, [0, 1], [0, -80]);
	const by = interpolate(approach, [0, 1], [260, 470]) + interpolate(inside, [0, 1], [0, 90]);
	const zoom = interpolate(frame, [0, D], [1, 1.1]);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #0c1a1a 0%, #010404 75%)', transform: `scale(${zoom})`}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<defs>
					<radialGradient id="cyto">
						<stop offset="0%" stopColor="rgba(120,220,200,0.10)" />
						<stop offset="85%" stopColor="rgba(120,220,200,0.18)" />
						<stop offset="100%" stopColor="rgba(160,255,230,0.55)" />
					</radialGradient>
				</defs>
				{new Array(60).fill(0).map((_, i) => (
					<circle
						key={i}
						cx={random(`p${i}`) * 1920 + Math.sin(frame * 0.01 + i) * 20}
						cy={random(`q${i}`) * 1080 + Math.cos(frame * 0.012 + i) * 20}
						r={1 + random(`s${i}`) * 2.5}
						fill="rgba(170,255,230,0.12)"
					/>
				))}
				<path d={blob(900, 560, 330 + 25 * approach, 14, 1)} fill="url(#cyto)" stroke="rgba(170,255,230,0.6)" strokeWidth={3} />
				<circle cx={860} cy={560} r={95} fill="rgba(140,170,255,0.18)" stroke="rgba(170,190,255,0.5)" strokeWidth={2} />
				<circle cx={880} cy={545} r={28} fill="rgba(170,190,255,0.25)" />
				<g transform={`translate(${bx} ${by}) rotate(${frame * 0.3})`}>
					<rect x={-70} y={-28} width={140} height={56} rx={28} fill="rgba(255,190,120,0.25)" stroke="rgba(255,200,140,0.8)" strokeWidth={2.5} />
					<path d="M-50 0 Q-25 -18 0 0 T50 0" stroke="rgba(255,210,160,0.7)" strokeWidth={2} fill="none" />
				</g>
			</svg>
			<div style={{position: 'absolute', left: 150, bottom: 120, fontFamily: SANS, fontSize: 20, letterSpacing: 5, color: GOLD, opacity: interpolate(frame, [D * 0.8, D * 0.88], [0, 1], clamp)}}>
				THE FIRST COMPLEX CELL · ~2 BILLION YEARS AGO
			</div>
		</AbsoluteFill>
	);
};

// An asteroid streaks toward Earth; a flash and a shockwave at impact.
export const AsteroidImpact: React.FC<{durationInFrames: number}> = ({durationInFrames: D}) => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [0, D * 0.62], [0, 1], clamp);
	const hit = D * 0.62;
	const ex = 1040;
	const ey = 610;
	const ax = interpolate(t, [0, 1], [1850, ex - 120]);
	const ay = interpolate(t, [0, 1], [90, ey - 230]);
	const flash = interpolate(frame, [hit, hit + 6, hit + 60], [0, 1, 0], clamp);
	const ring = interpolate(frame, [hit, hit + 90], [0, 1], clamp);
	return (
		<AbsoluteFill style={{backgroundColor: '#010207'}}>
			<StarLayer seed="impact" count={500} opacity={0.6} driftX={-0.02} />
			<Img
				src={staticFile('images/earth_blue_marble.jpg')}
				style={{position: 'absolute', left: ex - 520, top: ey - 520, width: 1040, height: 1040, borderRadius: 520, objectFit: 'cover'}}
			/>
			<AbsoluteFill style={{background: `radial-gradient(circle at ${ex - 120}px ${ey - 230}px, rgba(255,240,200,${flash}) 0%, rgba(255,140,60,${0.6 * flash}) 12%, rgba(0,0,0,0) 40%)`}} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{frame < hit ? (
					<>
						<line x1={ax} y1={ay} x2={ax + 260} y2={ay - 170} stroke="rgba(255,190,120,0.55)" strokeWidth={10} strokeLinecap="round" />
						<line x1={ax} y1={ay} x2={ax + 140} y2={ay - 92} stroke="rgba(255,240,210,0.9)" strokeWidth={4} strokeLinecap="round" />
						<circle cx={ax} cy={ay} r={9} fill="#fff1d6" />
					</>
				) : (
					<circle cx={ex - 120} cy={ey - 230} r={20 + ring * 360} fill="none" stroke={`rgba(255,200,150,${0.6 * (1 - ring)})`} strokeWidth={6} />
				)}
			</svg>
			<div style={{position: 'absolute', left: 150, bottom: 120, fontFamily: SANS, fontSize: 20, letterSpacing: 5, color: GOLD, opacity: interpolate(frame, [hit + 30, hit + 60], [0, 1], clamp)}}>
				CHICXULUB · 66 MILLION YEARS AGO
			</div>
		</AbsoluteFill>
	);
};

// Opening/closing title backdrop.
export const TitleBackdrop: React.FC<{durationInFrames: number}> = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: '#010207'}}>
			<Nebula hueA="rgba(60,80,170,0.35)" hueB="rgba(120,60,140,0.25)" />
			<AbsoluteFill style={{transform: `scale(${1 + frame * 0.0003})`}}>
				<StarLayer seed="title" count={1100} driftX={0} />
			</AbsoluteFill>
			<div style={{position: 'absolute', inset: 0, fontFamily: SERIF, color: INK}} />
		</AbsoluteFill>
	);
};

import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {GOLD, SANS} from '../fonts';
import {StarLayer} from './Starfield';

type P = {x: number; y: number; z: number; r: number; a: number; arrive: number; parent: number};

const N = 3200;
const CX = 960;
const CY = 540;

// A two-armed spiral galaxy; every star gets an "arrival time" for an expanding
// wave of settlement that starts from one star in the outer disk.
const buildGalaxy = (): P[] => {
	const pts: P[] = [];
	for (let i = 0; i < N; i++) {
		const core = random(`gc${i}`) < 0.22;
		let x: number;
		let y: number;
		if (core) {
			const rr = Math.pow(random(`gr${i}`), 2) * 140;
			const th = random(`gt${i}`) * Math.PI * 2;
			x = rr * Math.cos(th);
			y = rr * Math.sin(th);
		} else {
			const arm = random(`ga${i}`) < 0.5 ? 0 : Math.PI;
			const t = 0.15 + random(`gl${i}`) * 1.0;
			const rr = 70 + t * 640;
			const th = arm + Math.log(rr / 60) * 2.2 + (random(`gs${i}`) - 0.5) * 0.9;
			x = rr * Math.cos(th) + (random(`gx${i}`) - 0.5) * 40;
			y = rr * Math.sin(th) + (random(`gy${i}`) - 0.5) * 40;
		}
		pts.push({x, y, z: 0, r: 0.6 + random(`gz${i}`) * 1.6, a: 0.35 + random(`gb${i}`) * 0.65, arrive: 0, parent: -1});
	}
	const origin = pts.reduce((best, p, i) => (Math.hypot(p.x - 420, p.y - 120) < Math.hypot(pts[best].x - 420, pts[best].y - 120) ? i : best), 0);
	const o = pts[origin];
	pts.forEach((p, i) => {
		p.arrive = Math.hypot(p.x - o.x, p.y - o.y) / 1100 + random(`gj${i}`) * 0.08;
	});
	// parent = an already-settled star close by (used for the probe network lines)
	const order = pts.map((_, i) => i).sort((a, b) => pts[a].arrive - pts[b].arrive);
	for (let k = 1; k < Math.min(order.length, 900); k++) {
		const i = order[k];
		let best = order[0];
		let bd = Infinity;
		for (let j = Math.max(0, k - 120); j < k; j++) {
			const q = pts[order[j]];
			const d = Math.hypot(q.x - pts[i].x, q.y - pts[i].y);
			if (d < bd) {
				bd = d;
				best = order[j];
			}
		}
		pts[i].parent = best;
	}
	return pts;
};

export const GalaxySpread: React.FC<{durationInFrames: number; mode?: 'colonize' | 'probes' | 'static'; label?: string}> = ({
	durationInFrames,
	mode = 'colonize',
	label,
}) => {
	const frame = useCurrentFrame();
	const pts = useMemo(buildGalaxy, []);
	const spin = frame * 0.0006;
	const progress =
		mode === 'static' ? -1 : interpolate(frame, [durationInFrames * 0.08, durationInFrames * 0.9], [0, 1.1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const tilt = 0.55;
	const proj = (p: P) => {
		const c = Math.cos(spin);
		const s = Math.sin(spin);
		return [CX + (p.x * c - p.y * s), CY + (p.x * s + p.y * c) * tilt] as const;
	};
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.12]);
	return (
		<AbsoluteFill style={{backgroundColor: '#020309'}}>
			<StarLayer seed="gal-bg" count={400} opacity={0.5} driftX={-0.05} />
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse 520px 260px at 50% 50%, rgba(255,230,190,0.28) 0%, rgba(120,140,220,0.08) 55%, rgba(0,0,0,0) 80%)',
					transform: `scale(${zoom})`,
				}}
			/>
			<svg width={1920} height={1080} style={{position: 'absolute', transform: `scale(${zoom})`}}>
				{mode === 'probes'
					? pts.map((p, i) => {
							if (p.parent < 0 || p.arrive > progress) return null;
							const [x1, y1] = proj(pts[p.parent]);
							const [x2, y2] = proj(p);
							const age = progress - p.arrive;
							return (
								<line
									key={`l${i}`}
									x1={x1}
									y1={y1}
									x2={x2}
									y2={y2}
									stroke={GOLD}
									strokeWidth={1}
									opacity={Math.max(0.12, 0.7 - age * 3)}
								/>
							);
						})
					: null}
				{pts.map((p, i) => {
					const [x, y] = proj(p);
					const settled = progress >= p.arrive;
					const flash = settled ? Math.max(0, 1 - (progress - p.arrive) * 12) : 0;
					return (
						<circle
							key={i}
							cx={x}
							cy={y}
							r={p.r + flash * 2.5}
							fill={settled ? `rgba(255,${190 + flash * 60},${110 + flash * 120},${Math.min(1, p.a + 0.3)})` : `rgba(215,225,255,${p.a * 0.75})`}
						/>
					);
				})}
			</svg>
			{label ? (
				<div style={{position: 'absolute', left: 150, bottom: 130, fontFamily: SANS, fontSize: 22, letterSpacing: 6, color: GOLD}}>{label}</div>
			) : null}
		</AbsoluteFill>
	);
};

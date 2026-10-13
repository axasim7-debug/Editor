import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {StarLayer} from './Starfield';

// A star slowly enclosed by orbiting collectors. As the swarm fills in,
// visible light fades and an infrared (red) waste-heat glow grows.
const RINGS = 14;
const PER_RING = 70;

export const DysonSwarm: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	const panels = useMemo(
		() =>
			new Array(RINGS * PER_RING).fill(0).map((_, i) => {
				const ring = Math.floor(i / PER_RING);
				return {
					ring,
					incl: (random(`di${ring}`) - 0.5) * Math.PI * 0.95,
					node: random(`dn${ring}`) * Math.PI * 2,
					phase: ((i % PER_RING) / PER_RING) * Math.PI * 2 + random(`dp${i}`) * 0.05,
					radius: 250 + random(`dr${ring}`) * 60,
					speed: 0.004 + random(`ds${ring}`) * 0.004,
					appear: random(`da${i}`),
				};
			}),
		[],
	);
	const fill = interpolate(frame, [0, durationInFrames * 0.85], [0.05, 1], {extrapolateRight: 'clamp'});
	const cx = 960;
	const cy = 540;
	const visible = panels
		.filter((p) => p.appear < fill)
		.map((p) => {
			const a = p.phase + frame * p.speed;
			// orbit in a tilted plane, then rotate about the view axis by the node angle
			const x0 = Math.cos(a) * p.radius;
			const y0 = Math.sin(a) * p.radius * Math.cos(p.incl);
			const z = Math.sin(a) * p.radius * Math.sin(p.incl);
			const x = x0 * Math.cos(p.node) - y0 * Math.sin(p.node);
			const y = x0 * Math.sin(p.node) + y0 * Math.cos(p.node);
			return {x: cx + x, y: cy + y, z, a};
		})
		.sort((m, n) => m.z - n.z);
	const starGlow = 1 - fill * 0.7;
	return (
		<AbsoluteFill style={{backgroundColor: '#020208'}}>
			<StarLayer seed="dyson" count={500} opacity={0.55} driftX={-0.04} />
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 50%, rgba(255,120,60,${0.35 * fill}) 0%, rgba(160,30,20,${0.2 * fill}) 25%, rgba(0,0,0,0) 45%)`,
				}}
			/>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<defs>
					<radialGradient id="star">
						<stop offset="0%" stopColor="#fffbe8" />
						<stop offset="35%" stopColor="#ffe29a" />
						<stop offset="100%" stopColor="rgba(255,170,60,0)" />
					</radialGradient>
				</defs>
				{visible.filter((p) => p.z < 0).map((p, i) => (
					<rect key={`b${i}`} x={p.x - 5} y={p.y - 3} width={10} height={6} fill="#6b7f99" opacity={0.6} transform={`rotate(${(p.a * 180) / Math.PI} ${p.x} ${p.y})`} />
				))}
				<circle cx={cx} cy={cy} r={230} fill="url(#star)" opacity={starGlow} />
				<circle cx={cx} cy={cy} r={110} fill="#fff6d8" opacity={starGlow} />
				{visible.filter((p) => p.z >= 0).map((p, i) => (
					<rect key={`f${i}`} x={p.x - 6} y={p.y - 3.5} width={12} height={7} fill="#a9bcd6" opacity={0.9} transform={`rotate(${(p.a * 180) / Math.PI} ${p.x} ${p.y})`} />
				))}
			</svg>
		</AbsoluteFill>
	);
};

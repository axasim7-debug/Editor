import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

export type Star = {x: number; y: number; r: number; a: number; hue: number; tw: number; depth: number};

export const makeStars = (seed: string, count: number, w: number, h: number): Star[] =>
	new Array(count).fill(0).map((_, i) => {
		const big = random(`${seed}b${i}`) > 0.97;
		return {
			x: random(`${seed}x${i}`) * w,
			y: random(`${seed}y${i}`) * h,
			r: big ? 1.6 + random(`${seed}r${i}`) * 1.8 : 0.4 + random(`${seed}r${i}`) * 1.1,
			a: 0.25 + random(`${seed}a${i}`) * 0.75,
			hue: random(`${seed}h${i}`) > 0.8 ? 30 : random(`${seed}h${i}`) > 0.6 ? 210 : 0,
			tw: random(`${seed}t${i}`) * Math.PI * 2,
			depth: 0.3 + random(`${seed}d${i}`) * 0.7,
		};
	});

export const starColor = (hue: number, a: number) =>
	hue === 0 ? `rgba(255,255,255,${a})` : hue === 30 ? `rgba(255,214,170,${a})` : `rgba(180,205,255,${a})`;

export const StarLayer: React.FC<{seed?: string; count?: number; driftX?: number; driftY?: number; opacity?: number}> = ({
	seed = 'sf',
	count = 900,
	driftX = -0.15,
	driftY = 0,
	opacity = 1,
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const stars = useMemo(() => makeStars(seed, count, width, height), [seed, count, width, height]);
	return (
		<svg width={width} height={height} style={{position: 'absolute', opacity}}>
			{stars.map((s, i) => {
				const x = (((s.x + frame * driftX * s.depth) % width) + width) % width;
				const y = (((s.y + frame * driftY * s.depth) % height) + height) % height;
				const twinkle = 0.75 + 0.25 * Math.sin(frame * 0.05 + s.tw);
				return <circle key={i} cx={x} cy={y} r={s.r} fill={starColor(s.hue, s.a * twinkle)} />;
			})}
		</svg>
	);
};

export const Nebula: React.FC<{hueA?: string; hueB?: string; opacity?: number}> = ({
	hueA = 'rgba(70,90,170,0.35)',
	hueB = 'rgba(140,60,120,0.22)',
	opacity = 1,
}) => {
	const frame = useCurrentFrame();
	const t = frame / 600;
	return (
		<AbsoluteFill
			style={{
				opacity,
				background: `radial-gradient(ellipse at ${30 + 8 * Math.sin(t)}% ${40 + 6 * Math.cos(t)}%, ${hueA} 0%, rgba(0,0,0,0) 55%),
				radial-gradient(ellipse at ${72 + 6 * Math.cos(t * 0.8)}% ${65 + 5 * Math.sin(t)}%, ${hueB} 0%, rgba(0,0,0,0) 50%)`,
			}}
		/>
	);
};

export const Starfield: React.FC<{durationInFrames: number; seed?: string}> = ({seed = 'sf'}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: '#020308'}}>
			<Nebula />
			<AbsoluteFill style={{transform: `scale(${1 + frame * 0.00008})`}}>
				<StarLayer seed={seed} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

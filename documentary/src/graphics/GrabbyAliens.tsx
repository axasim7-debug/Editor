import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {GOLD, SANS} from '../fonts';
import {Nebula, StarLayer} from './Starfield';

// Civilizations appear at random places and times and expand as spheres.
// One small untouched gap holds a pale dot: us, still early.
const BUBBLES = 26;
const US = {x: 1180, y: 610};

export const GrabbyAliens: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	const bubbles = useMemo(
		() =>
			new Array(BUBBLES)
				.fill(0)
				.map((_, i) => ({
					x: random(`bx${i}`) * 1920,
					y: random(`by${i}`) * 1080,
					born: random(`bb${i}`) * durationInFrames * 0.75,
					speed: 0.9 + random(`bs${i}`) * 0.9,
					hue: Math.floor(random(`bh${i}`) * 360),
				}))
				// keep the region around "us" free so the gap remains visible
				.filter((b) => Math.hypot(b.x - US.x, b.y - US.y) > 330),
		[durationInFrames],
	);
	return (
		<AbsoluteFill style={{backgroundColor: '#03040a'}}>
			<Nebula opacity={0.4} />
			<StarLayer seed="grabby" count={700} opacity={0.7} driftX={-0.03} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{bubbles.map((b, i) => {
					if (frame < b.born) return null;
					const age = frame - b.born;
					const maxR = Math.max(60, Math.hypot(b.x - US.x, b.y - US.y) - 140);
					const r = Math.min(maxR, age * b.speed);
					return (
						<g key={i}>
							<circle cx={b.x} cy={b.y} r={r} fill={`hsla(${b.hue},60%,55%,0.16)`} stroke={`hsla(${b.hue},70%,70%,0.6)`} strokeWidth={2} />
							<circle cx={b.x} cy={b.y} r={3} fill={`hsla(${b.hue},80%,80%,0.9)`} />
						</g>
					);
				})}
				<circle cx={US.x} cy={US.y} r={5 + Math.sin(frame * 0.1)} fill="#9fd0ff" />
				<circle cx={US.x} cy={US.y} r={18} fill="none" stroke="#9fd0ff" strokeOpacity={0.4} />
			</svg>
			<div style={{position: 'absolute', left: US.x + 28, top: US.y - 12, fontFamily: SANS, fontSize: 20, letterSpacing: 5, color: GOLD}}>
				US
			</div>
		</AbsoluteFill>
	);
};

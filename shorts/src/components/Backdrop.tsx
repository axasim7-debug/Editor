import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {Cam} from '../drake/camera';
import {BG} from '../theme';

// Deep-space backdrop in screen space: soft colour fields plus three parallax star layers
// that slide against the camera, so every camera move reads as travel through depth.
const LAYERS = [
	{seed: 'far', count: 260, depth: 0.04, size: [0.6, 1.4], alpha: 0.45},
	{seed: 'mid', count: 140, depth: 0.1, size: [1, 2], alpha: 0.6},
	{seed: 'near', count: 50, depth: 0.22, size: [1.6, 3], alpha: 0.75},
];
const TILE = {w: 1400, h: 2400};
const mod = (a: number, n: number) => ((a % n) + n) % n;

export const Backdrop: React.FC<{cam: Cam; t: number; energy: number}> = ({cam, t, energy}) => {
	return (
		<AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 90% 55% at ${50 + Math.sin(t * 0.07) * 8}% 28%, rgba(52,70,140,${0.28 + energy * 0.08}) 0%, rgba(10,14,40,0) 70%),
					radial-gradient(ellipse 70% 45% at 70% 82%, rgba(120,70,40,0.16) 0%, rgba(0,0,0,0) 70%),
					radial-gradient(ellipse 60% 40% at 15% 60%, rgba(40,110,130,0.12) 0%, rgba(0,0,0,0) 70%)`,
				}}
			/>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				{LAYERS.map((L) =>
					new Array(L.count).fill(0).map((_, i) => {
						const bx = random(`${L.seed}x${i}`) * TILE.w;
						const by = random(`${L.seed}y${i}`) * TILE.h;
						const x = mod(bx - cam.x * L.depth * Math.sqrt(cam.z), TILE.w) - 160;
						const y = mod(by - cam.y * L.depth * Math.sqrt(cam.z), TILE.h) - 240;
						const s = L.size[0] + random(`${L.seed}s${i}`) * (L.size[1] - L.size[0]);
						const tw = 0.6 + 0.4 * Math.sin(t * (1 + random(`${L.seed}t${i}`) * 2) + i);
						return <circle key={`${L.seed}${i}`} cx={x} cy={y} r={s / 2} fill="#fff" opacity={L.alpha * tw} />;
					}),
				)}
			</svg>
		</AbsoluteFill>
	);
};

// Fixed lens finish: vignette and animated film grain.
export const Finish: React.FC<{frame: number}> = ({frame}) => (
	<>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.62) 100%)'}} />
		<AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}>
			<svg width={1080} height={1920}>
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 50} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	</>
);

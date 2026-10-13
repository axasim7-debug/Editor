import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {GOLD, INK, SANS, SERIF} from '../fonts';
import {Nebula, StarLayer} from './Starfield';

const STEPS = [
	'The right star system',
	'A habitable planet',
	'Life begins',
	'Complex cells',
	'Sexual reproduction',
	'Multicellular life',
	'Tools and intelligence',
	'Technology',
	'Expansion into the galaxy',
];
const HERE = 7; // index of "Technology" — where we are now

// Steps build from the bottom up; then a red barrier searches the ladder,
// first behind us, then ahead of us, and settles in the uncertain middle.
export const GreatFilter: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	const D = durationInFrames;
	const rowH = 82;
	const baseY = 980;
	const buildEnd = D * 0.4;
	const barrierIn = interpolate(frame, [buildEnd, buildEnd + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// barrier position in "step gaps" (between step k and k+1)
	const pos = interpolate(frame, [buildEnd, D * 0.62, D * 0.7, D * 0.88, D], [2.5, 2.5, 7.5, 7.5, 5], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});
	const barrierY = baseY - (pos + 0.5) * rowH - rowH / 2 + 22;

	return (
		<AbsoluteFill style={{backgroundColor: '#04050b'}}>
			<Nebula opacity={0.5} />
			<StarLayer seed="filter" count={500} opacity={0.5} />
			{STEPS.map((s, i) => {
				const appear = interpolate(frame, [(i * buildEnd) / STEPS.length, (i * buildEnd) / STEPS.length + 20], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const y = baseY - (i + 1) * rowH;
				const blocked = barrierIn > 0 && i > pos;
				const isHere = i === HERE;
				return (
					<div
						key={s}
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: y,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 30,
							opacity: appear * (blocked ? 0.35 : 1),
							transform: `translateY(${(1 - appear) * 20}px)`,
						}}
					>
						<div style={{width: 14, height: 14, borderRadius: 7, background: isHere ? GOLD : 'rgba(243,239,230,0.6)'}} />
						<div style={{fontFamily: SERIF, fontSize: 48, color: isHere ? GOLD : INK, width: 620}}>{s}</div>
						<div style={{fontFamily: SANS, fontSize: 18, letterSpacing: 5, color: GOLD, width: 220}}>{isHere ? '◀ WE ARE HERE' : ''}</div>
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: 380,
					right: 380,
					top: barrierY,
					height: 4,
					background: '#ff4a3d',
					opacity: barrierIn,
					boxShadow: '0 0 30px 8px rgba(255,74,61,0.55)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					right: 150,
					top: barrierY - 18,
					fontFamily: SANS,
					fontSize: 22,
					letterSpacing: 6,
					color: '#ff7a6d',
					opacity: barrierIn,
				}}
			>
				THE GREAT FILTER ?
			</div>
		</AbsoluteFill>
	);
};

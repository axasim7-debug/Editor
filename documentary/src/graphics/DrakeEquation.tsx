import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {GOLD, INK, SANS, SERIF} from '../fonts';
import {Nebula, StarLayer} from './Starfield';

const TERMS: {sym: React.ReactNode; label: string; known: boolean}[] = [
	{sym: <>R<sub>*</sub></>, label: 'New stars formed per year', known: true},
	{sym: <>f<sub>p</sub></>, label: 'Fraction of stars with planets', known: true},
	{sym: <>n<sub>e</sub></>, label: 'Habitable planets per system', known: true},
	{sym: <>f<sub>l</sub></>, label: 'Fraction where life begins', known: false},
	{sym: <>f<sub>i</sub></>, label: 'Fraction that evolves intelligence', known: false},
	{sym: <>f<sub>c</sub></>, label: 'Fraction that becomes detectable', known: false},
	{sym: <>L</>, label: 'How long a civilization lasts', known: false},
];

// Timeline (fractions of the shot): terms appear, a highlight walks across them with
// a caption, then the measured terms turn gold and the unknowns dim, with L glowing last.
export const DrakeEquation: React.FC<{durationInFrames: number; transparent?: boolean}> = ({durationInFrames, transparent}) => {
	const frame = useCurrentFrame();
	const D = durationInFrames;
	const revealEnd = Math.min(D * 0.18, 150);
	const walkStart = revealEnd + 20;
	const walkEnd = D * 0.72;
	const per = (walkEnd - walkStart) / TERMS.length;
	const active = frame >= walkStart && frame < walkEnd ? Math.floor((frame - walkStart) / per) : -1;
	const verdict = interpolate(frame, [walkEnd, walkEnd + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const zoom = interpolate(frame, [0, D], [1, 1.06]);

	return (
		<AbsoluteFill style={{backgroundColor: transparent ? 'rgba(0,0,0,0.5)' : '#03040a', textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
			{transparent ? null : (
				<>
					<Nebula opacity={0.7} />
					<StarLayer seed="drake" count={600} opacity={0.6} />
				</>
			)}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${zoom})`}}>
				<div style={{display: 'flex', alignItems: 'baseline', fontFamily: SERIF, color: INK, fontSize: 120, fontStyle: 'italic'}}>
					<span style={{opacity: interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'})}}>N&nbsp;=&nbsp;</span>
					{TERMS.map((t, i) => {
						const appear = interpolate(frame, [20 + (i * revealEnd) / TERMS.length, 40 + (i * revealEnd) / TERMS.length], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						const isActive = active === i;
						const knownColor = t.known ? GOLD : i === TERMS.length - 1 ? '#ff8a6b' : 'rgba(243,239,230,0.35)';
						const color = verdict > 0 ? knownColor : isActive ? GOLD : INK;
						const glow = i === TERMS.length - 1 && verdict > 0 ? 0.5 + 0.5 * Math.sin(frame * 0.12) : 0;
						return (
							<span key={i} style={{display: 'flex', alignItems: 'baseline'}}>
								{i > 0 ? <span style={{opacity: appear * 0.6, margin: '0 18px', fontStyle: 'normal'}}>·</span> : null}
								<span
									style={{
										opacity: appear,
										color,
										transform: `translateY(${(1 - appear) * 20}px) scale(${isActive ? 1.12 : 1})`,
										display: 'inline-block',
										transition: 'none',
										textShadow: glow ? `0 0 ${30 * glow}px rgba(255,138,107,0.9)` : isActive ? '0 0 30px rgba(217,183,122,0.6)' : 'none',
									}}
								>
									{t.sym}
								</span>
							</span>
						);
					})}
				</div>
				<div style={{height: 120, marginTop: 50, textAlign: 'center'}}>
					{active >= 0 ? (
						<div
							style={{
								fontFamily: SANS,
								fontSize: 30,
								letterSpacing: 6,
								color: GOLD,
								textTransform: 'uppercase',
								opacity: interpolate((frame - walkStart) % per, [0, 12, per - 12, per], [0, 1, 1, 0]),
							}}
						>
							{TERMS[active].label}
						</div>
					) : null}
					{verdict > 0 ? (
						<div style={{display: 'flex', gap: 80, justifyContent: 'center', opacity: verdict, fontFamily: SANS, fontSize: 24, letterSpacing: 6}}>
							<span style={{color: GOLD}}>■ MEASURED</span>
							<span style={{color: 'rgba(243,239,230,0.55)'}}>■ UNKNOWN</span>
						</div>
					) : null}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GRAPHICS} from '../graphics';
import type {KenBurns, Shot} from '../types';

const kenBurns = (kb: KenBurns | undefined, frame: number, duration: number): React.CSSProperties => {
	if (!kb) return {};
	const t = interpolate(frame, [0, duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const s = kb.s0 + (kb.s1 - kb.s0) * t;
	const x = kb.x0 + (kb.x1 - kb.x0) * t;
	const y = kb.y0 + (kb.y1 - kb.y0) * t;
	return {transform: `translate(${x}%, ${y}%) scale(${s})`};
};

// Old film: slight sepia, extra contrast and a gentle exposure flicker.
const archivalFilter = (frame: number) => {
	const flicker = 0.96 + 0.05 * Math.sin(frame * 1.7) * Math.sin(frame * 0.37);
	return `grayscale(0.35) sepia(0.28) contrast(1.12) brightness(${flicker.toFixed(3)})`;
};

const MODERN_GRADE = 'contrast(1.06) saturate(0.94) brightness(0.97)';

export const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const opacity = shot.fadeIn > 0 ? interpolate(frame, [0, shot.fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;
	const motion = kenBurns(shot.kb, frame, shot.duration);

	let content: React.ReactNode = null;
	if (shot.type === 'video' && shot.src) {
		content = (
			<AbsoluteFill style={{...motion, filter: shot.archival ? archivalFilter(frame) : MODERN_GRADE}}>
				<OffthreadVideo
					src={staticFile(shot.src)}
					startFrom={shot.startFrom ?? 0}
					playbackRate={shot.playbackRate ?? 1}
					muted
					style={{width, height, objectFit: 'cover'}}
				/>
			</AbsoluteFill>
		);
	} else if (shot.type === 'image' && shot.src) {
		const contain = shot.props?.fit === 'contain';
		const src = staticFile(shot.src);
		content = (
			<AbsoluteFill>
				{contain ? (
					// Portrait stills sit on a blurred, darkened copy of themselves.
					<Img
						src={src}
						style={{width, height, objectFit: 'cover', filter: 'blur(40px) brightness(0.35)', transform: 'scale(1.15)'}}
					/>
				) : null}
				<AbsoluteFill style={{...motion, filter: shot.archival ? archivalFilter(frame) : MODERN_GRADE}}>
					<Img src={src} style={{width, height, objectFit: contain ? 'contain' : 'cover'}} />
				</AbsoluteFill>
			</AbsoluteFill>
		);
	} else if (shot.type === 'graphic' && shot.graphic) {
		const Graphic = GRAPHICS[shot.graphic] ?? GRAPHICS.Starfield;
		content = <Graphic durationInFrames={shot.duration} {...(shot.props ?? {})} />;
	}

	return <AbsoluteFill style={{opacity, overflow: 'hidden'}}>{content}</AbsoluteFill>;
};

import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ShotView} from './components/Shot';
import {OverlayView} from './components/Overlays';
import {FilmLook} from './components/FilmLook';
import type {AudioClip, Segment} from './types';

// Music sits at full level between lines and ducks under narration.
const DUCKED = 0.3;
const DUCK_RAMP = 14;

const duckFactor = (frame: number, speech: [number, number][]) => {
	let nearest = Infinity;
	for (const [a, b] of speech) {
		if (frame >= a && frame <= b) return DUCKED;
		nearest = Math.min(nearest, Math.abs(frame - a), Math.abs(frame - b));
		if (a > frame + DUCK_RAMP) break;
	}
	return interpolate(nearest, [0, DUCK_RAMP], [DUCKED, 1], {extrapolateRight: 'clamp'});
};

const MusicClip: React.FC<{clip: AudioClip; speech: [number, number][]}> = ({clip, speech}) => {
	const fadeIn = clip.fadeIn ?? 30;
	const fadeOut = clip.fadeOut ?? 45;
	return (
		<Sequence from={clip.from} durationInFrames={clip.duration} layout="none">
			<Audio
				src={staticFile(clip.src)}
				startFrom={clip.startFrom ?? 0}
				volume={(f) => {
					const env = Math.min(
						interpolate(f, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'}),
						interpolate(f, [clip.duration - fadeOut, clip.duration], [1, 0], {extrapolateLeft: 'clamp'}),
					);
					return (clip.volume ?? 0.3) * env * duckFactor(clip.from + f, speech);
				}}
			/>
		</Sequence>
	);
};

const Fades: React.FC<{segment: Segment}> = ({segment}) => {
	const frame = useCurrentFrame();
	const {fadeFromBlack, fadeToBlack, durationInFrames} = segment;
	const opacity = Math.max(
		fadeFromBlack > 0 ? interpolate(frame, [0, fadeFromBlack], [1, 0], {extrapolateRight: 'clamp'}) : 0,
		fadeToBlack > 0
			? interpolate(frame, [durationInFrames - fadeToBlack, durationInFrames], [0, 1], {extrapolateLeft: 'clamp'})
			: 0,
	);
	return <AbsoluteFill style={{backgroundColor: 'black', opacity}} />;
};

export const SegmentView: React.FC<{segment: Segment}> = ({segment}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			{segment.shots.map((shot, i) => (
				<Sequence key={i} from={shot.from} durationInFrames={shot.duration}>
					<ShotView shot={shot} />
				</Sequence>
			))}
			<FilmLook />
			{segment.overlays.map((overlay, i) => (
				<Sequence key={i} from={overlay.from} durationInFrames={overlay.duration}>
					<OverlayView overlay={overlay} />
				</Sequence>
			))}
			<Fades segment={segment} />
			{segment.narration.map((clip, i) => (
				<Sequence key={i} from={clip.from} durationInFrames={clip.duration} layout="none">
					<Audio src={staticFile(clip.src)} volume={clip.volume ?? 1} />
				</Sequence>
			))}
			{segment.music.map((clip, i) => (
				<MusicClip key={i} clip={clip} speech={segment.speech} />
			))}
		</AbsoluteFill>
	);
};

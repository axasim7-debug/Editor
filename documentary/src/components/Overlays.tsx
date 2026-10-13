import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GOLD, INK, SANS, SERIF} from '../fonts';
import type {Overlay} from '../types';
import {Credits} from './Credits';
import {DrakeEquation} from '../graphics/DrakeEquation';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const useInOut = (inFrames: number, outFrames: number) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const appear = interpolate(frame, [0, inFrames], [0, 1], {extrapolateRight: 'clamp', easing: ease});
	const leave = interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return {frame, appear, leave, durationInFrames};
};

const ChapterCard: React.FC<{overlay: Overlay}> = ({overlay}) => {
	const {frame, appear, leave} = useInOut(40, 30);
	const line = interpolate(frame, [15, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const subIn = interpolate(frame, [35, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: leave, justifyContent: 'center', alignItems: 'center'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 70%)'}} />
			<div style={{textAlign: 'center', color: INK, transform: `translateY(${(1 - appear) * 24}px)`, opacity: appear}}>
				<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: 12, color: GOLD, textTransform: 'uppercase'}}>
					{overlay.num}
				</div>
				<div
					style={{
						fontFamily: SERIF,
						fontWeight: 400,
						fontSize: 112,
						lineHeight: 1.05,
						marginTop: 26,
						letterSpacing: 1,
						textShadow: '0 4px 40px rgba(0,0,0,0.8)',
					}}
				>
					{overlay.title}
				</div>
				<div style={{height: 1, background: GOLD, width: 420 * line, margin: '34px auto 26px', opacity: 0.8}} />
				{overlay.sub ? (
					<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, opacity: 0.85 * subIn}}>{overlay.sub}</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

const LowerThird: React.FC<{overlay: Overlay}> = ({overlay}) => {
	const {frame, appear, leave} = useInOut(28, 22);
	const bar = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: ease});
	const reveal = interpolate(frame, [8, 40], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	return (
		<AbsoluteFill style={{opacity: leave}}>
			<div
				style={{
					position: 'absolute',
					left: 120,
					bottom: 120,
					padding: '18px 110px 20px 30px',
					background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.6) calc(100% - 100px), rgba(0,0,0,0) 100%)',
					textShadow: '0 2px 12px rgba(0,0,0,0.9)',
					clipPath: `inset(0 ${100 - reveal}% 0 0)`,
				}}
			>
				<div style={{position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, background: GOLD, transform: `scaleY(${bar})`}} />
				<div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 50, color: INK, lineHeight: 1.1, opacity: appear}}>
					{overlay.title}
				</div>
				{overlay.sub ? (
					<div
						style={{
							fontFamily: SANS,
							fontWeight: 400,
							fontSize: 21,
							letterSpacing: 3,
							color: GOLD,
							marginTop: 10,
							textTransform: 'uppercase',
							opacity: appear,
							maxWidth: 1100,
						}}
					>
						{overlay.sub}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

const Callout: React.FC<{overlay: Overlay}> = ({overlay}) => {
	const {appear, leave} = useInOut(35, 25);
	return (
		<AbsoluteFill style={{opacity: leave, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 150}}>
			<AbsoluteFill style={{opacity: appear, background: 'radial-gradient(ellipse 900px 420px at 78% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'}} />
			<div
				style={{
					textAlign: 'right',
					color: INK,
					opacity: appear,
					transform: `translateY(${(1 - appear) * 30}px)`,
					textShadow: '0 4px 30px rgba(0,0,0,0.85)',
				}}
			>
				<div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 132, lineHeight: 1}}>{overlay.title}</div>
				<div style={{height: 1, background: GOLD, width: 360 * appear, marginLeft: 'auto', margin: '22px 0 18px auto'}} />
				<div style={{fontFamily: SANS, fontSize: 24, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, maxWidth: 640}}>
					{overlay.sub}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const TitleCard: React.FC<{overlay: Overlay}> = ({overlay}) => {
	const {frame, leave} = useInOut(60, 45);
	const t = interpolate(frame, [0, 80], [0, 1], {extrapolateRight: 'clamp', easing: ease});
	const sub = interpolate(frame, [50, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: leave, justifyContent: 'center', alignItems: 'center'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)'}} />
			<div style={{textAlign: 'center', color: INK}}>
				<div
					style={{
						fontFamily: SERIF,
						fontWeight: 300,
						fontSize: 170,
						letterSpacing: interpolate(t, [0, 1], [40, 14]),
						opacity: t,
						textShadow: '0 0 60px rgba(120,160,255,0.25)',
					}}
				>
					{overlay.title}
				</div>
				<div style={{height: 1, background: GOLD, width: 560 * sub, margin: '30px auto'}} />
				<div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: 14, textTransform: 'uppercase', opacity: sub}}>
					{overlay.sub}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const Quote: React.FC<{overlay: Overlay}> = ({overlay}) => {
	const {appear, leave} = useInOut(40, 30);
	return (
		<AbsoluteFill style={{opacity: leave * appear, justifyContent: 'center', alignItems: 'center', padding: '0 260px'}}>
			<div style={{textAlign: 'center', color: INK, textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, lineHeight: 1.3}}>“{overlay.title}”</div>
				<div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 6, color: GOLD, marginTop: 30, textTransform: 'uppercase'}}>
					{overlay.sub}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const OverlayView: React.FC<{overlay: Overlay}> = ({overlay}) => {
	switch (overlay.type) {
		case 'chapterCard':
			return <ChapterCard overlay={overlay} />;
		case 'lowerThird':
			return <LowerThird overlay={overlay} />;
		case 'callout':
			return <Callout overlay={overlay} />;
		case 'titleCard':
			return <TitleCard overlay={overlay} />;
		case 'quote':
			return <Quote overlay={overlay} />;
		case 'drake':
			return <DrakeEquation durationInFrames={overlay.duration} transparent />;
		case 'credits':
			return <Credits lines={overlay.lines ?? []} />;
		default:
			return null;
	}
};

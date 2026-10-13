import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {HAND, MONO} from '../fonts';

// A recreation of the Big Ear computer printout: columns of intensity codes
// (blank, 1-9, then letters for stronger signals) with the famous 6EQUJ5 circled.
const ROWS = 34;
const COLS = 50;
const SIGNAL_COL = 2;
const SIGNAL_ROW = 15;
const SIGNAL = '6EQUJ5';

const cell = (r: number, c: number) => {
	if (c === SIGNAL_COL && r >= SIGNAL_ROW && r < SIGNAL_ROW + SIGNAL.length) return SIGNAL[r - SIGNAL_ROW];
	const v = random(`w${r}-${c}`);
	if (v < 0.55) return '1';
	if (v < 0.8) return ' ';
	if (v < 0.93) return '2';
	if (v < 0.98) return '3';
	return '4';
};

export const WowSignal: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	const grid = useMemo(() => new Array(ROWS).fill(0).map((_, r) => new Array(COLS).fill(0).map((__, c) => cell(r, c))), []);
	const circle = interpolate(frame, [durationInFrames * 0.25, durationInFrames * 0.45], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const wow = interpolate(frame, [durationInFrames * 0.45, durationInFrames * 0.55], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const zoom = interpolate(frame, [0, durationInFrames], [1.05, 1.6]);
	const cw = 30;
	const ch = 34;
	const left = 120;
	const top = 30;
	const cx = left + SIGNAL_COL * cw + cw / 2;
	const cy = top + (SIGNAL_ROW + SIGNAL.length / 2) * ch;
	const perim = 2 * Math.PI * 130;
	return (
		<AbsoluteFill style={{backgroundColor: '#e9e2cf'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`}}>
				{/* tractor-feed paper with faint green bands */}
				{new Array(16).fill(0).map((_, i) => (
					<div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * 136, height: 68, background: 'rgba(120,160,120,0.12)'}} />
				))}
				<div style={{position: 'absolute', left, top, fontFamily: MONO, fontSize: 26, color: '#2f3a4d', lineHeight: `${ch}px`}}>
					{grid.map((row, r) => (
						<div key={r} style={{whiteSpace: 'pre', letterSpacing: cw - 15.6}}>
							{row.join('')}
						</div>
					))}
				</div>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<ellipse
						cx={cx}
						cy={cy}
						rx={34}
						ry={130}
						fill="none"
						stroke="#c0262d"
						strokeWidth={5}
						strokeDasharray={perim}
						strokeDashoffset={perim * (1 - circle)}
						transform={`rotate(-4 ${cx} ${cy})`}
					/>
				</svg>
				<div
					style={{
						position: 'absolute',
						left: cx - 70,
						top: cy - 230,
						fontFamily: HAND,
						fontSize: 96,
						color: '#c0262d',
						opacity: wow,
						transform: `rotate(-8deg) scale(${0.9 + 0.1 * wow})`,
					}}
				>
					Wow!
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(40,30,10,0.45) 100%)'}} />
		</AbsoluteFill>
	);
};

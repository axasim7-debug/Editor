import React from 'react';
import type {Cam} from '../drake/camera';
import {FOCUS, H, W} from '../drake/script';

// The work canvas: an infinite blueprint grid in world space. Lines keep a constant
// on-screen width, and the grid steps through levels (like a design tool) as the camera zooms.
const BASE = 120;

export const Grid: React.FC<{cam: Cam; fog: number}> = ({cam, fog}) => {
	const r = Math.hypot(W, H) / 2 / cam.z + 200;
	const cx = cam.x + (W / 2 - FOCUS.x) / cam.z;
	const cy = cam.y + (H / 2 - FOCUS.y) / cam.z;
	// Pick the level whose on-screen spacing sits between 60 and 240 px.
	const lvl = Math.log(60 / (BASE * cam.z)) / Math.log(4);
	const k = Math.ceil(lvl);
	const frac = k - lvl; // 0..1: how settled this level is
	const levels = [
		{step: BASE * 4 ** k, a: 0.05 + 0.03 * frac},
		{step: BASE * 4 ** (k + 1), a: 0.09},
	];
	const lines: React.ReactNode[] = [];
	for (const [li, L] of levels.entries()) {
		const x0 = Math.floor((cx - r) / L.step) * L.step;
		const y0 = Math.floor((cy - r) / L.step) * L.step;
		for (let x = x0; x <= cx + r; x += L.step)
			lines.push(<line key={`v${li}${x}`} x1={x} y1={cy - r} x2={x} y2={cy + r} stroke={`rgba(160,190,255,${L.a * (1 - fog * 0.5)})`} strokeWidth={1} vectorEffect="non-scaling-stroke" />);
		for (let y = y0; y <= cy + r; y += L.step)
			lines.push(<line key={`h${li}${y}`} x1={cx - r} y1={y} x2={cx + r} y2={y} stroke={`rgba(160,190,255,${L.a * (1 - fog * 0.5)})`} strokeWidth={1} vectorEffect="non-scaling-stroke" />);
	}
	// Crosshair marks on the major intersections near the camera.
	const M = levels[1].step;
	const marks: React.ReactNode[] = [];
	const mx0 = Math.floor((cx - r) / M) * M;
	const my0 = Math.floor((cy - r) / M) * M;
	const s = 7 / cam.z;
	for (let x = mx0; x <= cx + r; x += M)
		for (let y = my0; y <= cy + r; y += M)
			marks.push(
				<path key={`m${x}_${y}`} d={`M ${x - s} ${y} L ${x + s} ${y} M ${x} ${y - s} L ${x} ${y + s}`} stroke="rgba(200,215,255,0.28)" strokeWidth={1} vectorEffect="non-scaling-stroke" />,
			);
	return (
		<g>
			{lines}
			{marks}
		</g>
	);
};

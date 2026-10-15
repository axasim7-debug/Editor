import {Easing} from 'remotion';

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Camera travel: slow lift-off, fast middle, long soft landing.
export const travel = Easing.bezier(0.7, 0, 0.18, 1);
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.45, 0, 0.55, 1);

// Progress 0..1 of an event that starts at `start` seconds and lasts `dur` seconds.
export const prog = (t: number, start: number, dur: number, ease: (x: number) => number = outExpo) =>
	ease(clamp01((t - start) / dur));

// Damped settle used on landings instead of a hard stop (a small overshoot, then rest).
export const settle = (t: number, start: number, amp = 1, freq = 3.2, decay = 5) => {
	const x = t - start;
	if (x <= 0) return 0;
	return amp * Math.sin(x * freq * Math.PI * 2) * Math.exp(-x * decay);
};

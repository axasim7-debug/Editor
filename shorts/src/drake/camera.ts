import {noise2D} from '@remotion/noise';
import {inOut, lerp, outExpo, travel} from '../lib/ease';
import {CLIMAX, EQ, FOCUS, GALAXY, PULSE, TERMS, TRAVEL_S, YAH} from './script';

export type Cam = {x: number; y: number; z: number; r: number};
type Pt = {x: number; y: number};

// Connection between consecutive stops: a vertical S-curve (also the camera's flight path).
export type Link = {a: Pt; b: Pt; c1: Pt; c2: Pt; t0: number};
// The hook frames the galaxy low in the shot (clear of the title), so the route starts there.
export const HOOK_VIEW = {x: GALAXY.x, y: GALAXY.y - 120};
const stops: (Pt & {pulse: number})[] = [{...HOOK_VIEW, pulse: 0}, EQ, ...TERMS];
export const LINKS: Link[] = stops.slice(1).map((b, i) => {
	const a = stops[i];
	const k = (b.y - a.y) * 0.55;
	return {a, b, c1: {x: a.x, y: a.y + k}, c2: {x: b.x, y: b.y - k}, t0: b.pulse};
});

export const bezier = (l: Link, t: number): Pt => {
	const u = 1 - t;
	return {
		x: u * u * u * l.a.x + 3 * u * u * t * l.c1.x + 3 * u * t * t * l.c2.x + t * t * t * l.b.x,
		y: u * u * u * l.a.y + 3 * u * u * t * l.c1.y + 3 * u * t * t * l.c2.y + t * t * t * l.b.y,
	};
};
export const linkPath = (l: Link) => `M ${l.a.x} ${l.a.y} C ${l.c1.x} ${l.c1.y} ${l.c2.x} ${l.c2.y} ${l.b.x} ${l.b.y}`;

type Seg = {t0: number; t1: number; to: Cam; ease: (x: number) => number; link?: Link; dip?: number; tilt?: number};

const EARTH_CLOSE: Cam = {x: YAH.x, y: YAH.y, z: 3.4, r: 0};
const MAP: Cam = {x: 0, y: 5000, z: 0.135, r: 0};
const DRIFT = 0.012; // slow push-in per second while holding on a stop

const segs: Seg[] = [
	{t0: 0, t1: 3.1, to: {...HOOK_VIEW, z: 1, r: 0}, ease: (x) => outExpo(x)},
	...LINKS.map((l, i) => ({
		t0: l.t0,
		t1: l.t0 + TRAVEL_S,
		to: {x: l.b.x, y: l.b.y, z: 1, r: 0},
		ease: travel,
		link: l,
		dip: 0.22,
		tilt: i % 2 === 0 ? -1.6 : 1.6,
	})),
	{t0: CLIMAX.mapOut, t1: CLIMAX.mapHold, to: MAP, ease: inOut},
	{t0: CLIMAX.mapHold, t1: CLIMAX.reveal, to: {x: 0, y: -250, z: 0.98, r: 0}, ease: (x) => x * x * (3 - 2 * x)},
	{t0: CLIMAX.dive, t1: CLIMAX.diveEnd, to: EARTH_CLOSE, ease: (x) => travel(x)},
];

// Start state of each segment = where the camera is when it begins (including drift).
const starts: Cam[] = [];
{
	let cur = EARTH_CLOSE;
	let curT = 0;
	for (const s of segs) {
		const held = s.t0 - curT;
		cur = {...cur, z: cur.z * (1 + DRIFT * Math.max(0, held))};
		starts.push(cur);
		cur = s.to;
		curT = s.t1;
	}
}

const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

export const cameraAt = (t: number): Cam => {
	let cam: Cam = EARTH_CLOSE;
	for (let i = 0; i < segs.length; i++) {
		const s = segs[i];
		const a = starts[i];
		if (t < s.t0) break;
		if (t <= s.t1) {
			const p = s.ease((t - s.t0) / (s.t1 - s.t0));
			const pos = s.link ? bezier(s.link, p) : {x: lerp(a.x, s.to.x, p), y: lerp(a.y, s.to.y, p)};
			const dip = s.dip ? 1 - s.dip * Math.sin(Math.PI * p) : 1;
			cam = {...pos, z: logLerp(a.z, s.to.z, p) * dip, r: (s.tilt ?? 0) * Math.sin(Math.PI * p)};
			break;
		}
		const next = segs[i + 1];
		const holdEnd = next ? Math.min(t, next.t0) : t;
		cam = {...s.to, z: s.to.z * (1 + DRIFT * (holdEnd - s.t1))};
	}
	// A breath of handheld float so held shots never look frozen.
	const hx = noise2D('cx', t * 0.35, 0) * 5;
	const hy = noise2D('cy', t * 0.35, 0) * 5;
	return {x: cam.x + hx / cam.z, y: cam.y + hy / cam.z, z: cam.z, r: cam.r + noise2D('cr', t * 0.25, 0) * 0.15};
};

export const worldTransform = (c: Cam) =>
	`translate(${FOCUS.x}px, ${FOCUS.y}px) rotate(${c.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;

export const worldToScreen = (c: Cam, p: Pt): Pt => {
	const dx = (p.x - c.x) * c.z;
	const dy = (p.y - c.y) * c.z;
	const r = (c.r * Math.PI) / 180;
	return {x: FOCUS.x + dx * Math.cos(r) - dy * Math.sin(r), y: FOCUS.y + dx * Math.sin(r) + dy * Math.cos(r)};
};

// Speed of the camera in screen px/s — used for motion blur and streaks.
export const cameraSpeed = (t: number, dt = 1 / 60) => {
	const a = cameraAt(t - dt);
	const b = cameraAt(t);
	const dz = Math.abs(Math.log(b.z / a.z)) * 900;
	return (Math.hypot(b.x - a.x, b.y - a.y) * b.z + dz) / dt;
};

export {PULSE};

export type MusicData = {
	fps: number;
	pulses: number[];
	onsets: {t: number; s: number}[];
	energy: number[];
};

// Smoothed loudness (0..1) around time t.
export const energyAt = (m: MusicData, t: number, window = 0.25) => {
	const c = Math.round(t * m.fps);
	const w = Math.max(1, Math.round(window * m.fps));
	let sum = 0;
	let n = 0;
	for (let i = c - w; i <= c; i++) {
		if (i >= 0 && i < m.energy.length) {
			sum += m.energy[i];
			n++;
		}
	}
	return n ? sum / n : 0;
};

// A decaying "hit" envelope: 1 at each onset stronger than minStrength, fading over `decay` s.
export const accentAt = (m: MusicData, t: number, minStrength = 0.2, decay = 0.45) => {
	let v = 0;
	for (const o of m.onsets) {
		if (o.s < minStrength || o.t > t) continue;
		const dt = t - o.t;
		if (dt > decay * 4) continue;
		v = Math.max(v, o.s * Math.exp(-dt / decay));
	}
	return v;
};

// First onset at or after `t` (used to land text reveals on a musical note).
export const nextOnset = (m: MusicData, t: number, minStrength = 0.1) =>
	m.onsets.find((o) => o.t >= t && o.s >= minStrength)?.t ?? t;

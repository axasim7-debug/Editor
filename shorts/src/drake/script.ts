// "How many alien civilizations share our galaxy?" — a Drake-equation Short.
// Every timing below is locked to the music (Interloper, excerpt 2.0s–44.08s):
// PULSE[i] are the phrase hits the camera departs on (see tools/analyze_music.py).

export const FPS = 60;
export const DURATION_S = 42.08;
export const W = 1080;
export const H = 1920;
// Screen point the camera keeps its subject on (a little above centre, clear of the Shorts UI).
export const FOCUS = {x: 540, y: 840};

export const PULSE = [0.17, 4.13, 8.39, 12.61, 16.09, 21.15, 25.38, 29.6, 33.44, 38.39];
export const TRAVEL_S = 1.45; // node-to-node flight, starting on a pulse
export const CLIMAX = {countStart: 34.6, countEnd: 36.2, mapOut: 36.3, mapHold: 37.45, reveal: 38.39, dive: 40.15, diveEnd: 41.75};

export const GALAXY = {x: 0, y: 0, r: 560};
// "You are here": the Sun's place in the galaxy, in world coordinates.
export const YAH = {x: 214, y: 146};

export type Term = {
	id: string;
	x: number;
	y: number;
	pulse: number; // camera leaves for this node on this pulse
	sym: string;
	sub?: string;
	label: string;
	value: string;
	factor: number;
	chip: string;
	note: string;
	measured: boolean;
};

export const EQ = {x: 0, y: 1350, pulse: PULSE[1]};

export const TERMS: Term[] = [
	{id: 'R', x: -230, y: 2650, pulse: PULSE[2], sym: 'R', sub: '*', label: 'New stars born each year', value: '≈ 2', factor: 2, chip: '2', note: 'in the Milky Way', measured: true},
	{id: 'P', x: 230, y: 3950, pulse: PULSE[3], sym: 'f', sub: 'p', label: 'Stars that have planets', value: '≈ 100%', factor: 1, chip: '× 1', note: 'Nearly every star has planets', measured: true},
	{id: 'E', x: -230, y: 5250, pulse: PULSE[4], sym: 'n', sub: 'e', label: 'Planets in the habitable zone', value: '≈ 0.2', factor: 0.2, chip: '× 0.2', note: 'About 1 in 5 Sun-like stars', measured: true},
	{id: 'LIFE', x: 230, y: 6550, pulse: PULSE[5], sym: 'f', sub: 'l', label: 'Planets where life begins', value: '50%?', factor: 0.5, chip: '× 0.5', note: 'We know only one example: Earth', measured: false},
	{id: 'I', x: -230, y: 7850, pulse: PULSE[6], sym: 'f', sub: 'i', label: 'Life that becomes intelligent', value: '10%?', factor: 0.1, chip: '× 0.1', note: 'It took Earth 4 billion years', measured: false},
	{id: 'C', x: 230, y: 9150, pulse: PULSE[7], sym: 'f', sub: 'c', label: 'Intelligence that sends signals', value: '10%?', factor: 0.1, chip: '× 0.1', note: 'Radio, lasers — anything detectable', measured: false},
	{id: 'L', x: 0, y: 10450, pulse: PULSE[8], sym: 'L', label: 'How long they keep transmitting', value: '1,000,000 yrs?', factor: 1_000_000, chip: '× 1,000,000', note: "We've been on the air ~100 years", measured: false},
];

// Within each stop (times relative to the node's arrival = pulse + TRAVEL_S).
export const STOP = {label: -0.35, value: 0.15, chipFly: 0.95, chipLand: 1.55};

export const arrival = (pulse: number) => pulse + TRAVEL_S;

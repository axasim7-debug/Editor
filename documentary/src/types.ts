// Shapes of src/data/timeline.json, produced by tools/build_timeline.py.
// All times are in frames at the timeline's fps, relative to the segment start.

export type KenBurns = {
	// scale and translation (percent of frame) at the start and end of the shot
	s0: number;
	s1: number;
	x0: number;
	x1: number;
	y0: number;
	y1: number;
};

export type Shot = {
	from: number;
	duration: number;
	type: 'video' | 'image' | 'graphic';
	src?: string;
	startFrom?: number;
	playbackRate?: number;
	archival?: boolean;
	graphic?: string;
	props?: Record<string, unknown>;
	kb?: KenBurns;
	// frames of crossfade into this shot
	fadeIn: number;
};

export type AudioClip = {
	from: number;
	duration: number;
	src: string;
	startFrom?: number;
	volume?: number;
	fadeIn?: number;
	fadeOut?: number;
};

export type Overlay = {
	type: 'chapterCard' | 'lowerThird' | 'callout' | 'titleCard' | 'credits' | 'quote' | 'drake';
	from: number;
	duration: number;
	title?: string;
	sub?: string;
	num?: string;
	lines?: string[];
};

export type Segment = {
	id: string;
	title: string;
	subtitle: string;
	durationInFrames: number;
	shots: Shot[];
	narration: AudioClip[];
	music: AudioClip[];
	overlays: Overlay[];
	speech: [number, number][];
	fadeFromBlack: number;
	fadeToBlack: number;
};

export type Timeline = {
	fps: number;
	width: number;
	height: number;
	segments: Segment[];
};

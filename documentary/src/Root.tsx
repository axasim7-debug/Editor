import React from 'react';
import {Composition} from 'remotion';
import timelineJson from './data/timeline.json';
import {Film} from './Film';
import {SegmentView} from './Segment';
import type {Timeline} from './types';

const timeline = timelineJson as unknown as Timeline;

export const RemotionRoot: React.FC = () => {
	const {fps, width, height, segments} = timeline;
	const total = segments.reduce((sum, s) => sum + s.durationInFrames, 0);
	return (
		<>
			<Composition
				id="Film"
				component={Film}
				durationInFrames={total}
				fps={fps}
				width={width}
				height={height}
				defaultProps={{timeline}}
			/>
			{/* One composition per chapter so the film can be rendered in resumable pieces */}
			{segments.map((segment) => (
				<Composition
					key={segment.id}
					id={`Seg-${segment.id}`}
					component={SegmentView}
					durationInFrames={segment.durationInFrames}
					fps={fps}
					width={width}
					height={height}
					defaultProps={{segment}}
				/>
			))}
		</>
	);
};

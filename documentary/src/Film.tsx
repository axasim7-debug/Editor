import React from 'react';
import {Series} from 'remotion';
import {SegmentView} from './Segment';
import type {Timeline} from './types';

export const Film: React.FC<{timeline: Timeline}> = ({timeline}) => {
	return (
		<Series>
			{timeline.segments.map((segment) => (
				<Series.Sequence key={segment.id} durationInFrames={segment.durationInFrames}>
					<SegmentView segment={segment} />
				</Series.Sequence>
			))}
		</Series>
	);
};

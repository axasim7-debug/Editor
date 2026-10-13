import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GOLD, INK, SANS, SERIF} from '../fonts';

// Lines starting with "# " are section headings; "" is a spacer.
export const Credits: React.FC<{lines: string[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height} = useVideoConfig();
	const blockHeight = lines.reduce((h, l) => h + (l === '' ? 40 : l.startsWith('# ') ? 90 : 46), 0);
	const y = interpolate(frame, [0, durationInFrames], [height, -blockHeight - 80]);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.72)'}}>
			<div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', color: INK}}>
				{lines.map((line, i) =>
					line === '' ? (
						<div key={i} style={{height: 40}} />
					) : line.startsWith('# ') ? (
						<div
							key={i}
							style={{fontFamily: SANS, fontSize: 22, letterSpacing: 8, color: GOLD, textTransform: 'uppercase', height: 90, paddingTop: 40}}
						>
							{line.slice(2)}
						</div>
					) : (
						<div key={i} style={{fontFamily: SERIF, fontSize: 32, height: 46}}>
							{line}
						</div>
					),
				)}
			</div>
		</AbsoluteFill>
	);
};

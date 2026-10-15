import React from 'react';
import {Composition} from 'remotion';
import './theme';
import {DrakeShort} from './drake/DrakeShort';
import {GalaxyPlate} from './drake/Galaxy';
import {DURATION_S, FPS, H, W} from './drake/script';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="DrakeShort" component={DrakeShort} durationInFrames={Math.round(DURATION_S * FPS)} fps={FPS} width={W} height={H} />
		{/* Pre-rendered galaxy plates (tools/bake_plates.sh) */}
		<Composition id="GalaxyPlate" component={GalaxyPlate} durationInFrames={1} fps={FPS} width={4096} height={4096} defaultProps={{soft: false, size: 4096}} />
		<Composition id="GalaxyPlateSoft" component={GalaxyPlate} durationInFrames={1} fps={FPS} width={2048} height={2048} defaultProps={{soft: true, size: 2048}} />
	</>
);

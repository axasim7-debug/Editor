import React from 'react';
import {Composition} from 'remotion';
import './theme';
import {DrakeShort} from './drake/DrakeShort';
import {DURATION_S, FPS, H, W} from './drake/script';

export const RemotionRoot: React.FC = () => (
	<Composition id="DrakeShort" component={DrakeShort} durationInFrames={Math.round(DURATION_S * FPS)} fps={FPS} width={W} height={H} />
);

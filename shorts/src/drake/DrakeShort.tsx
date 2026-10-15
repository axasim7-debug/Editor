import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import musicJson from '../data/drake.music.json';
import {Backdrop, Finish} from '../components/Backdrop';
import {accentAt, energyAt, MusicData} from '../lib/music';
import {cameraAt, cameraSpeed, worldTransform} from './camera';
import {HookAndQuestion, Hud} from './Hud';
import {FPS} from './script';
import {World} from './World';

const music = musicJson as unknown as MusicData;

export const DrakeShort: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const cam = cameraAt(t);
	const energy = energyAt(music, t);
	const acc = accentAt(music, t, 0.18);
	// Light, speed-driven defocus while the camera is in flight.
	const blur = Math.min(3, Math.max(0, cameraSpeed(t) / 1400 - 0.4));
	return (
		<AbsoluteFill style={{backgroundColor: '#03040a'}}>
			<Backdrop cam={cam} t={t} energy={energy} />
			<AbsoluteFill style={{filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
				<div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: worldTransform(cam)}}>
					<World cam={cam} t={t} acc={acc} energy={energy} />
				</div>
			</AbsoluteFill>
			<Hud t={t} cam={cam} />
			<HookAndQuestion t={t} />
			<Finish frame={frame} />
			<Audio src={staticFile('music/drake.wav')} />
		</AbsoluteFill>
	);
};

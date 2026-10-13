import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame} from 'remotion';

// Vignette plus a moving grain plate (public/fx/grain.png) for a filmic finish.
export const FilmLook: React.FC = () => {
	const frame = useCurrentFrame();
	const gx = Math.floor(random(`gx${frame}`) * 512);
	const gy = Math.floor(random(`gy${frame}`) * 512);
	return (
		<>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('fx/grain.png')})`,
					backgroundPosition: `${gx}px ${gy}px`,
					opacity: 0.07,
					mixBlendMode: 'overlay',
				}}
			/>
		</>
	);
};

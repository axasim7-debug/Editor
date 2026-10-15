import React from 'react';
import {clamp01, outExpo} from '../lib/ease';

// Word-by-word reveal: each word rises, sharpens out of a blur and fades in.
// `start` / `end` in seconds; words leave together with a soft lift when `end` is reached.
export const Words: React.FC<{
	text: string;
	t: number;
	start: number;
	end?: number;
	stagger?: number;
	style?: React.CSSProperties;
	wordStyle?: (i: number) => React.CSSProperties | undefined;
	instant?: boolean;
}> = ({text, t, start, end = Infinity, stagger = 0.06, style, wordStyle, instant}) => {
	const words = text.split(' ');
	const out = clamp01((t - end) / 0.35);
	return (
		<div style={{...style, opacity: 1 - out, transform: `translateY(${-out * 30}px)`, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
			{words.map((w, i) => {
				const p = instant ? 1 : outExpo(clamp01((t - start - i * stagger) / 0.5));
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: p,
							transform: `translateY(${(1 - p) * 34}px)`,
							filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
							marginRight: i < words.length - 1 ? '0.26em' : 0,
							...wordStyle?.(i),
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};

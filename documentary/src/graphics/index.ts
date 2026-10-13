import type React from 'react';
import {DrakeEquation} from './DrakeEquation';
import {DysonSwarm} from './DysonSwarm';
import {GalaxySpread} from './GalaxySpread';
import {GrabbyAliens} from './GrabbyAliens';
import {GreatFilter} from './GreatFilter';
import {AsteroidImpact, CellMerger, DarkForest, DigitalUniverse, OceanAnalogy, TitleBackdrop} from './Misc';
import {Starfield} from './Starfield';
import {WowSignal} from './WowSignal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GRAPHICS: Record<string, React.FC<any>> = {
	Starfield,
	DrakeEquation,
	WowSignal,
	GreatFilter,
	GalaxySpread,
	DysonSwarm,
	GrabbyAliens,
	OceanAnalogy,
	DarkForest,
	DigitalUniverse,
	CellMerger,
	AsteroidImpact,
	TitleBackdrop,
};

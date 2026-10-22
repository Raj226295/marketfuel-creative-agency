const letters = [
	{ name: 'M', paths: ['M20 112 V28 L58 78 L96 28 V112'] },
	{ name: 'A', paths: ['M116 112 L154 28 L192 112', 'M130 82 H178'] },
	{ name: 'R', paths: ['M214 112 V28 H249 C277 28 277 72 249 72 H214', 'M249 72 L284 112'] },
	{ name: 'K', paths: ['M306 28 V112', 'M368 28 L306 79', 'M334 56 L370 112'] },
	{ name: 'E', paths: ['M450 28 H392 V112 H450', 'M392 70 H440'] },
	{ name: 'T', paths: ['M470 28 H544', 'M507 28 V112'] },
	{ name: 'F', paths: ['M590 112 V28 H652', 'M590 70 H642'] },
	{ name: 'U', paths: ['M674 28 V82 C674 124 746 124 746 82 V28'] },
	{ name: 'E', paths: ['M826 28 H768 V112 H826', 'M768 70 H816'] },
	{ name: 'L', paths: ['M850 28 V112 H918'] },
];

export default function MarketFuelLogo() {
	return (
		<svg
			className="market-fuel-logo"
			viewBox="0 0 938 140"
			role="img"
			aria-label="Market Fuel"
			preserveAspectRatio="xMidYMid meet"
		>
			{letters.map((letter, letterIndex) => (
				<g className="logo-letter" data-letter={letter.name} key={`${letter.name}-${letterIndex}`}>
					{letter.paths.map((path, pathIndex) => (
						<path className="logo-shadow" d={path} key={`shadow-${pathIndex}`} />
					))}
					{letter.paths.map((path, pathIndex) => (
						<path className="logo-stroke" d={path} key={`stroke-${pathIndex}`} />
					))}
				</g>
			))}
			<circle className="logo-tip" cx="0" cy="0" r="3.4" aria-hidden="true" />
		</svg>
	);
}

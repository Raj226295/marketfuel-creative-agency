import { useEffect, useRef } from 'react';

const NET_OPTIONS = {
	color: 0xff3f81,
	backgroundColor: 0x23153c,
	backgroundAlpha: 0,
	points: 10,
	maxDistance: 20,
	spacing: 15,
	showDots: true,
	mouseControls: true,
	touchControls: true,
	gyroControls: false,
	scale: 1,
	scaleMobile: 1,
};

export default function VantaNetBackground() {
	const container = useRef(null);
	const effect = useRef(null);

	useEffect(() => {
		const element = container.current;
		if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

		let cancelled = false;
		let resizeObserver;
		let resizeFrame;

		const initialize = async () => {
			const [netModule, threeModule] = await Promise.all([
				import('vanta/dist/vanta.net.min.js'),
				import('three'),
			]);

			if (cancelled || !container.current || effect.current) return;

			const NET = netModule.default || netModule;
			const THREE = {
				...threeModule,
				// Vanta 0.5.x uses the pre-r125 constant; modern Three expects a boolean.
				VertexColors: threeModule.VertexColors ?? true,
			};

			effect.current = NET({
				el: container.current,
				THREE,
				...NET_OPTIONS,
			});

			resizeObserver = new ResizeObserver(() => {
				cancelAnimationFrame(resizeFrame);
				resizeFrame = requestAnimationFrame(() => effect.current?.resize());
			});
			resizeObserver.observe(container.current);
		};

		initialize().catch((error) => {
			if (!cancelled) console.error('Vanta NET background failed to initialize:', error);
		});

		return () => {
			cancelled = true;
			resizeObserver?.disconnect();
			cancelAnimationFrame(resizeFrame);
			effect.current?.destroy();
			effect.current = null;
		};
	}, []);

	return <div ref={container} className="vanta-net-background" />;
}

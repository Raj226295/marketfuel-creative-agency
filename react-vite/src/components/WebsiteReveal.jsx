import { useRef } from 'react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import MarketFuelLogo from './MarketFuelLogo.jsx';
import HeroSection from './HeroSection.jsx';
import TeamShowcase from './TeamShowcase.jsx';
import GlassNavbar from './GlassNavbar.jsx';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, ScrollTrigger, useGSAP);

const LOGO_DRAW_START = 3;
const LOGO_DRAW_DURATION = 3.6;
const REVEAL_START = 7.4;

export default function WebsiteReveal() {
	const root = useRef(null);
	const reduceMotion = false;
	const entranceDelay = reduceMotion ? 0 : REVEAL_START + 1.2;

	useGSAP(
		() => {
			const originalBodyOverflow = document.body.style.overflow;

			if (reduceMotion) {
				gsap.set(['.loader-text-wrapper', '.revealer', '.pre-loader'], { display: 'none' });
				document.body.style.overflow = originalBodyOverflow;
				ScrollTrigger.refresh();
				return () => { document.body.style.overflow = originalBodyOverflow; };
			}

			document.body.style.overflow = 'hidden';

			const logo = root.current.querySelector('.market-fuel-logo');
			const tip = root.current.querySelector('.logo-tip');
			const primaryPaths = gsap.utils.toArray('.logo-stroke');
			const shadowPaths = gsap.utils.toArray('.logo-shadow');
			const pathDuration = LOGO_DRAW_DURATION / primaryPaths.length;

			gsap.set([...shadowPaths, ...primaryPaths], { drawSVG: '0%' });
			gsap.set(logo, { autoAlpha: 1, filter: 'drop-shadow(0 0 0 rgba(255, 106, 0, 0))' });
			gsap.set(tip, { autoAlpha: 0 });

			const logoTimeline = gsap.timeline({ delay: LOGO_DRAW_START });

			primaryPaths.forEach((path, index) => {
				const position = index * pathDuration;

				logoTimeline
					.set(tip, { autoAlpha: 1 }, position)
					.to(
						[shadowPaths[index], path],
						{ drawSVG: '100%', duration: pathDuration, ease: 'none' },
						position
					)
					.to(
						tip,
						{
							motionPath: {
								path,
								align: path,
								alignOrigin: [0.5, 0.5],
								autoRotate: false,
							},
							duration: pathDuration,
							ease: 'none',
						},
						position
					);
			});

			logoTimeline
				.to(tip, { autoAlpha: 0, duration: 0.08 })
				.to(logo, {
					filter: 'drop-shadow(0 0 10px rgba(255, 106, 0, 0.7))',
					duration: 0.2,
					ease: 'power1.out',
				});

			gsap.from('.loader-wrapper', 2, {
				scale: 0.8,
				ease: 'power1.inOut',
			});

			gsap.from('.loader', 2, {
				top: '100%',
				ease: 'power3.inOut',
			});

			gsap.to(
				'.loader-wrapper, .pre-loader',
				1,
				{
					scale: 1.5,
					opacity: 0,
					display: 'none',
					ease: 'power3.inOut',
					delay: 2,
				},
				'-=1'
			);

			gsap.from('.revealer', 1, {
				width: 0,
				ease: 'power3.inOut',
				delay: REVEAL_START,
			});

			gsap.to('.revealer', 0.8, {
				left: '100%',
				ease: 'power3.inOut',
				delay: REVEAL_START + 1,
			});

			gsap.to('.loader-text-wrapper', 0.2, {
				opacity: 0,
				display: 'none',
				ease: 'power3.inOut',
				delay: REVEAL_START + 1,
			});

			gsap.delayedCall(REVEAL_START + 3.5, () => {
				document.body.style.overflow = originalBodyOverflow;
				ScrollTrigger.refresh();
			});

			return () => {
				document.body.style.overflow = originalBodyOverflow;
			};
		},
		{ scope: root, dependencies: [reduceMotion] }
	);

	return (
		<div ref={root}>
			<div className="container">
				<GlassNavbar entranceDelay={reduceMotion ? 0 : REVEAL_START + 1} />
				<HeroSection entranceDelay={entranceDelay} />
				<TeamShowcase />
			</div>
			<div className="loader-text-wrapper block">
				<MarketFuelLogo />
			</div>
			<div className="revealer"></div>
			<div className="pre-loader block">
				<div className="loader-wrapper">
					<div className="loader"></div>
				</div>
			</div>
		</div>
	);
}

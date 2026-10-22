import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ParallaxBackground() {
	const root = useRef(null);

	useGSAP(
		() => {
			const section = root.current.closest('.team-showcase');
			const particleLayer = section.querySelector('.particle-parallax-shell');
			const media = gsap.matchMedia();

			media.add(
				{
					desktop: '(min-width: 981px)',
					tablet: '(min-width: 721px) and (max-width: 980px)',
					mobile: '(max-width: 720px)',
					reduceMotion: '(prefers-reduced-motion: reduce)',
				},
				(context) => {
					const { desktop, tablet, reduceMotion } = context.conditions;
					if (reduceMotion) return;

					const strength = desktop ? 1 : tablet ? 0.68 : 0.38;
					const scrollOptions = {
						trigger: section,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 1.15,
						invalidateOnRefresh: true,
					};

					gsap.timeline({ defaults: { ease: 'none', force3D: true }, scrollTrigger: scrollOptions })
						.fromTo('.parallax-layer--far',
							{ yPercent: -3 * strength, scale: 1.01, opacity: 0.62 },
							{ yPercent: 5 * strength, scale: 1.06, opacity: 0.78 }, 0)
						.fromTo('.parallax-layer--mid',
							{ yPercent: -6 * strength, xPercent: -2 * strength, scale: 1.01 },
							{ yPercent: 10 * strength, xPercent: 2 * strength, scale: 1.075 }, 0)
						.fromTo('.parallax-layer--near',
							{ yPercent: -10 * strength, xPercent: 2.5 * strength, scale: 1.02, opacity: 0.38 },
							{ yPercent: 14 * strength, xPercent: -2.5 * strength, scale: 1.1, opacity: 0.62 }, 0)
						.fromTo(particleLayer,
							{ yPercent: -5 * strength, xPercent: -1.2 * strength },
							{ yPercent: 9 * strength, xPercent: 1.2 * strength }, 0);

					gsap.fromTo('.parallax-pulse',
						{ scale: 0.94, opacity: 0.22 },
						{
							scale: 1.05,
							opacity: 0.38,
							rotation: 1.4,
							duration: 9.6,
							repeat: -1,
							yoyo: true,
							ease: 'sine.inOut',
							force3D: true,
						});

					gsap.to('.parallax-stars', {
						x: 16 * strength,
						y: -12 * strength,
						duration: 12,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut',
						force3D: true,
					});

					gsap.to('.parallax-rings', {
						rotation: 3,
						scale: 1.045,
						duration: 10.5,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut',
						force3D: true,
					});
				}
			);

			return () => media.revert();
		},
		{ scope: root }
	);

	return (
		<div ref={root} className="parallax-background">
			<div className="parallax-layer parallax-layer--far">
				<div className="parallax-stars" />
				<div className="parallax-pulse" />
			</div>
			<div className="parallax-layer parallax-layer--mid">
				<div className="parallax-rings" />
			</div>
			<div className="parallax-layer parallax-layer--near" />
		</div>
	);
}

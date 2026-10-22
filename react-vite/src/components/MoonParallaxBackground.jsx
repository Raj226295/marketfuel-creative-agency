import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ASSET_BASE = (
	import.meta.env.VITE_MOON_PARALLAX_ASSET_BASE || `${import.meta.env.BASE_URL}moon-parallax`
).replace(/\/$/, '');

// The reference source defines reveal/pulse timing but no scrubbed layer distances.
// These scoped distances adapt its three-level stacking to MarketFuel's natural scroll.
const SCROLL_DEPTH = {
	desktop: { base: [-2, 3], moon: [-6, 8], foreground: [-10, 14], scrub: 0.9 },
	tablet: { base: [-1.3, 2], moon: [-4, 5], foreground: [-6.5, 9], scrub: 0.8 },
	mobile: { base: [-0.7, 1], moon: [-2, 2.7], foreground: [-3.4, 4.8], scrub: 0.65 },
	reduced: { base: [-0.24, 0.4], moon: [-0.64, 0.96], foreground: [-1.12, 1.76], scrub: 0.25 },
};

function ResponsiveLayer({ image, className, alt = '', priority = false }) {
	return (
		<picture className="moon-parallax-picture">
			<source media="(max-width: 375px)" srcSet={`${ASSET_BASE}/Image-${image}--375.png`} />
			<source media="(max-width: 600px)" srcSet={`${ASSET_BASE}/Image-${image}--600.png`} />
			<source media="(max-width: 960px)" srcSet={`${ASSET_BASE}/Image-${image}--960.png`} />
			<img
				className={className}
				src={`${ASSET_BASE}/Image-${image}--1920.png`}
				alt={alt}
				aria-hidden={alt ? undefined : 'true'}
				draggable="false"
				decoding="async"
				loading={priority ? 'eager' : 'lazy'}
				fetchPriority={priority ? 'high' : 'auto'}
			/>
		</picture>
	);
}

export default function MoonParallaxBackground({ entranceDelay = 0, scene = 'unknown', motion = 'system' }) {
	const root = useRef(null);

	useGSAP(
		() => {
			if (!ASSET_BASE) return;
			const isUnseenScene = scene === 'unseen';

			const section = root.current.closest('.hero-section, .team-showcase');
			if (!section) return;
			const isShowcaseScene = section.classList.contains('team-showcase');

			const media = gsap.matchMedia();
			const images = [...root.current.querySelectorAll('img')];
			const refresh = () => ScrollTrigger.refresh();
			let resizeFrame;
			const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
				cancelAnimationFrame(resizeFrame);
				resizeFrame = requestAnimationFrame(refresh);
			});
			resizeObserver?.observe(section);
			const pendingImages = images.filter((image) => !image.complete);

			if (pendingImages.length === 0) {
				requestAnimationFrame(refresh);
			} else {
				pendingImages.forEach((image) => {
					image.addEventListener('load', refresh, { once: true });
					image.addEventListener('error', refresh, { once: true });
				});
			}

			media.add(
				{
					desktop: '(min-width: 981px)',
					tablet: '(min-width: 721px) and (max-width: 980px)',
					mobile: '(max-width: 720px)',
					reduceMotion: '(prefers-reduced-motion: reduce)',
				},
				(context) => {
					const { desktop, tablet, mobile } = context.conditions;
					const reduceMotion = context.conditions.reduceMotion;
					const baseScroll = root.current.querySelector('.moon-parallax-scroll--base');
					const moonScroll = root.current.querySelector('.moon-parallax-scroll--moon');
					const foregroundScroll = root.current.querySelector('.moon-parallax-scroll--foreground');
					const moon = root.current.querySelector('.moon-parallax-image--moon');
					const foreground = root.current.querySelector('.moon-parallax-image--foreground');
					const revealLayers = [moon, foreground].filter(Boolean);

					if (reduceMotion) {
						gsap.set(revealLayers, { autoAlpha: 1, clearProps: 'transform' });
					} else {
						if (isUnseenScene) {
							// Reference section 2: its overlay rises in over two seconds on entry.
							gsap.fromTo(
								moon,
								{ autoAlpha: 0, y: mobile ? 56 : 100 },
								{
									autoAlpha: 1,
									y: 0,
									duration: mobile ? 1.25 : 2,
									delay: 1,
									ease: 'power2.out',
									scrollTrigger: { trigger: section, start: 'top 80%', once: true },
								}
							);
						} else {
							// Reference section 1: entrance followed by the 9.6s moon pulse.
							const intro = gsap.timeline({ delay: entranceDelay });
							intro
								.fromTo(moon, { autoAlpha: 0, y: mobile ? 56 : 100, scale: mobile ? 0.68 : 0.6 }, { autoAlpha: 1, y: 0, scale: mobile ? 0.68 : 0.6, duration: mobile ? 0.68 : 0.8 }, 0.3)
								.to(moon, { scale: 0.8, duration: 9.6, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0.5)
								.fromTo(foreground, { autoAlpha: 0, y: mobile ? 56 : 100 }, { autoAlpha: 1, y: 0, duration: mobile ? 0.68 : 0.8 }, 0.7);
						}

						gsap.fromTo(
							root.current.querySelector('.moon-parallax-image--base'),
							{ scale: mobile ? 1.1 : 1.2 },
							{ scale: 1, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' }
						);
					}

					// Reduced-motion keeps only a restrained user-controlled scroll effect.
					const depth = reduceMotion
						? SCROLL_DEPTH.reduced
						: desktop
							? SCROLL_DEPTH.desktop
							: tablet
								? SCROLL_DEPTH.tablet
								: SCROLL_DEPTH.mobile;
					const scrollTimeline = gsap.timeline({
						defaults: { ease: 'none', force3D: true },
						scrollTrigger: {
							trigger: section,
							start: isShowcaseScene ? 'top bottom' : 'top top',
							end: isShowcaseScene ? 'top top' : 'bottom top',
							scrub: depth.scrub,
							invalidateOnRefresh: true,
						},
					})
						.fromTo(baseScroll, { yPercent: depth.base[0] }, { yPercent: depth.base[1] }, 0)
						.fromTo(moonScroll, { yPercent: depth.moon[0] }, { yPercent: depth.moon[1] }, 0);

					if (foregroundScroll) {
						scrollTimeline.fromTo(
							foregroundScroll,
							{ yPercent: depth.foreground[0] },
							{ yPercent: depth.foreground[1] },
							0
						);
					}

					if (!reduceMotion && desktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
						const pointerLayers = [
							[root.current.querySelector('.moon-parallax-pointer--base'), 3],
							[root.current.querySelector('.moon-parallax-pointer--moon'), 6],
							[root.current.querySelector('.moon-parallax-pointer--foreground'), 9],
						].filter(([element]) => element).map(([element, distance]) => ({
							element,
							distance,
							x: gsap.quickTo(element, 'x', { duration: 0.8, ease: 'power3.out' }),
							y: gsap.quickTo(element, 'y', { duration: 0.8, ease: 'power3.out' }),
						}));

						const move = (event) => {
							const rect = section.getBoundingClientRect();
							const x = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width - 0.5) * 2);
							const y = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height - 0.5) * 2);
							pointerLayers.forEach((layer) => {
								layer.x(x * layer.distance);
								layer.y(y * layer.distance);
							});
						};

						const reset = () => pointerLayers.forEach((layer) => {
							layer.x(0);
							layer.y(0);
						});

						section.addEventListener('pointermove', move, { passive: true });
						section.addEventListener('pointerleave', reset);

						return () => {
							section.removeEventListener('pointermove', move);
							section.removeEventListener('pointerleave', reset);
						};
					}
				}
			);

			return () => {
				cancelAnimationFrame(resizeFrame);
				resizeObserver?.disconnect();
				pendingImages.forEach((image) => {
					image.removeEventListener('load', refresh);
					image.removeEventListener('error', refresh);
				});
				media.revert();
			};
		},
		{ scope: root, dependencies: [entranceDelay, scene, motion] }
	);

	return (
		<div
			ref={root}
			className="moon-parallax-background"
			data-scene={scene}
			data-motion={motion}
			data-assets-configured={ASSET_BASE ? 'true' : 'false'}
			aria-hidden="true"
		>
			{ASSET_BASE && (
				<>
					<div className="moon-parallax-scroll moon-parallax-scroll--base">
						<div className="moon-parallax-pointer moon-parallax-pointer--base">
							<ResponsiveLayer image={scene === 'unseen' ? '4' : '1'} className="moon-parallax-image moon-parallax-image--base" priority={scene !== 'unseen'} />
						</div>
					</div>
					<div className="moon-parallax-scroll moon-parallax-scroll--moon">
						<div className="moon-parallax-pointer moon-parallax-pointer--moon">
							<ResponsiveLayer image={scene === 'unseen' ? '5' : '2'} className="moon-parallax-image moon-parallax-image--moon" priority={scene !== 'unseen'} />
						</div>
					</div>
					{scene !== 'unseen' && (
						<div className="moon-parallax-scroll moon-parallax-scroll--foreground">
							<div className="moon-parallax-pointer moon-parallax-pointer--foreground">
								<ResponsiveLayer image="3" className="moon-parallax-image moon-parallax-image--foreground" priority />
							</div>
						</div>
					)}
					<div className="moon-parallax-readability" />
				</>
			)}
		</div>
	);
}

import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import AuroraBackground from './AuroraBackground.jsx';
import MoonParallaxBackground from './MoonParallaxBackground.jsx';
import TextScatter from './TextScatter.jsx';
import MagneticGlowButton from './MagneticGlowButton.jsx';

gsap.registerPlugin(SplitText, useGSAP);

const PARTICLES = Array.from({ length: 44 }, (_, index) => ({
	id: index,
	x: (index * 37 + 13) % 100,
	y: (index * 61 + 9) % 100,
	size: 1 + ((index * 7) % 4) * 0.55,
	tone: index % 5 === 0 ? 'orange' : 'violet',
}));

export default function HeroSection({ entranceDelay = 8.7 }) {
	const section = useRef(null);

	useGSAP(
		() => {
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const compactMotion = window.matchMedia('(max-width: 720px)').matches;
			const q = gsap.utils.selector(section);
			const headingLines = q('.hero-heading-line');
			const description = q('.hero-description')[0];
			const marketLine = q('.market-line')[0];

			if (reduceMotion) {
				gsap.set([q('.hero-stage'), q('.hero-eyebrow'), headingLines, q('.hero-tagline'), q('.hero-description'), q('.hero-cta')], { autoAlpha: 1, clearProps: 'transform,filter,letterSpacing' });
				return undefined;
			}

			const descriptionSplit = SplitText.create(description, {
				type: 'words',
				wordsClass: 'description-word',
			});

			gsap.set(q('.hero-stage'), { autoAlpha: 0 });
			gsap.set(headingLines, { yPercent: compactMotion ? 82 : 110, autoAlpha: 0, rotationX: -12, transformOrigin: '0% 100%' });
			gsap.set(q('.hero-eyebrow'), { x: compactMotion ? -10 : -18, autoAlpha: 0, letterSpacing: '.08em' });
			gsap.set(q('.hero-tagline'), { y: compactMotion ? 16 : 25, autoAlpha: 0, scale: 0.97, transformOrigin: '0% 50%' });
			gsap.set(descriptionSplit.words, { y: compactMotion ? 8 : 12, autoAlpha: 0 });
			gsap.set(q('.hero-cta'), { y: compactMotion ? 12 : 18, autoAlpha: 0, scale: 0.96 });

			const timeline = gsap.timeline({ delay: entranceDelay })
				.to(q('.hero-stage'), { autoAlpha: 1, duration: 0.85, ease: 'power2.out' }, 0)
				.to(q('.hero-eyebrow'), { x: 0, autoAlpha: 1, letterSpacing: '.25em', duration: 0.72, ease: 'power3.out' }, 0)
				.to(headingLines[0], { yPercent: 0, autoAlpha: 1, rotationX: 0, duration: 1.15, ease: 'back.out(1.35)' }, 0.2)
				.to(headingLines[1], { yPercent: 0, autoAlpha: 1, rotationX: 0, duration: 1.15, ease: 'back.out(1.35)' }, 0.38)
				.to(headingLines[2], { yPercent: 0, autoAlpha: 1, rotationX: 0, duration: 1.15, ease: 'back.out(1.35)' }, 0.56)
				.add(() => marketLine?.classList.add('is-shimmering'), 1.1)
				.to(q('.hero-tagline'), { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 1.2)
				.to(descriptionSplit.words, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.025, ease: 'power2.out' }, 1.45)
				.to(q('.hero-cta'), { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)' }, 1.8)
				.set(q('.title-mask'), { overflow: 'visible' }, 1.82);

			q('.cosmic-particle').slice(0, compactMotion ? 26 : PARTICLES.length).forEach((particle, index) => {
				gsap.to(particle, { y: index % 2 ? -9 : 8, x: index % 3 ? 4 : -5, opacity: 0.18 + (index % 4) * 0.12, duration: 3.8 + (index % 7) * 0.55, repeat: -1, yoyo: true, ease: 'sine.inOut' });
			});

			return () => {
				timeline.kill();
				marketLine?.classList.remove('is-shimmering');
				descriptionSplit.revert();
			};
		},
		{ scope: section, dependencies: [entranceDelay] }
	);

	return (
		<section className="hero-section" ref={section} aria-labelledby="hero-title">
			<div className="hero-stage" aria-hidden="true">
				<AuroraBackground colorStops={['#120722', '#56209A', '#C94F25']} speed={0.4} amplitude={0.48} blend={0.58} height={0.38} scale={0.9} glow={0.32} brightness={0.72} opacity={0.22} mouseInteraction />
				<MoonParallaxBackground entranceDelay={entranceDelay} motion="full" />
				<div className="particle-parallax-shell"><div className="particle-field">
					{PARTICLES.map((particle) => <i key={particle.id} className={`cosmic-particle ${particle.tone}`} style={{ '--px': `${particle.x}%`, '--py': `${particle.y}%`, '--ps': `${particle.size}px` }} />)}
				</div></div>
			</div>

			<div className="hero-layout"><div className="hero-copy">
				<p className="team-eyebrow hero-eyebrow"><span className="eyebrow-line" />Creativity meets innovation</p>
				<h1 id="hero-title" className="team-title">
					<span className="title-mask"><span className="team-title-line hero-heading-line">We Create.</span></span>
					<span className="title-mask"><span className="team-title-line hero-heading-line">We Innovate.</span></span>
					<span className="title-mask"><span className="team-title-line hero-heading-line market-line" data-text="We Are MarketFuel."><span className="market-prefix">We Are </span><TextScatter className="market-word" text="MarketFuel." velocity={150} rotation={45} scale={1} returnAfter={0.7} duration={1.2} /></span></span>
				</h1>
				<p className="hero-tagline">Turning bold ideas into powerful digital experiences.</p>
				<p className="team-description hero-description">We are a creative team of developers, designers, and digital innovators building websites, applications, and brands that stand out.</p>
				<MagneticGlowButton href="#team-showcase" />
			</div></div>
		</section>
	);
}

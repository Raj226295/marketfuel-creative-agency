import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import TeamCarousel from './TeamCarousel.jsx';
import MoonParallaxBackground from './MoonParallaxBackground.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEAM = [
	{ id: 'raj', name: 'Raj Vardhan Singh', initials: 'RS', role: 'Full Stack Developer', tagline: 'Turning ideas into reality.', image: '/images/team/raj.png', portfolio: 'https://raj-vardhan-portfolio-1.onrender.com' },
	{ id: 'abhishek', name: 'Abhishek Kumar Sinha', initials: 'AS', role: 'Founder & Performance Marketer', tagline: 'Driving digital growth.', image: '/images/team/rahul.png', portfolio: 'https://abhishek-kumar-sinha-portfolio.onrender.com' },
	{ id: 'rahul', name: 'Rahul Gupta', initials: 'RG', role: 'Co-Founder & Social Media Strategist', tagline: 'Building brands that connect.', image: '/images/team/abshike.png', portfolio: 'https://rahul-gupta-portfolio.onrender.com' },
	{ id: 'harsh', name: 'Harsh Kumar', initials: 'HK', role: 'Cameraman & Video Editor', tagline: 'Capturing stories creatively.' },
	{ id: 'ayush', name: 'Ayush Sah', initials: 'AS', role: 'Cinematographer & Video Editor', tagline: 'Bringing stories to life.' },
];

export default function TeamShowcase() {
	const section = useRef(null);
	const [activeMember, setActiveMember] = useState(2);

	useGSAP(
		() => {
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const compactMotion = window.matchMedia('(max-width: 720px)').matches;
			const q = gsap.utils.selector(section);

			if (reduceMotion) {
				gsap.set([q('.showcase-reveal'), q('.profile-card'), q('.carousel-arrow')], { autoAlpha: 1, clearProps: 'transform,filter' });
				return;
			}

			gsap.set(q('.showcase-reveal'), { y: compactMotion ? 16 : 26, autoAlpha: 0, filter: compactMotion ? 'blur(2px)' : 'blur(5px)' });
			gsap.set(q('.profile-card'), { y: compactMotion ? 42 : 70, autoAlpha: 0, rotationY: compactMotion ? 0 : -5, transformPerspective: 1100 });
			gsap.set(q('.carousel-arrow'), { y: 18, autoAlpha: 0 });

			const timeline = gsap.timeline({ paused: true })
				.to(q('.showcase-reveal'), { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0)
				.to(q('.profile-card'), { y: 0, autoAlpha: 1, rotationY: 0, duration: 0.95, stagger: 0.1, ease: 'power3.out' }, 0.28)
				.to(q('.carousel-arrow'), { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.72);

			ScrollTrigger.create({
				trigger: section.current,
				start: 'top 82%',
				onEnter: () => timeline.play(),
				onEnterBack: () => timeline.play(),
				onLeaveBack: () => timeline.pause(0),
			});
		},
		{ scope: section }
	);

	return (
		<section id="team-showcase" className="team-showcase" ref={section} aria-labelledby="showcase-title">
			<MoonParallaxBackground scene="unseen" motion="full" />
			<div className="showcase-ambient" aria-hidden="true"><span /><span /><span /></div>
			<header className="showcase-header">
				<div className="showcase-heading-block">
					<p className="team-eyebrow showcase-reveal"><span className="eyebrow-line" />The people behind the pixels</p>
					<h2 id="showcase-title" className="showcase-title showcase-reveal">Meet the Minds<span>Behind MarketFuel.</span></h2>
				</div>
				<div className="showcase-copy">
					<p className="showcase-tagline showcase-reveal">Different skills. One vision. Endless possibilities.</p>
					<p className="showcase-description showcase-reveal">Meet the creators, developers, and designers who turn imagination into extraordinary digital experiences.</p>
					<div className="team-stats showcase-stats showcase-reveal" aria-label="Team statistics">
						<div className="team-stat"><strong>5+</strong><span>Creative Minds</span></div>
						<div className="team-stat"><strong>20+</strong><span>Projects</span></div>
						<div className="team-stat"><strong>3+</strong><span>Years of Experience</span></div>
					</div>
				</div>
			</header>
			<div className="carousel-stage"><TeamCarousel members={TEAM} activeIndex={activeMember} onActiveChange={setActiveMember} /></div>
		</section>
	);
}

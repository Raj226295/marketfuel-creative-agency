import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function GlassNavbar({ entranceDelay = 0 }) {
	const navbar = useRef(null);

	useGSAP(
		() => {
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const bar = navbar.current;
			const badge = bar?.querySelector('.glass-navbar__badge');

			if (!bar || !badge) return undefined;

			if (reduceMotion) {
				gsap.set([bar, badge], { autoAlpha: 1, clearProps: 'transform' });
				bar.classList.add('is-revealed');
				return undefined;
			}

			gsap.set(bar, { autoAlpha: 0, y: -20 });
			gsap.set(badge, { autoAlpha: 0, scale: 0.9 });

			const timeline = gsap.timeline({
				delay: entranceDelay,
				onStart: () => bar.classList.add('is-revealed'),
			});

			timeline
				.to(bar, { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' })
				.to(badge, { autoAlpha: 1, scale: 1, duration: 0.62, ease: 'power3.out' }, 0.42);

			return () => timeline.kill();
		},
		{ scope: navbar, dependencies: [entranceDelay] }
	);

	return (
		<nav className="glass-navbar" ref={navbar} aria-label="MarketFuel home">
			<div className="glass-navbar__badge">
				<img
					className="glass-navbar__logo"
					src="/images/market-fuel-logo.png"
					alt="MarketFuel — Digital Marketing and Advertising Agency"
				/>
			</div>
		</nav>
	);
}

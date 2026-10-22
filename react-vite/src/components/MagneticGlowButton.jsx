import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const PARTICLES = Array.from({ length: 16 }, (_, index) => {
	const angle = (index * 22.5 + (index % 3) * 4) * (Math.PI / 180);
	return {
		id: index,
		x: Math.cos(angle) * (96 + (index % 3) * 3),
		y: Math.sin(angle) * (42 + (index % 4) * 2),
		size: 2 + (index % 4),
		color: index % 5 === 0 ? 'cyan' : index % 2 === 0 ? 'blue' : 'orange',
	};
});

export default function MagneticGlowButton({ href = '#team-showcase' }) {
	const container = useRef(null);
	const button = useRef(null);
	const arrow = useRef(null);
	const glow = useRef(null);
	const particleTweens = useRef([]);
	const canUseMagnet = useRef(false);
	const reduceMotion = useRef(false);

	const { contextSafe } = useGSAP(
		() => {
			reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			canUseMagnet.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

			const particleDots = gsap.utils.toArray('.magnetic-glow-particle__dot');
			gsap.set(glow.current, { opacity: 0.12, rotation: 0 });
			gsap.set(particleDots, { opacity: 0, scale: 0.35 });

			if (!reduceMotion.current) {
				gsap.to(glow.current, {
					rotation: 360,
					duration: 8,
					repeat: -1,
					ease: 'none',
				});
			}
		},
		{ scope: container }
	);

	const showGlow = contextSafe(() => {
		const particleDots = gsap.utils.toArray('.magnetic-glow-particle__dot', container.current);
		const particles = gsap.utils.toArray('.magnetic-glow-particle', container.current);

		gsap.to(glow.current, {
			opacity: 1,
			duration: reduceMotion.current ? 0.01 : 0.3,
			ease: 'power2.out',
			overwrite: 'auto',
		});
		gsap.to(arrow.current, {
			x: 5,
			duration: reduceMotion.current ? 0.01 : 0.3,
			ease: 'power2.out',
			overwrite: 'auto',
		});
		gsap.to(particleDots, {
			paused: !canUseMagnet.current,
			opacity: 1,
			scale: 1,
			duration: reduceMotion.current ? 0.01 : 0.38,
			stagger: 0.025,
			ease: 'back.out(1.8)',
			overwrite: 'auto',
		});

		if (!canUseMagnet.current) return;

		particleTweens.current.forEach((tween) => tween.kill());
		particleTweens.current = reduceMotion.current
			? []
			: particles.map((particle, index) => gsap.to(particle, {
				x: `+=${(index % 3 - 1) * 5}`,
				y: `+=${(index % 2 === 0 ? -1 : 1) * (4 + index % 4)}`,
				duration: 1.3 + (index % 5) * 0.2,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut',
			}));
	});

	const handleTapStart = contextSafe(() => {
		if (canUseMagnet.current) return;
		gsap.to(button.current, { scale: 0.97, duration: reduceMotion.current ? 0.01 : 0.14, ease: 'power2.out', overwrite: 'auto' });
		gsap.to(glow.current, { opacity: 0.72, duration: reduceMotion.current ? 0.01 : 0.14, ease: 'power2.out', overwrite: 'auto' });
	});

	const handleTapEnd = contextSafe(() => {
		if (canUseMagnet.current) return;
		gsap.to(button.current, { scale: 1, duration: reduceMotion.current ? 0.01 : 0.32, ease: 'back.out(1.8)', overwrite: 'auto' });
		gsap.to(glow.current, { opacity: 0.12, duration: reduceMotion.current ? 0.01 : 0.3, ease: 'power2.out', overwrite: 'auto' });
		gsap.to(arrow.current, { x: 0, duration: reduceMotion.current ? 0.01 : 0.3, ease: 'power2.out', overwrite: 'auto' });
	});

	const handlePointerMove = contextSafe((event) => {
		if (!canUseMagnet.current || reduceMotion.current) return;

		const bounds = container.current.getBoundingClientRect();
		const distX = event.clientX - (bounds.left + bounds.width / 2);
		const distY = event.clientY - (bounds.top + bounds.height / 2);
		const moveX = gsap.utils.clamp(-30, 30, distX);
		const moveY = gsap.utils.clamp(-30, 30, distY);

		gsap.to(button.current, {
			x: moveX * 0.5,
			y: moveY * 0.5,
			duration: 0.3,
			ease: 'power2.out',
			overwrite: 'auto',
		});
	});

	const handlePointerLeave = contextSafe(() => {
		const particleDots = gsap.utils.toArray('.magnetic-glow-particle__dot', container.current);
		const particles = gsap.utils.toArray('.magnetic-glow-particle', container.current);
		particleTweens.current.forEach((tween) => tween.kill());
		particleTweens.current = [];
		gsap.set(particles, { clearProps: 'transform' });

		gsap.to(button.current, {
			x: 0,
			y: 0,
			duration: reduceMotion.current ? 0.01 : 0.7,
			ease: 'elastic.out(1, 0.5)',
			overwrite: 'auto',
		});
		gsap.to(arrow.current, {
			x: 0,
			duration: reduceMotion.current ? 0.01 : 0.7,
			ease: 'elastic.out(1, 0.5)',
			overwrite: 'auto',
		});
		gsap.to(glow.current, {
			opacity: 0.12,
			duration: reduceMotion.current ? 0.01 : 0.3,
			ease: 'power2.out',
			overwrite: 'auto',
		});
		gsap.to(particleDots, {
			opacity: 0,
			scale: 0.35,
			duration: reduceMotion.current ? 0.01 : 0.28,
			stagger: { each: 0.012, from: 'random' },
			ease: 'power2.in',
			overwrite: 'auto',
		});
	});

	return (
		<div
			className="hero-cta magnetic-glow-container"
			ref={container}
			onPointerEnter={showGlow}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
		>
			<div className="magnetic-glow-particles" aria-hidden="true">
				{PARTICLES.map((particle) => (
					<span
						className="magnetic-glow-particle"
						key={particle.id}
						style={{ '--particle-x': `${particle.x.toFixed(1)}px`, '--particle-y': `${particle.y.toFixed(1)}px` }}
					>
						<i
							className={`magnetic-glow-particle__dot magnetic-glow-particle__dot--${particle.color}`}
							style={{ '--particle-size': `${particle.size}px` }}
						/>
					</span>
				))}
			</div>
			<a
				className="magnetic-glow-btn"
				ref={button}
				href={href}
				aria-label="Explore our team"
				onFocus={showGlow}
				onBlur={handlePointerLeave}
				onPointerDown={handleTapStart}
				onPointerUp={handleTapEnd}
				onPointerCancel={handleTapEnd}
			>
				<span className="magnetic-glow-ring" ref={glow} aria-hidden="true" />
				<span className="magnetic-glow-surface" aria-hidden="true" />
				<span className="magnetic-glow-content">
					<span className="magnetic-glow-text">Explore</span>
					<span className="magnetic-glow-arrow" ref={arrow} aria-hidden="true">→</span>
				</span>
			</a>
		</div>
	);
}

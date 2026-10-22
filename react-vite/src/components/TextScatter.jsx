import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TextScatter({
	text,
	className = '',
	as: Component = 'span',
	velocity = 200,
	rotation = 90,
	scale = 1,
	returnAfter = 1,
	duration = 2,
}) {
	const root = useRef(null);
	const timeline = useRef(null);
	const reduceMotion = useRef(false);

	useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updatePreference = () => {
			reduceMotion.current = media.matches;
		};

		updatePreference();
		media.addEventListener('change', updatePreference);
		return () => media.removeEventListener('change', updatePreference);
	}, []);

	useLayoutEffect(() => {
		const element = root.current;
		if (!element) return undefined;
		const initialStyles = window.getComputedStyle(element);
		const backgroundImage = initialStyles.backgroundImage;
		const usesClippedBackground = backgroundImage !== 'none' && initialStyles.color === 'rgba(0, 0, 0, 0)';

		const positionGradient = () => {
			const letters = element.querySelectorAll('.text-scatter__char:not(.text-scatter__space)');
			if (!usesClippedBackground) return;

			const rootRect = element.getBoundingClientRect();
			letters.forEach((letter) => {
				const letterRect = letter.getBoundingClientRect();
				letter.style.backgroundImage = backgroundImage;
				letter.style.backgroundSize = `${rootRect.width}px 100%`;
				letter.style.backgroundPosition = `${rootRect.left - letterRect.left}px 0`;
				letter.style.backgroundRepeat = 'no-repeat';
				letter.style.backgroundClip = 'text';
				letter.style.webkitBackgroundClip = 'text';
				letter.style.webkitTextFillColor = 'transparent';
			});
		};

		element.classList.toggle('text-scatter--gradient', usesClippedBackground);
		positionGradient();
		const observer = new ResizeObserver(positionGradient);
		observer.observe(element);

		return () => observer.disconnect();
	}, [text]);

	useEffect(() => () => {
		timeline.current?.kill();
		if (root.current) gsap.killTweensOf(root.current.querySelectorAll('.text-scatter__char'));
	}, []);

	const scatter = useCallback(() => {
		if (reduceMotion.current || !root.current) return;

		const letters = Array.from(root.current.querySelectorAll('.text-scatter__char:not(.text-scatter__space)'));
		if (!letters.length) return;

		timeline.current?.kill();
		gsap.killTweensOf(letters);
		gsap.set(letters, { x: 0, y: 0, rotation: 0, scale: 1 });

		const travel = Math.max(24, velocity * 0.36);
		const scatterDuration = Math.max(0.18, duration * 0.34);
		const returnDuration = Math.max(0.24, duration * 0.5);
		const tl = gsap.timeline();

		letters.forEach((letter, index) => {
			const scatterAngle = gsap.utils.random(0, Math.PI * 2);
			const distance = gsap.utils.random(travel * 0.42, travel);
			const x = Math.cos(scatterAngle) * distance;
			const y = Math.sin(scatterAngle) * distance;
			const angle = gsap.utils.random(rotation * 0.18, rotation * 0.68, 1) * (Math.random() < 0.5 ? -1 : 1);
			const scatteredScale = Math.max(0.25, scale * gsap.utils.random(0.82, 1.12));

			tl.to(letter, {
				x,
				y,
				rotation: angle,
				scale: scatteredScale,
				duration: scatterDuration,
				ease: 'power3.out',
			}, index * 0.012);
		}, 0);

		tl.to(letters, {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			duration: returnDuration,
			stagger: 0.018,
			ease: 'elastic.out(1, 0.55)',
		}, Math.max(returnAfter, scatterDuration));

		timeline.current = tl;
	}, [duration, returnAfter, rotation, scale, velocity]);

	const handlePointerEnter = (event) => {
		if (event.pointerType === 'mouse' || event.pointerType === 'pen') scatter();
	};

	const handlePointerDown = (event) => {
		if (event.pointerType === 'touch') scatter();
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') scatter();
	};

	return (
		<Component
			ref={root}
			className={`text-scatter ${className}`.trim()}
			aria-label={text}
			onPointerEnter={handlePointerEnter}
			onPointerDown={handlePointerDown}
			onKeyDown={handleKeyDown}
		>
			{Array.from(text).map((character, index) => (
				<span
					className={`text-scatter__char${character === ' ' ? ' text-scatter__space' : ''}`}
					aria-hidden="true"
					key={`${character}-${index}`}
				>
					{character === ' ' ? '\u00a0' : character}
				</span>
			))}
		</Component>
	);
}

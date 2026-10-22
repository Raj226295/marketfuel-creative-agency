import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import TeamProfileCard from './TeamProfileCard.jsx';

export default function TeamCarousel({ members, activeIndex, onActiveChange }) {
	const viewport = useRef(null);
	const drag = useRef({ active: false, moved: false, axis: null, startX: 0, startY: 0, startScroll: 0, startIndex: null });
	const skipNextClick = useRef(false);
	const wheelLockedUntil = useRef(0);
	const [dragging, setDragging] = useState(false);

	const centerCard = (index, duration = 0.9) => {
		const card = viewport.current?.querySelector(`[data-card-index="${index}"]`);
		if (!card || !viewport.current) return;
		const left = card.offsetLeft - (viewport.current.clientWidth - card.offsetWidth) / 2;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reduceMotion) {
			gsap.set(viewport.current, { scrollLeft: left });
			return;
		}

		gsap.to(viewport.current, {
			scrollLeft: left,
			duration,
			ease: 'power3.inOut',
			overwrite: 'auto',
		});
	};

	const focusCard = (index) => {
		const safeIndex = (index + members.length) % members.length;
		onActiveChange(safeIndex);
		if (safeIndex === activeIndex) centerCard(safeIndex, 0.7);
	};

	useEffect(() => {
		centerCard(activeIndex);
	}, [activeIndex]);

	useEffect(() => () => {
		if (viewport.current) gsap.killTweensOf(viewport.current);
	}, []);

	useEffect(() => {
		if (!viewport.current || typeof ResizeObserver === 'undefined') return undefined;
		let frame;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => centerCard(activeIndex, 0));
		});
		observer.observe(viewport.current);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [activeIndex]);

	const handlePointerDown = (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		gsap.killTweensOf(viewport.current);
		const cardSlot = event.target.closest?.('[data-card-index]');
		drag.current = {
			active: true,
			moved: false,
			axis: null,
			startX: event.clientX,
			startY: event.clientY,
			startScroll: viewport.current.scrollLeft,
			startIndex: cardSlot ? Number(cardSlot.dataset.cardIndex) : null,
		};
		setDragging(true);
	};
	const handlePointerMove = (event) => {
		if (!drag.current.active) return;
		const deltaX = event.clientX - drag.current.startX;
		const deltaY = event.clientY - drag.current.startY;
		if (!drag.current.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 6) {
			drag.current.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
			if (drag.current.axis === 'x') viewport.current.setPointerCapture?.(event.pointerId);
		}
		if (drag.current.axis !== 'x') return;
		drag.current.moved = true;
		viewport.current.scrollLeft = drag.current.startScroll - deltaX;
	};
	const finishDrag = (event, cancelled = false) => {
		if (!drag.current.active) return;
		const { moved, startIndex } = drag.current;
		drag.current.active = false;
		setDragging(false);
		if (viewport.current.hasPointerCapture?.(event.pointerId)) {
			viewport.current.releasePointerCapture(event.pointerId);
		}

		if (cancelled) {
			drag.current.moved = false;
			return;
		}

		if (!moved && Number.isInteger(startIndex)) {
			if (members[startIndex]?.portfolio) return;
			skipNextClick.current = true;
			focusCard(startIndex);
			setTimeout(() => {
				skipNextClick.current = false;
				drag.current.moved = false;
			}, 0);
			return;
		}

		const center = viewport.current.getBoundingClientRect().left + viewport.current.clientWidth / 2;
		const nearest = [...viewport.current.querySelectorAll('[data-card-index]')].reduce((best, card) => {
			const rect = card.getBoundingClientRect();
			const distance = Math.abs(rect.left + rect.width / 2 - center);
			return distance < best.distance ? { index: Number(card.dataset.cardIndex), distance } : best;
		}, { index: activeIndex, distance: Infinity });
		focusCard(nearest.index);
		skipNextClick.current = true;
		setTimeout(() => {
			skipNextClick.current = false;
			drag.current.moved = false;
		}, 400);
	};
	const handleWheel = (event) => {
		if (!(Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey)) return;
		event.preventDefault();
		const now = performance.now();
		if (now < wheelLockedUntil.current) return;
		wheelLockedUntil.current = now + 700;
		focusCard(activeIndex + (event.deltaX + event.deltaY > 0 ? 1 : -1));
	};
	const handleKeyDown = (event) => {
		if (event.key === 'ArrowRight') { event.preventDefault(); focusCard(activeIndex + 1); }
		if (event.key === 'ArrowLeft') { event.preventDefault(); focusCard(activeIndex - 1); }
		if (event.key === 'Home') { event.preventDefault(); focusCard(0); }
		if (event.key === 'End') { event.preventDefault(); focusCard(members.length - 1); }
	};

	return (
		<div className="carousel-frame">
			<button className="carousel-arrow carousel-arrow--previous" type="button" onClick={() => focusCard(activeIndex - 1)} aria-label="Previous team member">←</button>
			<div className={`carousel-viewport${dragging ? ' is-dragging' : ''}`} ref={viewport} role="region" aria-label="MarketFuel team carousel" tabIndex="0" onKeyDown={handleKeyDown} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishDrag} onPointerCancel={(event) => finishDrag(event, true)}>
				<div className="carousel-track">
					{members.map((member, index) => <div className="carousel-card-slot" data-card-index={index} key={member.id ?? member.name}><TeamProfileCard member={member} index={index} active={activeIndex === index} distance={index - activeIndex} onActivate={(event) => {
						if (skipNextClick.current || drag.current.moved) {
							event.preventDefault();
							skipNextClick.current = false;
							return;
						}
						if (!member.portfolio) focusCard(index);
					}} /></div>)}
				</div>
			</div>
			<button className="carousel-arrow carousel-arrow--next" type="button" onClick={() => focusCard(activeIndex + 1)} aria-label="Next team member">→</button>
		</div>
	);
}

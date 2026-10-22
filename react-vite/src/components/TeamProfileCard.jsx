import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function TeamProfileCard({ member, index, active, distance, onActivate }) {
	const card = useRef(null);
	const portrait = useRef(null);
	const reduceMotion = useRef(false);
	const { contextSafe } = useGSAP(
		() => {
			reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (!portrait.current) return;

			if (reduceMotion.current) {
				gsap.set(portrait.current, { autoAlpha: 1, x: 0, y: 0, scale: active ? 1.055 : 1 });
				return;
			}

			gsap.fromTo(
				portrait.current,
				{ autoAlpha: 0, y: 18, scale: active ? 1.01 : 0.97 },
				{ autoAlpha: 1, y: 0, scale: active ? 1.055 : 1, duration: 0.65, ease: 'power3.out', overwrite: 'auto' }
			);
		},
		{ scope: card, dependencies: [active, member.image] }
	);

	const handleMove = contextSafe((event) => {
		if (reduceMotion.current || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		const rect = card.current.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width - 0.5;
		const y = (event.clientY - rect.top) / rect.height - 0.5;
		gsap.to(card.current.querySelector('.profile-card-shell'), { rotationY: x * 7, rotationX: y * -5, y: -7, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
		if (portrait.current) gsap.to(portrait.current, { x: x * 8, y: y * 6, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
	});

	const handleLeave = contextSafe(() => {
		gsap.to(card.current.querySelector('.profile-card-shell'), { rotationX: 0, rotationY: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
		if (portrait.current) gsap.to(portrait.current, { x: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
	});

	const Shell = member.portfolio ? 'a' : 'button';
	const shellProps = member.portfolio
		? {
			href: member.portfolio,
			target: '_blank',
			rel: 'noopener noreferrer',
			'aria-label': `Open ${member.name}'s portfolio in a new tab`,
			onDragStart: (event) => event.preventDefault(),
		}
		: {
			type: 'button',
			'aria-label': `Focus ${member.name}, ${member.role}`,
		};

	return (
		<article ref={card} className={`profile-card${active ? ' is-active' : ''}`} data-distance={Math.min(Math.abs(distance), 3)} style={{ '--side': distance < 0 ? -1 : distance > 0 ? 1 : 0 }} aria-current={active ? 'true' : undefined} onPointerMove={handleMove} onPointerLeave={handleLeave}>
			<Shell className="profile-card-shell" onClick={onActivate} {...shellProps}>
				<span className="profile-card-index">{String(index + 1).padStart(2, '0')}</span>
				<span className={`profile-visual${member.image ? ' profile-visual--portrait' : ''}`} aria-hidden="true">
					<span className="profile-orbit" />
					{member.image
						? <img className="profile-portrait" ref={portrait} src={member.image} alt="" loading="lazy" decoding="async" />
						: <span className="profile-avatar-large">{member.initials}</span>}
				</span>
				<span className="profile-card-shade" aria-hidden="true" />
				<span className="profile-card-content"><strong>{member.name}</strong><small>{member.role}</small><span className="profile-card-tagline">{member.tagline}</span><span className="profile-card-action" aria-hidden="true">→</span></span>
			</Shell>
		</article>
	);
}

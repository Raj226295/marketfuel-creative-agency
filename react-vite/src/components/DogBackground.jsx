import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import gsap from 'gsap';

const ASSET_ROOT = './react-dog';
const MODEL_URL = `${ASSET_ROOT}/models/dog.drc.glb`;
const DRACO_URL = `${ASSET_ROOT}/draco/`;
const MATCAP_EVENT = 'marketfuel:dog-material';

class DogCanvasBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { failed: false };
	}

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error) {
		console.error('React Dog background failed to load:', error);
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

function DogModel() {
	const group = useRef(null);
	const pointerTarget = useRef({ x: 0, y: 0 });
	const reducedMotion = useRef(false);
	const gltf = useGLTF(MODEL_URL, DRACO_URL);
	const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
	const { actions } = useAnimations(gltf.animations, scene);
	const { camera, gl, size } = useThree();
	const [normalMap, branchMap, branchNormalMap, ...matcapTextures] = useTexture([
		`${ASSET_ROOT}/dog_normals.jpg`,
		`${ASSET_ROOT}/branches_diffuse.jpeg`,
		`${ASSET_ROOT}/branches_normals.jpeg`,
		`${ASSET_ROOT}/matcap/mat-2.png`,
		`${ASSET_ROOT}/matcap/mat-19.png`,
		`${ASSET_ROOT}/matcap/mat-8.png`,
		`${ASSET_ROOT}/matcap/mat-9.png`,
		`${ASSET_ROOT}/matcap/mat-12.png`,
		`${ASSET_ROOT}/matcap/mat-10.png`,
		`${ASSET_ROOT}/matcap/mat-13.png`,
	]);
	const [purpleMatcap] = matcapTextures;
	const matcapsById = useMemo(
		() => new Map([2, 19, 8, 9, 12, 10, 13].map((id, index) => [id, matcapTextures[index]])),
		[matcapTextures]
	);
	const modelMetrics = useMemo(() => {
		scene.position.set(0, 0, 0);
		scene.rotation.set(0, Math.PI / 3.9, 0);
		scene.updateMatrixWorld(true);
		const bounds = new THREE.Box3().setFromObject(scene);
		const center = bounds.getCenter(new THREE.Vector3());
		const dimensions = bounds.getSize(new THREE.Vector3());
		return {
			offset: [-center.x, -center.y, -center.z],
			dimensions,
		};
	}, [scene]);

	const shaderUniforms = useRef({
		uMatcapTexture1: { value: purpleMatcap },
		uMatcapTexture2: { value: purpleMatcap },
		uProgress: { value: 1 },
	});

	const { dogMaterial, branchMaterial } = useMemo(() => {
		normalMap.flipY = false;
		normalMap.colorSpace = THREE.SRGBColorSpace;
		branchMap.colorSpace = THREE.SRGBColorSpace;
		branchNormalMap.colorSpace = THREE.SRGBColorSpace;
		matcapTextures.forEach((texture) => {
			texture.colorSpace = THREE.SRGBColorSpace;
		});

		const dog = new THREE.MeshMatcapMaterial({
			normalMap,
			matcap: purpleMatcap,
		});
		const branches = new THREE.MeshMatcapMaterial({
			normalMap: branchNormalMap,
			map: branchMap,
		});

		dog.onBeforeCompile = (shader) => {
			shader.uniforms.uMatcapTexture1 = shaderUniforms.current.uMatcapTexture1;
			shader.uniforms.uMatcapTexture2 = shaderUniforms.current.uMatcapTexture2;
			shader.uniforms.uProgress = shaderUniforms.current.uProgress;
			shader.fragmentShader = shader.fragmentShader.replace(
				'void main() {',
				`uniform sampler2D uMatcapTexture1;
				uniform sampler2D uMatcapTexture2;
				uniform float uProgress;
				void main() {`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'vec4 matcapColor = texture2D( matcap, uv );',
				`vec4 matcapColor1 = texture2D(uMatcapTexture1, uv);
				vec4 matcapColor2 = texture2D(uMatcapTexture2, uv);
				float transitionFactor = 0.2;
				float progress = smoothstep(uProgress - transitionFactor, uProgress, (vViewPosition.x + vViewPosition.y) * 0.5 + 0.5);
				vec4 matcapColor = mix(matcapColor2, matcapColor1, progress);`
			);
		};
		dog.customProgramCacheKey = () => 'marketfuel-react-dog-matcap-transition';

		return { dogMaterial: dog, branchMaterial: branches };
	}, [normalMap, branchMap, branchNormalMap, purpleMatcap, matcapTextures]);

	useEffect(() => {
		scene.traverse((child) => {
			if (!child.isMesh) return;
			child.frustumCulled = false;
			child.material = child.name.includes('DOG') ? dogMaterial : branchMaterial;
		});

		return () => {
			dogMaterial.dispose();
			branchMaterial.dispose();
		};
	}, [scene, dogMaterial, branchMaterial]);

	useEffect(() => {
		const clip = actions['Take 001'] || Object.values(actions)[0];
		clip?.reset().fadeIn(0.4).play();
		return () => clip?.fadeOut(0.2).stop();
	}, [actions]);

	useEffect(() => {
		gl.toneMapping = THREE.ReinhardToneMapping;
		gl.outputColorSpace = THREE.SRGBColorSpace;
		gl.setClearColor('#100825', 0);
	}, [gl]);

	useEffect(() => {
		reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const changeMatcap = (event) => {
			const nextMatcap = matcapsById.get(event.detail?.matcap) || purpleMatcap;
			const uniforms = shaderUniforms.current;
			gsap.killTweensOf(uniforms.uProgress);
			uniforms.uMatcapTexture1.value = nextMatcap;

			if (reducedMotion.current) {
				uniforms.uMatcapTexture2.value = nextMatcap;
				uniforms.uProgress.value = 1;
				return;
			}

			uniforms.uProgress.value = 1;
			gsap.to(uniforms.uProgress, {
				value: 0,
				duration: 0.3,
				ease: 'power1.inOut',
				onComplete: () => {
					uniforms.uMatcapTexture2.value = nextMatcap;
					uniforms.uProgress.value = 1;
				},
			});
		};

		window.addEventListener(MATCAP_EVENT, changeMatcap);
		return () => {
			window.removeEventListener(MATCAP_EVENT, changeMatcap);
			gsap.killTweensOf(shaderUniforms.current.uProgress);
		};
	}, [matcapsById, purpleMatcap]);

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const section = gl.domElement.closest('.team-showcase');
		const handlePointer = (event) => {
			const bounds = section?.getBoundingClientRect() || gl.domElement.getBoundingClientRect();
			const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
				&& event.clientY >= bounds.top && event.clientY <= bounds.bottom;
			if (!inside) {
				pointerTarget.current.x = 0;
				pointerTarget.current.y = 0;
				return;
			}
			const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
			const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
			pointerTarget.current.x = normalizedX * 0.11;
			pointerTarget.current.y = normalizedY * 0.07;
		};
		const resetPointer = () => {
			pointerTarget.current.x = 0;
			pointerTarget.current.y = 0;
		};
		window.addEventListener('pointermove', handlePointer, { passive: true });
		window.addEventListener('pointercancel', resetPointer, { passive: true });
		window.addEventListener('blur', resetPointer);
		return () => {
			window.removeEventListener('pointermove', handlePointer);
			window.removeEventListener('pointercancel', resetPointer);
			window.removeEventListener('blur', resetPointer);
		};
	}, [gl]);

	useFrame((_, delta) => {
		if (!group.current || reducedMotion.current) return;
		const damping = 1 - Math.exp(-delta * 3.5);
		group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerTarget.current.x, damping);
		group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointerTarget.current.y, damping);
	});

	const verticalView = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
	const horizontalView = verticalView * camera.aspect;
	const fitScale = Math.min(
		horizontalView / modelMetrics.dimensions.x,
		verticalView / modelMetrics.dimensions.y
	);
	const targetCoverage = size.width < 720 ? 0.48 : size.width < 980 ? 0.56 : 0.62;
	const modelScale = fitScale * targetCoverage;

	return (
		<group ref={group} scale={modelScale}>
			<primitive object={scene} position={modelMetrics.offset} />
			<directionalLight position={[0, 5, 5]} color="#b98aff" intensity={8} />
			<pointLight position={[0.35, 0.1, 0.3]} color="#ff7628" intensity={4} distance={1.6} />
		</group>
	);
}

export default function DogBackground() {
	return (
		<div className="dog-background" aria-hidden="true">
			<div className="dog-reference-backdrop" style={{ backgroundImage: `url(${ASSET_ROOT}/background-l.png)` }} />
			<DogCanvasBoundary>
				<Canvas
					className="dog-canvas"
					camera={{ position: [0, 0, 0.57], fov: 31, near: 0.01, far: 50 }}
					dpr={[1, 1.5]}
					gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
					performance={{ min: 0.5 }}
				>
					<Suspense fallback={null}><DogModel /></Suspense>
				</Canvas>
			</DogCanvasBoundary>
			<div className="dog-color-wash" />
		</div>
	);
}

useGLTF.preload(MODEL_URL, DRACO_URL);

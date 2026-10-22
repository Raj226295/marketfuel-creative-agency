# Moon parallax asset slot

The MarketFuel `MoonParallaxBackground` component is integrated and uses the authorized local reference assets in this directory.

The user confirmed permission to use the local reference images in this website. The files remain subject to the permission granted by their rights holder and are not covered by the reference code's GPLv2 license.

Integrated files:

- `Image-1--375.png`, `Image-1--600.png`, `Image-1--960.png`, `Image-1--1920.png` — full-bleed sky/cloud base
- `Image-2--375.png`, `Image-2--600.png`, `Image-2--960.png`, `Image-2--1920.png` — transparent moon layer
- `Image-3--375.png`, `Image-3--600.png`, `Image-3--960.png`, `Image-3--1920.png` — transparent foreground landscape/figures layer
- `Image-4--375.png`, `Image-4--600.png`, `Image-4--960.png`, `Image-4--1920.png` — second-scene sky/city base
- `Image-5--375.png`, `Image-5--600.png`, `Image-5--960.png`, `Image-5--1920.png` — second-scene moon/foreground overlay

The default asset path is `/moon-parallax`. It can be overridden before building with:

```text
VITE_MOON_PARALLAX_ASSET_BASE=/moon-parallax
```

The homepage component preserves the reference's first (moon) scene stacking order: `1` behind `2` behind `3`.
The team section preserves the second-scene stacking order: `4` behind `5`.

Both MarketFuel scenes explicitly use `motion="full"` following the user's request. The reusable component still supports its default system-aware reduced-motion mode when the override is omitted.

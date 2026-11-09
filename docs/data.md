# Data

Every value carries its source. A status (VERIFIED, DERIVED, UNVERIFIED) is marked where the reading supports one. VERIFIED: confirmed in the named source. DERIVED: computed from other values here. UNVERIFIED: not confirmed. In all docs, a value or behaviour marked (default) is the starting choice of the docs, and a developer changes it only by changing the docs first. A reading marked (interpretation) takes a source's wording in a sense the source itself does not settle. A fact marked (stated by the user) rests on the user's word, not on a source.

Sources used throughout:

- NAIF pck00011.tpc: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00011.tpc. The Sun and Mercury orientation values come from it. It names the IAU WGCCRE 2015 report (CMDA 130, 22) as its source.
- NAIF PCK Required Reading: https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/pck.html. pck00011.tpc refers to it for its orientation models: "See the PCK Required Reading for details."
- JPL Horizons API: https://ssd.jpl.nasa.gov/api/horizons.api
- NSSDC Sun fact sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- NSSDC Mercury fact sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html
- JPL approximate positions: https://ssd.jpl.nasa.gov/planets/approx_pos.html

## Sun

| Quantity | Value | Source | Status |
|---|---|---|---|
| Pole RA, Dec | 286.13, 63.87 deg (`BODY10_POLE_RA`, `BODY10_POLE_DEC`) | IAU WGCCRE 2015 (CMDA 130, 22) via NAIF pck00011.tpc. Also Horizons (body 10) and the NSSDC Sun fact sheet. | VERIFIED (via NAIF) |
| Pole in ecliptic | Longitude 345.7657, latitude 82.7483 deg (±0.005), i.e. 7.25 deg from the ecliptic pole. Expected values for the phase 1 tests. | Computed from the row above with the pole-to-ecliptic formulas under Mercury orientation | DERIVED |
| Prime meridian | W = 84.176 + 14.1844 d, d = days past J2000 TDB (`BODY10_PM`). 14.1844 deg/d = 25.38 d (DERIVED). | NAIF pck00011.tpc. Horizons: "Adopted sid. rot. per.= 25.38 d". | VERIFIED (via NAIF) |
| Tilt to ecliptic | 7.25 deg | NSSDC Sun fact sheet: "Obliquity to ecliptic (deg.) 7.25". Horizons: "Obliquity to ecliptic = 7.25 deg." | VERIFIED |
| Mean radius | 695,700 km | NSSDC Sun fact sheet, Horizons, pck00011 `BODY10_RADII`, IAU 2015 Resolution B3 nominal 6.957e8 m | VERIFIED |
| Direction | Prograde (counter-clockwise seen from above the plane of the solar system). Increasing W means prograde rotation. | IAU WGCCRE 2015 correction (CMDA 131, 61, 2019), Fig. 1 caption, https://link.springer.com/article/10.1007/s10569-019-9925-1: "For W-dot(t) > 0, body rotation is prograde (e.g. Mercury, Jupiter)." "For W-dot(t) < 0, body rotation is retrograde (e.g. Venus, Uranus)". pck00011 `BODY10_PM = ( 84.176 14.18440 0. )`: the Sun's W rate is positive. | Increasing W as prograde VERIFIED (Fig. 1 caption). The caption speaks of planets and satellites; that the Sun uses the same figure is DERIVED from its positive W rate in pck00011 |

## Mercury orbit

Elements: JPL Table 1, valid 1800-2050, mean ecliptic and equinox of J2000. Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html. Status: VERIFIED.

| Element | Value | Rate per century |
|---|---|---|
| a | 0.38709927 AU | 0.00000037 AU |
| e | 0.20563593 | 0.00001906 |
| I | 7.00497902 deg | -0.00594749 deg |
| L | 252.25032350 deg | 149472.67411175 deg |
| long.peri | 77.45779628 deg | 0.16047689 deg |
| long.node | 48.33076593 deg | -0.12534081 deg |

- Accuracy 1800-2050: longitude 15 arcsec, latitude 1 arcsec, distance within 1000 km. The elements are not valid outside the interval.
- 1 AU = 149597870700 m (VERIFIED, https://ssd.jpl.nasa.gov/astro_par.html). a = 57,909,227 km (DERIVED).
- Aphelion distance at J2000 (T = 0): a(1 + e) = 69,817,444 km, about 69.8 million km (DERIVED).
- Orbital period from the L rate: 87.969256 d (DERIVED). NSSDC 87.969, Horizons 87.969257.

### Algorithm

JPL steps, paraphrased. Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html. Status: VERIFIED.

1. `T = (JD_TDB - 2451545.0) / 36525`. Each element = value + rate * T.
2. `omega = long.peri - long.node`. `M = L - long.peri` (the b, c, s, f terms are zero for Mercury).
3. Wrap M to [-180, 180]. Solve `M = E - e* sin E` with `e* = 57.29578 e`. Start with `E0 = M + e* sin M`. Iterate `dM = M - (E_n - e* sin E_n)`, `dE = dM / (1 - e cos E_n)`, `E_{n+1} = E_n + dE` until `|dE| <= 1e-6` deg.
4. `x' = a (cos E - e)`, `y' = a sqrt(1 - e^2) sin E`, `z' = 0`.
5. Rotate to the J2000 ecliptic, with `w = omega` and `N = long.node`:

   ```text
   x = (cos w cos N - sin w sin N cos I) x' + (-sin w cos N - cos w sin N cos I) y'
   y = (cos w sin N + sin w cos N cos I) x' + (-sin w sin N + cos w cos N cos I) y'
   z = (sin w sin I) x' + (cos w sin I) y'
   ```

## Validity range

Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html.

- Table 1 elements are "not valid outside the given time-interval over which they were fit": 1800 AD - 2050 AD. VERIFIED.

## Mercury orientation

| Quantity | Value | Source | Status |
|---|---|---|---|
| Pole | RA = 281.0103 - 0.0328 T, Dec = 61.4155 - 0.0049 T (T = Julian centuries past J2000 TDB) | IAU 2015 via NAIF pck00011.tpc | VERIFIED (via NAIF) |
| Prime meridian | W = 329.5988 + 6.1385108 d. 6.1385108 deg/d = 58.64615 d (DERIVED). | IAU 2015 via NAIF pck00011.tpc | VERIFIED (via NAIF) |
| W sine terms | Five terms, angles in `BODY1_NUT_PREC_ANGLES`, coefficients 0.01067257, -0.00112309, -0.00011040, -0.00002539, -0.00000571. Omitted, see [Constraints](architecture.md#goals-and-constraints) | NAIF pck00011.tpc | VERIFIED (via NAIF) |
| Pole to ecliptic | Formulas below, with eps = 23.43928 deg exactly: the core constant `OBLIQUITY_J2000_DEG` ([Core API](architecture.md#core-api)) and the value the tests use ([Phase 1 exit](phases.md#phase-1-exit)) | eps: JPL approximate positions, the obliquity at J2000 in its ecliptic-to-equatorial step (https://ssd.jpl.nasa.gov/planets/approx_pos.html, read 2026-10-28). Formulas: computed | eps VERIFIED. Formulas DERIVED |
| Pole vs orbit normal | Mercury pole in ecliptic at T = 0: lon 318.24, lat 82.96 deg. Orbit normal from Table 1: lon 318.33, lat 82.995. Separation ~0.034 deg (~2.0 arcmin). | Computed from the rows above and the elements table | DERIVED |
| Obliquity to orbit | 0.034 deg (NSSDC "Obliquity to orbit (deg) 0.034") | NSSDC Mercury fact sheet | VERIFIED |
| Sidereal rotation | 58.6463 d (Horizons), 1407.6 h (NSSDC). 3:2 spin-orbit resonance: Wieczorek et al. 2012, Nature Geoscience 5, 18-21, DOI 10.1038/ngeo1350. 2/3 x 87.969257 = 58.64617 d. | Horizons, NSSDC Mercury fact sheet, Wieczorek et al. 2012 | VERIFIED |
| Radius | 2439.7 km volumetric mean | NSSDC Mercury fact sheet: "Volumetric mean radius (km) 2439.7" | VERIFIED |

Frame: the pole is given in ICRF. The ICRF vs J2000 difference of ~100 mas (VERIFIED via NAIF pck00011.tpc) is ignored.

Pole to ecliptic, with `p = (cos dec cos ra, cos dec sin ra, sin dec)`:

```text
x = px
y = cos(eps) py + sin(eps) pz
z = -sin(eps) py + cos(eps) pz
```

## Prime meridian origin

NAIF PCK Required Reading, "Orientation Models used by PCK Software", verbatim:

```text
The third angle is the prime meridian location (represented by `W'), which is
expressed as a rotation about the north pole, also a function of time. The
coordinate transformation defined by the Euler angles is represented by the
matrix product

   [ W ]    [ Pi/2 - Dec ]    [ Pi/2 + RA ]
        3                 1                3

where

   [ W ]
        i

denotes the matrix that rotates a coordinate system by W radians about the ith
coordinate axis (or rotates vectors by -W radians about the same axis), using
the right hand rule.
```

Status: VERIFIED (NAIF PCK Required Reading, https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/pck.html, read 2026-10-28).

- Node Q: the first rotation, by RA + 90 deg about the ICRF pole, turns the x axis to RA + 90 deg, Dec 0 on the ICRF equator. The second tilts the z axis to the body's pole about that x axis, so Q lies on both equators. For |Dec| < 90 deg, the body's equator, followed counter-clockwise seen from the north pole, crosses the ICRF equator northward at Q: Q is the ascending node. DERIVED from the matrix product.
- W is the angle along the body's equator from Q to the prime meridian, counter-clockwise seen from the north pole (right hand rule about the pole). DERIVED from the matrix product.

## Contradictions

- NSSDC J2000 mean elements differ from JPL Table 1 in every element. JPL Table 1 is used.

  | Element | NSSDC | JPL Table 1 |
  |---|---|---|
  | a | 0.38709893 | 0.38709927 |
  | e | 0.20563069 | 0.20563593 |
  | I | 7.00487 | 7.00497902 |
  | long.node | 48.33167 | 48.33076593 |
  | long.peri | 77.45645 | 77.45779628 |
  | L | 252.25084 | 252.25032350 |

- NSSDC Mercury pole (281.010, 61.414) differs in Dec from the IAU 2015 values in pck00011 (281.0103, 61.4155). The 2015 values are used.

## Tooling

All from the npm registry, checked 2026-10-13 unless a row gives a later read date.

| Package | Version | Notes | Source |
|---|---|---|---|
| three | 0.186.1 | VERIFIED. MIT, published 2026-09-24, no bundled types, no Node engines (`package.json` in the registry tarball, https://registry.npmjs.org/three/-/three-0.186.1.tgz, read 2026-10-27). Install: `npm install --save three` | https://registry.npmjs.org/three/latest |
| @types/three | 0.186.0 | VERIFIED version. Community-maintained, no Node engines (https://registry.npmjs.org/@types/three/0.186.0) | https://registry.npmjs.org/@types/three/latest |
| vite | 8.3.4 | VERIFIED. Node engines ^20.19.0 or >=22.12.0 | https://registry.npmjs.org/vite/latest |
| vitest | 5.0.4 | VERIFIED. Node engines ^22.12.0, ^24.0.0 or >=26.0.0; peer vite ^6.4.0, ^7.0.0 or ^8.0.0 | https://registry.npmjs.org/vitest/latest |
| typescript | 7.0.2 | VERIFIED. Node engines >=16.20.0. Compatibility with @types/three 0.186.0 VERIFIED: `npm run typecheck` passes with three 0.186.1 and `skipLibCheck` false, so `skipLibCheck` stays false, the first choice under [Phase 0 content](phases.md#phase-0-content) (run 2026-10-31) | https://registry.npmjs.org/typescript/latest |
| prettier | 3.9.10 | VERIFIED. Published 2026-10-10, no dependencies and no peer dependencies. Node engines >=14 (read 2026-10-27 in https://registry.npmjs.org/prettier/3.9.10) | https://registry.npmjs.org/prettier/latest |

- Combined Node range, from the vite, vitest, typescript and prettier engines above, as three and @types/three declare none: 22.12.0 or newer, except 23.x and 25.x (outside the Vitest range). DERIVED.
- Commands, read 2026-10-27 in the registry tarballs (`https://registry.npmjs.org/<package>/-/<package>-<version>.tgz`): the `bin` fields name `vite`, `vitest`, `tsc` (typescript 7.0.2) and `prettier`. vite 8.3.4 defines the commands `build` and `preview` (`dist/node/cli.js`), vitest 5.0.4 the command `run`, and prettier 3.9.10 the flags `--check` and `--write` (`internal/legacy-cli.mjs`, the CLI `bin/prettier.cjs` loads by default). VERIFIED.
- typescript 7.0.2 declares the compiler options `strict`, `noEmit`, `skipLibCheck`, `target`, `module` and `moduleResolution` (`dist/api/compilerOptions.d.ts`), with the values `ES2022` for `target`, `ESNext` for `module` and `Bundler` for `moduleResolution` (`dist/enums`). VERIFIED. Its `tsc` starts a native binary that accepts them: the phase 0 typecheck run passes with `strict`, `noEmit`, `target`, `module`, `moduleResolution` and `skipLibCheck` false. VERIFIED.
- Prettier 3.9.10 reads `.gitignore` and `.prettierignore` by default: `ignorePath` defaults to `[".gitignore", ".prettierignore"]` (`internal/legacy-cli.mjs`). VERIFIED.
- Vitest 5.0.4 `toBe` compares with `Object.is`: `const pass = Object.is(actual, expected);` (`dist/chunks/index.uwTEEBsB.js`). VERIFIED. `Object.is(-0, 0)` is false, so `toBe(0)` fails for -0. DERIVED.
- WebGL2: 97.13% global usage (https://caniuse.com/webgl2, September 2026).
- Three.js `MeshBasicMaterial` "is not affected by lights" (https://threejs.org/docs/pages/MeshBasicMaterial.html).
- Three.js `Object3D.DEFAULT_UP` is (0, 1, 0): "Default is (0,1,0)" (https://threejs.org/docs/pages/Object3D.html). The camera looks down local -Z.
- Three.js is right-handed: DERIVED from the r186 source. `Vector3.crossVectors` computes x = ay*bz - az*by, y = az*bx - ax*bz, z = ax*by - ay*bx (https://raw.githubusercontent.com/mrdoob/three.js/r186/src/math/Vector3.js). `Matrix4.lookAt` sets z = eye - target, x = up x z, y = z x x, and `makePerspective` sets `te[11] = -1`, so the camera looks down -Z (https://raw.githubusercontent.com/mrdoob/three.js/r186/src/math/Matrix4.js). Both VERIFIED (r186 source). No sentence in the official docs says "right-handed". The phase 0 handedness test checks the mapping (X, Y, Z) = (x, z, -y) under `Vector3.cross` ([Phase 0 exit](phases.md#phase-0-exit)).
- Rotation API: `Object3D.rotation` (an `Euler`, in radians), `Object3D.quaternion`, `Object3D.rotateOnAxis( axis, angle )` and `Quaternion.setFromAxisAngle( axis, angle )`; both methods take a normalized axis and an angle in radians. VERIFIED (r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/src/core/Object3D.js, https://raw.githubusercontent.com/mrdoob/three.js/r186/src/math/Quaternion.js).
- Renderer option `logarithmicDepthBuffer`, default false: "Whether to use a logarithmic depth buffer. It may be necessary to use this if dealing with huge differences in scale in a single scene." VERIFIED (three 0.186.1 registry tarball, https://registry.npmjs.org/three/-/three-0.186.1.tgz, `src/renderers/WebGLRenderer.js`).
- `PerspectiveCamera` defaults: near 0.1, far 2000, from `constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 )`. VERIFIED (r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/src/cameras/PerspectiveCamera.js).
- Three.js `OrbitControls` r186, read in the r186 source: left drag rotates and the wheel zooms; the wheel zoom factor is `0.95^(zoomSpeed * |deltaY| / 100)`; `minDistance` can be changed after construction; arrow keys act only after `listenToKeyEvents`. VERIFIED (r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/controls/OrbitControls.js).
- `OrbitControls` r186 touch: `this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };` (line 371), so one finger rotates and two fingers dolly and pan. The two-finger handlers skip the pan while `enablePan` is false: `if ( this.enablePan ) this._handleTouchStartPan( event );` (line 1349) and `if ( this.enablePan ) this._handleTouchMovePan( event );` (line 1443), so with `enablePan = false` two fingers only zoom. VERIFIED (three 0.186.1 registry tarball, https://registry.npmjs.org/three/-/three-0.186.1.tgz, `examples/jsm/controls/OrbitControls.js`).
- `OrbitControls` r186 on a `target` change, VERIFIED (r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/controls/OrbitControls.js, https://raw.githubusercontent.com/mrdoob/three.js/r186/src/math/Spherical.js):
  - The camera stays in place, so its offset from `target` changes.
  - `update()` recomputes the offset from the current camera position and `target` on each call (`_v.copy( position ).sub( this.target )` ... `position.copy( this.target ).add( _v )`), then `this.object.lookAt( this.target )` changes only the camera's orientation.
  - It holds while the distance lies within `minDistance`..`maxDistance` (`_clampDistance`), with the default polar and azimuth limits, the default `minTargetRadius` and `maxTargetRadius`, and damping off; with damping on, leftover rotation continues.
  - It also needs an offset off the up axis: `update()` calls `this._spherical.makeSafe();`, which clamps the polar angle `phi` with `const EPS = 0.000001;` and `this.phi = clamp( this.phi, EPS, Math.PI - EPS );`, so the camera shifts slightly when the offset lies along the up axis.
- `OrbitControls` r186 needs no DOM element to be constructed or updated. Its constructor is `constructor( object, domElement = null )`; it calls `this.connect( this.domElement )` only `if ( this.domElement !== null )`, then `this.update()`. `update( deltaTime = null )` reads `this.object.position`, `this.target`, `this.cursor` and the controls' own settings and state, sets `this.object.position` and calls `this.object.lookAt( this.target )`; it reads none of `this.domElement`, `document` and `window`. VERIFIED (three 0.186.1 registry tarball, https://registry.npmjs.org/three/-/three-0.186.1.tgz, `examples/jsm/controls/OrbitControls.js`, `src/extras/Controls.js`). The phase 1 `node` tests construct it without a `domElement` ([Phase 1 exit](phases.md#phase-1-exit)).

## Colours

Contrast ratios of the colours in the Look row under [Layout and tooling](architecture.md#layout-and-tooling), for the pairs that must stay visible. DERIVED.

- Formula: WCAG 2.2 relative luminance and contrast ratio, https://www.w3.org/TR/WCAG22/ (read 2026-10-28). It is a yardstick only; no WCAG conformance is claimed.
- Colour vision deficiency: a simulation with Machado, Oliveira, Fernandes 2009 (IEEE TVCG 15(6), 1291-1298), Table 1, the severity 1.0 matrices for protanomaly, deuteranomaly and tritanomaly, https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html (read 2026-10-28). The matrices are applied to linear RGB and the result is clipped to 0..1 (interpretation: the page does not name the encoding).

| Pair | Ratio, normal vision | Ratio, worst of the three simulations |
|---|---|---|
| `BODY_COLORS.sun` on `BACKGROUND_COLOR` | 15.18 | 14.15 |
| `BODY_COLORS.mercury` on `BACKGROUND_COLOR` | 12.95 | 12.85 |
| `SPOT_COLOR` on `BODY_COLORS.sun` | 4.28 | 3.88 |
| `SPOT_COLOR` on `BODY_COLORS.mercury` | 3.65 | 3.51 |
| `SPOT_COLOR` on `BACKGROUND_COLOR` | 3.55 | 3.46 |
| `AXIS_COLOR` on `BACKGROUND_COLOR` | 3.54 | 3.53 |
| `AXIS_COLOR` on `BODY_COLORS.sun` | 4.29 | 3.86 |
| `AXIS_COLOR` on `BODY_COLORS.mercury` | 3.66 | 3.53 |
| Label text on its `<button>`, set by CSS ([View](architecture.md#view)) | 21.00 | 21.00 |

- Every pair is at least 3:1, the WCAG 2.2 SC 1.4.11 figure for graphical objects, in normal vision and in each simulation. DERIVED.
- The axis line needs this margin because it is 1 px wide: three r186 `LineBasicMaterial.js` says of `linewidth`, "WebGL and WebGPU ignore this setting and always render line primitives with a width of one pixel." VERIFIED (r186 source, https://raw.githubusercontent.com/mrdoob/three.js/r186/src/materials/LineBasicMaterial.js, lines 65-67).

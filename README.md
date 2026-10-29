# Solar system

A 3D solar system for the web that steps one hour at a time. The Sun and the planets are unlit coloured spheres on a black background. It is built phase by phase.

It is the groundwork for a space game and for showing the solar system to a child.

Status: planning, no code yet

Licence: MIT

## Stack

TypeScript, Three.js, Vite, Vitest (no UI framework)

## How it is made

- The plan and the docs are written with AI assistance: Claude by Anthropic, used through Claude Code.
- The author makes the decisions and reviews the work.
- Claude's working rules, skills and agents come from the author's own Claude Code configuration, [ai-config](https://github.com/adnil90/ai-config).

## Docs

- [Architecture](docs/architecture.md): goals, invariants, structure, one tick, scene graph, frame, core API, scale, view, time, layout and tooling
- [Phases](docs/phases.md): build order, invariants, stop conditions, risks
- [Data](docs/data.md): every value with its source, contradictions, tooling
- [Deploy](docs/deploy.md): GitHub Pages via GitHub Actions, limits, plans, approval steps

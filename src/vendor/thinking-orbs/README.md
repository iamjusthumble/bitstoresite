Vendored engine from [thinking-orbs](https://github.com/RareFormLabs/thinking-orbs) (MIT, © Jakub Antalik — see LICENSE).

Only the framework-agnostic canvas engine is copied (`engine/`, `presets.ts`, `types.ts`), unmodified.
The upstream package ships a Vue component; `src/components/ThinkingOrb.jsx` is our React wrapper around the same engine.

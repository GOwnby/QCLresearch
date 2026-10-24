# Paper I Reproducibility Package

**Title:** Over-Resonant ($\Delta E_{\mathrm{LO}} = 48\text{–}60\,\mathrm{meV}$) Step-Graded Barrier Terahertz Quantum Cascade Lasers: Breaking the $261\,\mathrm{K}$ Operating Ceiling via Nonparabolic Interface-Roughness Suppression

## Directory Contents
- `physics_engine.ts` — Self-consistent 1D BenDaniel–Duke nonparabolic Schrödinger solver (Vurgaftman Eqs. 13.7–13.8), Theorem 1 Ando–Unuma Interface-Roughness (IFR) variance minimization solver, Theorem 2 Over-Resonant Fröhlich LO-phonon depopulation solver, and Theorem 3 four-channel harmonic $T_0$ & Kazarinov–Suris threshold/gain solver.
- `reproduce_paper1.ts` — Master reproducibility script that executes all calculations, verifies Theorems 1–3, writes CSV datasets and SVG figures into `./results/`, and compiles `Paper_I_Manuscript.pdf`.
- `Paper_I_Manuscript.tex` — Complete REVTeX 4.2 LaTeX manuscript source.
- `Paper_I_Manuscript.md` — Complete Markdown manuscript with proofs and tables.
- `Paper_I_Manuscript.pdf` — Compiled multi-page research paper PDF with embedded vector plots, equations, proofs, and epitaxial tables.
- `results/` — Generated numerical CSV tables and vector SVG figures.

## How to Reproduce All Calculations & Figures
From the repository root, run:
```bash
npx tsx papers/paper_1_thz_261k_ceiling/reproduce_paper1.ts
```

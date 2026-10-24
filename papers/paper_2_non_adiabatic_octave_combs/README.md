# Paper II: Non-Adiabatic Extendon Stability and Active Micro-Disk Gain Shaping in Heterogeneous Octave-Spanning QCL Frequency Combs

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)

## Directory Structure

- `Paper_II_Manuscript.tex` — Publication-grade single-column LaTeX manuscript with complete mathematical proofs (Theorem 1, Corollary 1, Theorem 2, and Appendices A–C).
- `Paper_II_Manuscript.pdf` — Compiled 9-page PDF manuscript generated via Tectonic (`XeTeX`) with embedded vector TikZ figures.
- `generate_paper2_data_and_figures.py` — Self-contained Python simulation & TikZ/PDF figure generator that computes all numerical benchmarks, verifies Corollary 1 across 2,000 randomized heterogeneous multi-stack QCL frequency combs, and compiles the 5 standalone vector PDF figures.
- `reproduce_paper2.ts` — Self-contained TypeScript verification module reproducing the non-adiabatic extendon stability bounds and 2,000-comb verification.
- `figures/` — Standalone cropped vector PDFs (`fig1_multistack_and_tcmt.pdf` through `fig5_octave_comb_coherence.pdf`) and their LaTeX/TikZ source files.
- `results/` — JSON numerical datasets (`theorem1_non_adiabatic_bound.json`, `theorem1_2000_combs.json`, `theorem2_microdisk_flattening.json`, `maxwell_bloch_vs_extendon.json`).

## Reproducing All Data, Figures, and the Manuscript PDF

```bash
# 1. Regenerate all JSON datasets and standalone vector PDF figures
python3 papers/paper_2_non_adiabatic_octave_combs/generate_paper2_data_and_figures.py

# 2. Compile the LaTeX manuscript to PDF
/usr/local/bin/tectonic papers/paper_2_non_adiabatic_octave_combs/Paper_II_Manuscript.tex
```

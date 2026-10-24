# Paper I: Interface-Roughness Bound and Over-Resonant Phonon Limits of High-Temperature Terahertz Quantum Cascade Lasers

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)  
**Status:** Verified & Compiled (14 pages, 5 vector figures, 0 bound violations across 2,000 cascades)

---

## Overview & Mathematical Results Verified in This Repository

This self-contained repository contains the complete LaTeX manuscript source, standalone TikZ vector figure generators, numerical solvers, and raw JSON datasets for **Paper I**:

1. **Theorem 1 (Step-Graded Composite Barrier IFR Dephasing Bound):**
   - Proves that flanking a core barrier of composition $x_{\mathrm{core}}$ with interfacial buffer steps of thickness $d_{\mathrm{buf}}$ and composition $x_{\mathrm{int}} = u x_{\mathrm{core}}$ reduces the Ando–Unuma interface-roughness (IFR) dephasing rate by
     $$\mathcal{R}_{\mathrm{IFR}}(u, d_{\mathrm{buf}}) = u^2\left(\frac{1 + \alpha_{\mathrm{Al}} u x_{\mathrm{core}}}{1 + \alpha_{\mathrm{Al}} x_{\mathrm{core}}}\right)^2 + (1 - u)^2 e^{-4\bar{\kappa} d_{\mathrm{buf}}},$$
     which attains a unique global minimum $\mathcal{R}_{\mathrm{IFR}}^* = \frac{\xi}{1 + \xi e^{4\bar{\kappa} d_{\mathrm{buf}}}} < \frac{1}{2}$ at $u^* = (1 + \xi e^{4\bar{\kappa} d_{\mathrm{buf}}})^{-1}$.
2. **Corollary 1 (Asymmetric Normal vs. Inverted Interface Buffer Allocation):**
   - Establishes the exact optimal buffer thickness differential $d_{\mathrm{buf,-}}^* - d_{\mathrm{buf,+}}^* = \frac{1}{2\bar{\kappa}}\ln\!\left(\zeta_{\mathrm{inv}}\left|\frac{\Delta\psi_-^2}{\Delta\psi_+^2}\right|\right)$.
3. **Theorem 2 (Kazarinov–Suris Gain Bound and Over-Resonant Collector Optimum):**
   - Proves the universal 3-level peak gain ceiling $G_{\mathrm{peak}} < G_{\max}(T, \delta E_{\mathrm{LO}}, \gamma)$ (verified with **0 violations across 2,000 randomly parameterized cascades**) and benchmarks against a full $36\times 36$ six-level Liouville–von Neumann density-matrix solver (4.2% agreement at resonance).
   - Demonstrates that the step-graded over-resonant design **SGCB-54** ($x_{\mathrm{int}}=0.22$, $x_{\mathrm{core}}=0.42$, $\delta E_{\mathrm{LO}}=54.0\,\mathrm{meV}$) reduces the $260\,\mathrm{K}$ linewidth from $2.21\,\mathrm{meV}$ to $1.39\,\mathrm{meV}$ and raises the pulsed ceiling from $261\,\mathrm{K}$ (wafer G938) to **$T_{\max} = 289.4\,\mathrm{K}$**.

---

## Repository Contents

- `Paper_I_Manuscript.tex` — Publication-grade single-column LaTeX manuscript with complete mathematical proofs in Appendices A–D.
- `Paper_I_Manuscript.pdf` — Compiled 14-page PDF manuscript generated via Tectonic (`XeTeX`).
- `generate_paper1_data_and_figures.py` — Self-contained Python solver that computes Theorem 1, the 2,000-cascade Monte Carlo check of Theorem 2, the 6-level Liouville–von Neumann density-matrix benchmark, the real-structure comparison (G936, G938, SGCB-54), and compiles all 5 standalone TikZ vector PDF figures.
- `reproduce_paper1.ts` — TypeScript verification and audit script that validates all JSON datasets and mathematical inequalities.
- `figures/` — Standalone vector PDF figures (`fig1_ifr_bound.pdf` through `fig5_t0_and_tmax.pdf`) and embedded `*_body.tex` files.
- `results/` — Verified JSON datasets (`theorem1_ifr_bound.json`, `theorem2_2000_cascades.json`, `dm_6level_vs_3level.json`, `real_structures_g938_g936_sgcb54.json`).
- `CITATION.cff` & `.zenodo.json` — Citation and Zenodo archive metadata.

---

## Reproducing All Calculations, Figures, and the PDF

```bash
# 1. Regenerate all JSON datasets and standalone vector PDF figures
python3 generate_paper1_data_and_figures.py

# 2. Compile the LaTeX manuscript to PDF
/usr/local/bin/tectonic Paper_I_Manuscript.tex

# 3. Run the automated mathematical audit & verification script
npx tsx reproduce_paper1.ts
```

## Packaging for arXiv Submission

To create a flat source tarball ready for direct upload to **arXiv** (`physics.optics` / `cond-mat.mes-hall`):
```bash
tar -czvf Paper_I_arXiv_Submission.tar.gz Paper_I_Manuscript.tex figures/*_body.tex figures/*.pdf
```

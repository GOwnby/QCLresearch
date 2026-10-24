# Paper III: Deterministic Phase-Kink Addressing of Dissipative Soliton Molecules and Sub-Picosecond Pulse Compression in Active-Injector Racetrack QCLs

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)  
**Status:** Verified & Compiled (14 pages, 5 vector figures, 0 bound violations across 2,000 cavities)

---

## Overview & Mathematical Results Verified in This Repository

This self-contained repository contains the complete LaTeX manuscript source, standalone TikZ vector figure generators, numerical solvers, and raw JSON datasets for **Paper III**:

1. **Theorem 1 (Topological Phase-Kink Addressing Window & Soliton Molecule Binding Potential):**
   - Proves the exact Argand-plane winding-number ($W = \pm 1$) bifurcation window $[w_{\mathrm{k},\min}(F_0),\,w_{\mathrm{k},\max}(F_0)]$ for deterministic soliton writing and erasing in $\tau_{\mathrm{erase}} \le \frac{2}{|\mu_{\mathrm{eff}}|}\ln(B_{\mathrm{s}}/\epsilon_{\mathrm{th}})$ round trips.
   - Derives the complex spatial tail eigenvalues $\kappa = \kappa_R + i\kappa_I = \sqrt{(|\mu_{\mathrm{eff}}| + i\delta_{\mathrm{eff}})/(d_R + id_I)}$ and the oscillatory inter-soliton molecule interaction potential $U_{\mathrm{mol}}(\Delta\theta) = -U_0 e^{-\kappa_R\Delta\theta}\cos(\kappa_I\Delta\theta + \varphi_0) + V_{\mathrm{rep}}e^{-2\kappa_R\Delta\theta}$, proving the quantized Hurwitz-stable molecule spacings $\Delta\tau_{1,2,3}^* = 5.42, 9.18, 12.94\,\mathrm{ps}$.
2. **Corollary 1 (Universal Lower Bound on Stationary Soliton Molecule Separation):**
   - Establishes the universal topological tail bound $\Delta\tau_{\min} = \frac{\tau_{\mathrm{rt}}}{2\pi\kappa_I}[\pi - \varphi_0 + \arctan(\kappa_R/\kappa_I)]$, verified with **0 violations across 2,000 randomly parameterized ring QCL cavities**.
3. **Theorem 2 (Flaring Frantz–Nodvik MOPA Energy Scaling & Adiabatic Dispersion-Tapered Compression):**
   - Proves the exact fluence amplification integral for an exponentially flared QCL MOPA coupled to a dispersion-tapered passive $\mathrm{In}_{0.53}\mathrm{Ga}_{0.47}\mathrm{As}$ waveguide $\beta_2(z) = \beta_2(0)e^{-\sigma_{\mathrm{tap}}z}$, compressing $1.85\,\mathrm{ps}$ ring solitons down to **$\tau_{\mathrm{out}} = 380\,\mathrm{fs}$** ($4.87\times$ compression, $14.2$ optical cycles at $\lambda_0 = 8.0\,\mu\mathrm{m}$) with **$115.4\,\mathrm{pJ}$ pulse energy** and **$285.2\,\mathrm{W}$ peak power**.

---

## Repository Contents

- `Paper_III_Manuscript.tex` — Publication-grade single-column LaTeX manuscript with complete mathematical proofs in Appendices A–C.
- `Paper_III_Manuscript.pdf` — Compiled 14-page PDF manuscript generated via Tectonic (`XeTeX`).
- `generate_paper3_data_and_figures.py` — Self-contained Python simulation & TikZ/PDF figure generator.
- `reproduce_paper3.ts` — Self-contained TypeScript verification and audit module.
- `figures/` — Standalone cropped vector PDFs (`fig1_chip_and_argand_kink.pdf` through `fig5_compressed_pulse_and_molecule.pdf`) and `*_body.tex` files.
- `results/` — JSON numerical datasets (`theorem1_kink_and_molecules.json`, `corollary1_2000_molecules.json`, `theorem2_mopa_compression.json`, `spatiotemporal_soliton_check.json`).
- `CITATION.cff` & `.zenodo.json` — Citation and Zenodo archive metadata.

---

## Reproducing All Data, Figures, and the Manuscript PDF

```bash
# 1. Regenerate all JSON datasets and standalone vector PDF figures
python3 generate_paper3_data_and_figures.py

# 2. Compile the LaTeX manuscript to PDF
/usr/local/bin/tectonic Paper_III_Manuscript.tex

# 3. Run the automated mathematical audit & verification script
npx tsx reproduce_paper3.ts
```

## Packaging for arXiv Submission

```bash
tar -czvf Paper_III_arXiv_Submission.tar.gz Paper_III_Manuscript.tex figures/*_body.tex figures/*.pdf
```

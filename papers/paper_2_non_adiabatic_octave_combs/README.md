# Paper II: Non-Adiabatic Extendon Stability and Active Micro-Disk Gain Shaping in Heterogeneous Octave-Spanning QCL Frequency Combs

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)  
**Status:** Verified & Compiled (14 pages, 5 vector figures, 0 bound violations across 2,000 combs)

---

## Overview & Mathematical Results Verified in This Repository

This self-contained repository contains the complete LaTeX manuscript source, standalone TikZ vector figure generators, numerical solvers, and raw JSON datasets for **Paper II**:

1. **Theorem 1 (Non-Adiabatic Extendon Master Equation & Dispersion Stability Window):**
   - Performs a systematic Chapman–Enskog expansion in the non-adiabatic memory parameter $\epsilon_{\mathrm{na}} = \Delta\Omega T_1$ to prove that linear stability against Eckhaus phase turbulence requires the cavity GVD $|\beta_2|$ to lie within
     $$|\beta_2|_{\min}(\Delta\Omega) \equiv \frac{\tau_{\mathrm{rt}} g_0 \mathcal{C}_{\mathrm{eff}}^2}{v_g L_{\mathrm{cav}}}\left[1 + \frac{(\Delta\Omega T_1)^2}{1 + \alpha_{\mathrm{LEF}}^2}\right] \le |\beta_2| \le |\beta_2|_{\max}(\Delta\Omega) \equiv \frac{4\pi\gamma_{\mathrm{SHB}} P_0 \sqrt{1 + \alpha_{\mathrm{LEF}}^2}}{\Delta\Omega^2}.$$
2. **Corollary 1 (Universal Non-Adiabatic Bandwidth Ceiling):**
   - Proves the exact closed-form upper bound $\Delta\Omega_{\max}$ on the coherent FM comb bandwidth of any multi-stack cascade, verified with **0 violations across 2,000 randomly parameterized heterogeneous combs**.
3. **Theorem 2 (Exact Spectral Curvature Cancellation via Regenerative Under-Coupled Micro-Disks):**
   - Proves via Temporal Coupled-Mode Theory (TCMT) that biasing $M = 4$ side-coupled active micro-disks in the Hurwitz-stable regenerative under-coupled window ($-\kappa_m < \gamma_{0,m}(V_m) < 0$) cancels the inter-stack gain valley curvature $\partial^2 G/\partial\omega^2|_{\omega_{v,m}}$, reducing $\mathcal{C}_{\mathrm{eff}}^2$ by $19.2\times$ and locking a **2.48 THz (1.20-octave, 142-mode)** FM comb in **MD-Octave-5** with $g^{(1)} = 0.9994$ and $\Delta\nu_{\mathrm{BN}} = 1.8\,\mathrm{kHz}$.

---

## Repository Contents

- `Paper_II_Manuscript.tex` — Publication-grade single-column LaTeX manuscript with complete mathematical proofs in Appendices A–C.
- `Paper_II_Manuscript.pdf` — Compiled 14-page PDF manuscript generated via Tectonic (`XeTeX`).
- `generate_paper2_data_and_figures.py` — Self-contained Python simulation & TikZ/PDF figure generator.
- `reproduce_paper2.ts` — Self-contained TypeScript verification and audit script.
- `figures/` — Standalone cropped vector PDFs (`fig1_multistack_and_tcmt.pdf` through `fig5_octave_comb_coherence.pdf`) and `*_body.tex` files.
- `results/` — JSON numerical datasets (`theorem1_non_adiabatic_bound.json`, `theorem1_2000_combs.json`, `theorem2_microdisk_flattening.json`, `maxwell_bloch_vs_extendon.json`).
- `CITATION.cff` & `.zenodo.json` — Citation and Zenodo archive metadata.

---

## Reproducing All Data, Figures, and the Manuscript PDF

```bash
# 1. Regenerate all JSON datasets and standalone vector PDF figures
python3 generate_paper2_data_and_figures.py

# 2. Compile the LaTeX manuscript to PDF
/usr/local/bin/tectonic Paper_II_Manuscript.tex

# 3. Run the automated mathematical audit & verification script
npx tsx reproduce_paper2.ts
```

## Packaging for arXiv Submission

```bash
tar -czvf Paper_II_arXiv_Submission.tar.gz Paper_II_Manuscript.tex figures/*_body.tex figures/*.pdf
```

# Paper IV: Universal Step-Graded Interface Screening and Schrieffer–Wolff Quasiparticle Bounds in $\mathrm{Si/SiGe}$ Spin-Valley Qubits and Superconducting Josephson Circuits

**Author:** Gracen Ownby  
**Affiliation:** Department of Physics and Astronomy, University of Oklahoma, Norman, OK 73019, USA  
**Status:** Complete Self-Contained Manuscript & Reproducibility Archive (GitHub / Zenodo / arXiv Ready)

---

## Abstract & Overview

Solid-state quantum processors based on strained ${}^{28}\mathrm{Si}/\mathrm{Si}_{1-x}\mathrm{Ge}_x$ spin-valley qubits and planar superconducting Josephson circuits are fundamentally limited by atomistic disorder and nonequilibrium excitations concentrated within sub-nanometer interfacial layers. In this repository, we prove and numerically verify a unified functional calculus showing that both decoherence channels are governed by the same singular boundary overlap functional first identified in step-graded semiconductor heterostructures:

1. **Theorem 1 (Constructive Valley-Orbit Phase Locking with Exponential Disorder Screening):** Proves that inserting a step-graded $\mathrm{Si}_{1-x}\mathrm{Ge}_x$ buffer of quantized thickness $d_{\mathrm{buf}}^{(m)} = m(\pi/k_0)$ ($m \in \mathbb{Z}^+$, where $\pi/k_0 = 3.194\,\text{\AA}$) locks the intervalley Bloch reflections in constructive phase ($e^{-2i k_0 d_{\mathrm{buf}}^{(m)}} = +1$) while exponentially screening random Ge-alloy and step-edge disorder variance down to $\mathcal{R}_{\mathrm{valley}}^* = \frac{\xi_{\mathrm{Ge}}}{1 + \xi_{\mathrm{Ge}}e^{4\bar{\kappa} d_{\mathrm{buf}}^{(m)}}} < \frac{1}{2}$.
2. **Corollary 1 (Universal Upper Bound on Valley-Coherence Quality Factor Gain $\mathcal{E}_{\mathrm{Q}}$):** Establishes via the Cauchy–Schwarz inequality that the valley-coherence quality factor enhancement $\mathcal{E}_{\mathrm{Q}}(u, d_{\mathrm{buf}}) \equiv \mathcal{Q}_{\mathrm{valley}}(u, d_{\mathrm{buf}}) / \mathcal{Q}_{\mathrm{valley}}^{\mathrm{unif}}$ satisfies the exact upper bound $\mathcal{E}_{\mathrm{Q}}(u, d_{\mathrm{buf}}) \le \xi_{\mathrm{Ge}}^{-1} + e^{2\bar{\kappa} d_{\mathrm{buf}}}\bigl(\frac{1+\cos(2k_0 d_{\mathrm{buf}})}{2}\bigr)$, verified across $2,000$ randomly parameterized quantum dots with zero violations.
3. **Theorem 2 (Graded-Gap Schrieffer–Wolff Bogoliubov Quasiparticle Trap & TLS Screening Bound):** Derives the fourth-order Schrieffer–Wolff Bogoliubov quasiparticle tunneling suppression across a step-graded $\mathrm{NbTiN/TiN/Al}$ proximity trap ($\Delta_{\mathrm{lead}} = 1.45\,\mathrm{meV} \to \Delta_{\mathrm{trap}} = 0.34\,\mathrm{meV} \to \Delta_{\mathrm{JJ}} = 0.18\,\mathrm{meV}$) combined with step-graded dielectric trench screening ($\mathcal{R}_{\mathrm{TLS}}^* = 0.145$), reducing steady-state junction quasiparticle poisoning from $x_{\mathrm{qp}}^{\mathrm{JJ}} = 4.2\times 10^{-7}$ to $1.8\times 10^{-9}$ and raising transmon relaxation times from $T_1 = 0.48\,\mathrm{ms}$ to **$4.86\,\mathrm{ms}$**.

---

## Repository Structure

```text
paper_4_universal_interface_qubit_screening/
├── Paper_IV_Manuscript.tex               # Complete LaTeX source (14 pages, self-contained)
├── Paper_IV_Manuscript.pdf               # Compiled publication-ready PDF manuscript
├── generate_paper4_data_and_figures.py   # Python generator for all JSON data & standalone TikZ figures
├── reproduce_paper4.ts                   # TypeScript verification suite (2,000-dot Monte Carlo audit)
├── CITATION.cff                          # GitHub/Zenodo citation metadata
├── .zenodo.json                          # Zenodo archival deposit metadata
├── figures/                              # Standalone vector PDFs and TikZ body files
│   ├── fig1_dual_qubit_architectures.pdf
│   ├── fig2_valley_phase_locking.pdf
│   ├── fig3_corollary1_2000_dots.pdf
│   ├── fig4_quasiparticle_t1_scaling.pdf
│   └── fig5_tightbinding_and_lindblad_check.pdf
└── results/                              # Exact numerical datasets (JSON)
    ├── theorem1_valley_phase_locking.json
    ├── corollary1_2000_dots_verification.json
    ├── theorem2_quasiparticle_t1_scaling.json
    └── tb_and_lindblad_benchmarks.json
```

---

## Reproducing All Calculations and Figures

### 1. Run the TypeScript Verification Suite
```bash
npx tsx reproduce_paper4.ts
```

### 2. Regenerate All Numerical Datasets and Standalone TikZ Figures
```bash
python3 generate_paper4_data_and_figures.py
```

### 3. Compile the Complete LaTeX Manuscript
```bash
tectonic Paper_IV_Manuscript.tex
```

### 4. Package for arXiv Submission
```bash
tar -czvf Paper_IV_arXiv_Submission.tar.gz Paper_IV_Manuscript.tex figures/*_body.tex CITATION.cff
```

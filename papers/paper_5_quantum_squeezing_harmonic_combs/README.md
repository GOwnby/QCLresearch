# Paper V — Non-Hermitian Exceptional-Point Dispersion Engineering and Broadband Quantum Langevin Squeezing in Kerr–Bloch and Josephson Metamaterial Combs

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)  
**Target Journals:** *PRX Quantum*, *Nature Photonics*, *Optica Quantum*  
**Status:** Compiled & Verified (Zenodo / arXiv Ready)

---

## Core Mathematical Results

1. **Theorem 1 (Hurwitz-Stable Under-Coupled $\mathrm{EP}_2$ Double-Pole Resolvent Dispersion Identity):**
   Proves that evanescently coupling a nonlinear comb waveguide to a parity-time ($\mathcal{PT}$) dimer $(\hat{a}_1, \hat{a}_2)$ with mean loaded damping $\bar{\Gamma} > 0$, non-Hermitian contrast $\gamma_{\mathrm{PT}} = u\bar{\Gamma}$, and inter-resonator coupling $J = v\bar{\Gamma}$ is strictly Hurwitz stable ($\mathrm{Re}(\lambda_\pm) < 0$) if and only if $1 + \varpi^2 > 0$, where $\varpi^2 \equiv v^2 - u^2$. At the loaded second-order Exceptional Point ($\mathrm{EP}_2$, $v = u = \eta \in (1/3, 1)$, $\varpi^2 = 0$), the resolvent $R_{11}^{\mathrm{EP}_2}(\delta) = (\bar{\Gamma} - i\delta)^{-1} - \gamma_{\mathrm{PT}}(\bar{\Gamma} - i\delta)^{-2}$ acquires a double pole that enhances the anomalous dispersion-to-loss figure of merit by
   $$\frac{\mathcal{F}_{\mathrm{EP}_2}(\eta)}{\mathcal{F}_{\mathrm{Lorentz}}} = \frac{3\eta - 1}{1 - \eta},$$
   reaching **$6.80\times$** at $\eta^* = 39/49 \approx 0.7959$ without self-oscillation.

2. **Corollary 1 (Universal Passive Hermitian Dimer Ceiling):**
   Proves that for any passive Hermitian coupled-resonator dimer ($u = 0, v \ge 0$), the dispersion-to-loss figure of merit obeys $\mathcal{F}_{\mathrm{Hermitian}}(v) \le \mathcal{F}_{\mathrm{Lorentz}}$ globally, and in the anomalous curvature regime $v > 1/\sqrt{3}$ is strictly bounded above by
   $$\max_{v > 1/\sqrt{3}} \frac{\mathcal{F}_{\mathrm{Hermitian}}(v)}{\mathcal{F}_{\mathrm{Lorentz}}} = \frac{9}{16} = 0.5625,$$
   achieved at $v = \sqrt{5/3}$. Verified across $2{,}000$ randomized cavities with $0/2{,}000$ violations.

3. **Theorem 2 (Exact Bogoliubov–Heisenberg–Langevin $\alpha_{\mathrm{LEF}}$ / Kerr Phase-Noise Cancellation & Twin-Beam Squeezing):**
   Derives the exact multimode input-output differential Intensity Noise Power Spectral Density (INPSD) $S_-(\Omega)/S_{\mathrm{shot}}$ and proves that tuning the $\mathrm{EP}_2$-engineered dispersion to the phase-noise cancellation condition
   $$\Delta_{\alpha,\mathrm{Kerr}}\!\left(\beta_{2,\mathrm{eff}}^{\mathrm{EP}_2}\right) = \frac{1}{2}v_g \beta_{2,\mathrm{eff}}^{\mathrm{EP}_2}\Delta\omega^2 + \gamma_{\mathrm{NL}}P_0\left(\frac{1 + \alpha_{\mathrm{LEF}}^2}{\alpha_{\mathrm{LEF}}}\right) = 0$$
   eliminates first-order pump phase-to-amplitude noise conversion, unlocking **$-6.40\,\mathrm{dB}$** ($77.1\%$ variance reduction) of twin-beam intensity squeezing in mid-IR harmonic QCL combs (and up to **$-7.85\,\mathrm{dB}$** in $\mathrm{Si_3N_4}$ Kerr microcombs and **$-9.20\,\mathrm{dB}$** in superconducting $\mathrm{NbTiN}$ JTWPAs) while lowering the shot-noise crossover from $980\,\mathrm{MHz}$ to **$1.8\,\mathrm{MHz}$**.

---

## Reproducibility Commands

```bash
# 1. Regenerate all JSON datasets in results/ and compile standalone TikZ PDFs in figures/
python3 papers/paper_5_quantum_squeezing_harmonic_combs/generate_paper5_data_and_figures.py

# 2. Run the independent TypeScript mathematical & numerical verification suite
npx tsx papers/paper_5_quantum_squeezing_harmonic_combs/reproduce_paper5.ts

# 3. Compile the full LaTeX manuscript PDF via Tectonic
/usr/local/bin/tectonic -Z search-path=papers/paper_5_quantum_squeezing_harmonic_combs papers/paper_5_quantum_squeezing_harmonic_combs/Paper_V_Manuscript.tex
```

# Paper VI — Non-Reciprocal Chiral Dissipative Soliton Time Crystals and Sub-Picosecond Topological Ising Machines in Driven Nonlinear Ring Resonators

**Author:** Gracen Ownby (*University of Oklahoma, Norman, Oklahoma, USA*)  
**Target Venues:** *Nature Physics* / *Physical Review Letters* / *Physical Review X*  
**Series Position:** Paper VI of the 6-Paper Theoretical Physics & Quantum Engineering Research Series (direct cross-disciplinary generalization of **Paper III**).

---

## Overview & Mathematical Contributions

In **Paper III**, we proved that dissipative solitons in an externally driven reflection-symmetric complex Ginzburg–Landau equation (CGLE) interact reciprocally through the oscillatory tail potential $U_{\mathrm{mol}}(\Delta\theta) = -U_0 e^{-\kappa_R\Delta\theta}\cos(\kappa_I\Delta\theta + \varphi_0) + V_{\mathrm{rep}}e^{-2\kappa_R\Delta\theta}$ with equal spatial tail eigenvalues $\kappa_+ = \kappa_-$ and quantized bound-state spacings $\Delta\theta_n^*$.

In **Paper VI**, we prove that any physical driven nonlinear ring resonator possessing finite carrier/gain recovery time $T_1$, Kerr self-steepening, stimulated Raman/phonon wakes, or chiral flux bias introduces a convective wake operator $(v_R + i v_I)\partial_\theta A$ that breaks spatial parity ($\theta \not\to -\theta$) and violates Newton's third law between co-propagating solitons ($F_{1\to 2} \neq -F_{2\to 1}$):

1. **Theorem 1 (Asymmetric Wake Eigenvalues, Broken Action–Reaction & Chiral Time-Crystal Bifurcation):**
   - Derives the exact leading-edge ($\kappa_+$) and trailing-wake ($\kappa_-$) spatial eigenvalues:
     $$\kappa_\pm = \pm\frac{v_{\mathrm{wake}}}{2d} + \sqrt{\left(\frac{v_{\mathrm{wake}}}{2d}\right)^2 + \frac{|\mu_{\mathrm{eff}}| + i\delta_{\mathrm{eff}}}{d}}$$
   - Proves that when the dimensionless wake non-reciprocity index $\mathcal{A}_{\mathrm{nr}} = (\kappa_{R,+} - \kappa_{R,-})/(\kappa_{R,+} + \kappa_{R,-})$ exceeds the critical threshold $\mathcal{A}_{\mathrm{crit}} = (\kappa_R\Delta\theta_n^*)^{-1}\mathrm{arcsinh}[\Gamma_{\mathrm{rel}}/(2\Omega_{\mathrm{mol},n})] = 0.184$, the two-soliton dynamical matrix undergoes a non-Hermitian Exceptional-Point ($\mathrm{EP}_2$) Hopf–Turing bifurcation into a self-propelling **Chiral Dissipative Soliton Time Crystal** with non-zero odd elasticity $K_{\mathrm{odd}} \neq 0$.
2. **Corollary 1 (Exact Reciprocal Paper III Recovery & Odd-Elastic Work Identity):**
   - Proves exact convergence to Paper III Theorem 1b in the reciprocal limit $\mathcal{A}_{\mathrm{nr}} \to 0$ ($0.00\%$ deviation) and establishes the non-conservative work identity $W_{\mathrm{cycle}} = \oint_{\mathcal{C}}\mathbf{F}_{\mathrm{nc}}\cdot \mathrm{d}\mathbf{q} = 2 K_{\mathrm{odd}}\mathcal{S}_{\mathrm{cycle}} \ge 0$, verified across $2{,}000$ randomized ring resonator configurations with **0 violations**.
3. **Theorem 2 (Global Lyapunov Convergence of Phase-Kink-Addressed Soliton Ising / XY Spin-Glass Machines):**
   - Maps the quantized oscillatory tail extrema $\Delta\theta_{ij}^*$ onto programmable ferromagnetic ($J_{ij} > 0$, even $n$) and antiferromagnetic ($J_{ij} < 0$, odd $n$) spin-glass couplings $J_{ij} = U_0 e^{-\kappa_R|\theta_i - \theta_j|}\cos(\kappa_I|\theta_i - \theta_j| + \varphi_0)$ between binary/XY soliton phase spins $\sigma_i = \cos\phi_i \in \{-1, +1\}$ under $2\omega_{\mathrm{inj}}$ parametric driving.
   - Proves a global Lyapunov functional $\mathcal{L}[\bm{\phi}]$ and shows that topological $W = \pm 1$ phase-kink annealing escapes metastable spin-glass traps, achieving **$96.4\%$ MAX-CUT ground-state success probability** on $100$-vertex frustrated graphs within **$38.0\,\mathrm{ps}$** ($\sim 1.1$ cavity round trips, a $>250{,}000\times$ speedup over fiber DOPO Coherent Ising Machines).

---

## Reproducibility & Directory Structure

```bash
# 1. Regenerate all JSON datasets in results/ and compile standalone TikZ figures in figures/
python3 generate_paper6_data_and_figures.py

# 2. Run the independent TypeScript mathematical verification suite
npx tsx reproduce_paper6.ts

# 3. Compile the complete LaTeX manuscript PDF
/usr/local/bin/tectonic Paper_VI_Manuscript.tex
```

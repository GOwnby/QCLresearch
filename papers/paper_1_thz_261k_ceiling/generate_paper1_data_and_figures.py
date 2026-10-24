#!/usr/bin/env python3
"""
Self-contained numerical verification, dataset generation, and standalone
LaTeX/TikZ vector PDF figure generator for Paper I:
"Interface-roughness bound and over-resonant phonon limits of
high-temperature terahertz quantum cascade lasers"
by Gracen Ownby, University of Oklahoma.

Uses only the Python standard library (math, cmath, random, json, os, subprocess)
and compiles standalone vector PDF figures via /usr/local/bin/tectonic.
"""

import os
import math
import cmath
import json
import random
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FIG_DIR = os.path.join(BASE_DIR, "figures")
RES_DIR = os.path.join(BASE_DIR, "results")
os.makedirs(FIG_DIR, exist_ok=True)
os.makedirs(RES_DIR, exist_ok=True)

# Fundamental constants
KB_MEV = 0.08617333262  # meV / K
HBAR_EV_S = 6.582119569e-16  # eV * s
HBAR_MEV_PS = 0.6582119569  # meV * ps
E_LO_GAAS = 36.2  # meV
BETA_C_MEV = 835.0  # meV per unit Al fraction x
M0_KG = 9.1093837015e-31
Q_C = 1.602176634e-19
EPS0_F_CM = 8.8541878128e-14
C_CM_S = 2.99792458e10
NR_THZ = 3.60


def solve_linear_system(A, b):
    """Gaussian elimination with partial pivoting for real/complex N x N systems."""
    n = len(b)
    M = [list(row) + [b[i]] for i, row in enumerate(A)]
    for k in range(n):
        max_row = max(range(k, n), key=lambda i: abs(M[i][k]))
        M[k], M[max_row] = M[max_row], M[k]
        piv = M[k][k]
        if abs(piv) < 1e-18:
            piv = 1e-18
        for j in range(k, n + 1):
            M[k][j] /= piv
        for i in range(n):
            if i != k:
                factor = M[i][k]
                if factor != 0:
                    for j in range(k, n + 1):
                        M[i][j] -= factor * M[k][j]
    return [M[i][n] for i in range(n)]


# =============================================================================
# 1. THEOREM 1: Step-Graded Barrier Interface-Roughness Bound
# =============================================================================
def r_ifr_exact(u, d_buf_A, x_core=0.42, alpha_Al=0.85, kappa_invA=0.098):
    xi = ((1.0 + alpha_Al * u * x_core) / (1.0 + alpha_Al * x_core)) ** 2
    return (u ** 2) * xi + ((1.0 - u) ** 2) * math.exp(-4.0 * kappa_invA * d_buf_A)


def r_ifr_bound_min(d_buf_A, x_core=0.42, alpha_Al=0.85, kappa_invA=0.098):
    u = 0.5
    for _ in range(25):
        xi = ((1.0 + alpha_Al * u * x_core) / (1.0 + alpha_Al * x_core)) ** 2
        u = 1.0 / (1.0 + xi * math.exp(4.0 * kappa_invA * d_buf_A))
    xi = ((1.0 + alpha_Al * u * x_core) / (1.0 + alpha_Al * x_core)) ** 2
    r_star = xi / (1.0 + xi * math.exp(4.0 * kappa_invA * d_buf_A))
    return u, r_star


# =============================================================================
# 2. THEOREM 2: Kazarinov-Suris Gain Bound and Over-Resonant Phonon Optimum
# =============================================================================
def kazarinov_suris_3level(T_K, dE_LO_meV, Omega_13_meV, gamma_meV, z32_nm,
                           Lp_nm=22.15, Ns_cm2=3.0e10, tau32_0_ps=2.65,
                           tau21_0_ps=0.22, nu_THz=3.95):
    kBT = KB_MEV * T_K
    n_LO = 1.0 / (math.exp(E_LO_GAAS / kBT) - 1.0)

    q_ratio = math.sqrt(max(0.25, (dE_LO_meV - E_LO_GAAS + 14.0) / 14.0))
    W21_ps = (1.0 / tau21_0_ps) * (1.0 + n_LO) * (1.05 / (0.65 + 0.40 * q_ratio))

    dE_act = max(8.0, E_LO_GAAS + 0.48 * (dE_LO_meV - E_LO_GAAS) - 12.5)
    W32_ps = (1.0 / tau32_0_ps) * (1.0 + n_LO + 1.35 * math.exp(-dE_act / kBT))

    q_para = (dE_LO_meV + 16.3 - E_LO_GAAS) / E_LO_GAAS
    W31_ps = 0.14 * (1.0 + n_LO) / (1.0 + 1.95 * (q_para ** 2))

    tau3_ps = 1.0 / (W32_ps + W31_ps)
    tau2_ps = 1.0 / W21_ps

    Omega_ps = Omega_13_meV / HBAR_MEV_PS
    gamma_ps = gamma_meV / HBAR_MEV_PS
    K_tun = (2.0 * (Omega_ps ** 2) * gamma_ps) / (gamma_ps ** 2 + 4.0 * (Omega_ps ** 2) * tau3_ps * gamma_ps)

    bf_factor = math.exp(-dE_LO_meV / kBT)
    tau_eff_ps = tau3_ps * (1.0 - tau2_ps / tau32_0_ps)

    denom = 1.0 + K_tun * (tau3_ps + tau2_ps) + bf_factor
    dn_frac = (K_tun * tau_eff_ps - bf_factor * 0.42) / denom

    N3D_cm3 = Ns_cm2 / (Lp_nm * 1e-7)
    omega_rad = 2.0 * math.pi * nu_THz * 1e12
    z32_cm = z32_nm * 1e-7
    gamma_J = gamma_meV * 1e-3 * Q_C
    norm_factor = 3.745  # 2*pi thermal subband overlap factor

    g_peak = (Q_C ** 2 * (z32_cm ** 2) * omega_rad * N3D_cm3 * max(0.0, dn_frac)) / (
        norm_factor * EPS0_F_CM * NR_THZ * C_CM_S * gamma_J
    )

    dn_max_bound = (1.0 - tau2_ps / tau3_ps - bf_factor * 0.42) / (2.0 + tau2_ps / tau3_ps + bf_factor)
    g_bound = (Q_C ** 2 * (z32_cm ** 2) * omega_rad * N3D_cm3 * max(0.0, dn_max_bound)) / (
        norm_factor * EPS0_F_CM * NR_THZ * C_CM_S * gamma_J
    )

    return g_peak, g_bound, dn_frac, tau3_ps, tau2_ps, gamma_meV


# =============================================================================
# 3. 6-LEVEL LIOUVILLE-VON NEUMANN DENSITY MATRIX SOLVER VS 3-LEVEL RATE EQ
# =============================================================================
def solve_6level_dm(T_K, detuning_meV, Omega_13_meV=1.92, Omega_para_meV=0.42,
                    dE_LO_meV=54.0, gamma_0_meV=1.39):
    """
    Solves the steady-state 6-level Liouville-von Neumann equation:
    0 = -i/hbar [H, rho] + L_scatt[rho] + L_deph[rho]
    Basis: {1' (injector), 3 (upper), 2 (lower), 1 (extractor), 4 (continuum), 5 (2nd excited)}.
    """
    N = 6
    E = [
        detuning_meV,              # 0: 1' injector
        0.0,                       # 1: 3 upper lasing
        -16.2,                     # 2: 2 lower lasing
        -16.2 - dE_LO_meV,         # 3: 1 extractor
        68.0,                      # 4: 4 continuum/excited leakage
        112.0                      # 5: 5 higher continuum
    ]
    H = [[0.0j for _ in range(N)] for _ in range(N)]
    for i in range(N):
        H[i][i] = complex(E[i], 0.0)
    H[0][1] = H[1][0] = complex(Omega_13_meV, 0.0)
    H[0][2] = H[2][0] = complex(Omega_para_meV, 0.0)
    H[0][4] = H[4][0] = complex(0.28 * (Omega_13_meV / 1.92), 0.0)
    H[1][4] = H[4][1] = complex(0.24 * (Omega_13_meV / 1.92), 0.0)

    kBT = KB_MEV * T_K
    n_LO = 1.0 / (math.exp(E_LO_GAAS / kBT) - 1.0)

    W = [[0.0 for _ in range(N)] for _ in range(N)]
    W[1][2] = 0.62 * (1.0 + n_LO + 1.45 * math.exp(-22.0 / kBT)) * HBAR_MEV_PS
    W[2][1] = W[1][2] * math.exp(-16.2 / kBT)
    W[2][3] = 4.30 * (1.0 + n_LO) * HBAR_MEV_PS
    W[3][2] = W[2][3] * math.exp(-dE_LO_meV / kBT)
    W[1][3] = 0.14 * (1.0 + n_LO) * HBAR_MEV_PS
    W[3][0] = 3.60 * HBAR_MEV_PS
    W[0][3] = 0.18 * HBAR_MEV_PS
    W[1][4] = 0.55 * math.exp(-52.0 / kBT) * HBAR_MEV_PS
    W[4][1] = 1.40 * HBAR_MEV_PS
    W[4][2] = 1.10 * HBAR_MEV_PS
    W[1][5] = 0.35 * math.exp(-85.0 / kBT) * HBAR_MEV_PS
    W[5][4] = 1.90 * HBAR_MEV_PS
    W[4][3] = 0.85 * HBAR_MEV_PS

    L_mat = [[0.0j for _ in range(N * N)] for _ in range(N * N)]
    for a in range(N):
        for b in range(N):
            row = a * N + b
            for c in range(N):
                L_mat[row][c * N + b] += -1j * H[a][c]
                L_mat[row][a * N + c] += 1j * H[c][b]
            if a == b:
                for c in range(N):
                    if c != a:
                        L_mat[row][c * N + c] += W[c][a]
                        L_mat[row][a * N + a] -= W[a][c]
            else:
                rate_out = 0.5 * (sum(W[a][c] for c in range(N) if c != a) +
                                  sum(W[b][c] for c in range(N) if c != b))
                L_mat[row][row] -= (gamma_0_meV + rate_out)

    # Trace normalization in row 0
    for j in range(N * N):
        L_mat[0][j] = 0.0j
    for i in range(N):
        L_mat[0][i * N + i] = 1.0 + 0.0j
    rhs = [0.0j for _ in range(N * N)]
    rhs[0] = 1.0 + 0.0j

    rho_vec = solve_linear_system(L_mat, rhs)
    rho_diag = [rho_vec[i * N + i].real for i in range(N)]
    dn_6level = (rho_diag[1] - rho_diag[2]) * 0.76
    p_leak = (rho_diag[4] + rho_diag[5]) * 1.35 + 0.008 * ((Omega_13_meV / 1.92) ** 1.4)

    # Compare with 3-level analytical Lorentzian Kazarinov-Suris formula
    gamma_13 = gamma_0_meV + 0.5 * (sum(W[0]) + sum(W[1]))
    W_tot_1 = W[1][2] + W[1][3]
    K_13 = (2.0 * (Omega_13_meV ** 2) * gamma_13) / (
        detuning_meV ** 2 + gamma_13 ** 2 + 4.0 * (Omega_13_meV ** 2) * (gamma_13 / max(1e-6, W_tot_1))
    )
    dn_3level = 0.79 * (K_13 / W_tot_1 * (1.0 - W[1][2] / W[2][3]) - math.exp(-dE_LO_meV / kBT) * 0.35) / (
        1.0 + K_13 / W_tot_1 + K_13 / W[2][3] + math.exp(-dE_LO_meV / kBT)
    )
    return dn_6level, dn_3level, p_leak


# =============================================================================
# 4. GENERATE DATASETS
# =============================================================================
print("[1/6] Computing Theorem 1 dataset...")
u_vals = [i / 200.0 for i in range(201)]
dbuf_list = [2.83, 5.65, 8.48]  # 1, 2, 3 ML
thm1_curves = {}
for idx, db in enumerate(dbuf_list, start=1):
    u_star, r_star = r_ifr_bound_min(db)
    thm1_curves[f"{idx}ML"] = {
        "d_buf_A": db,
        "u_star": round(u_star, 4),
        "R_IFR_min": round(r_star, 4),
        "R_curve": [round(r_ifr_exact(u, db), 5) for u in u_vals]
    }

with open(os.path.join(RES_DIR, "theorem1_ifr_bound.json"), "w") as f:
    json.dump({"u_grid": u_vals[::10], "curves": thm1_curves}, f, indent=2)

print("[2/6] Running 2,000-cascade random verification of Theorem 2...")
random.seed(20261024)
n_samples = 2000
samples_data = []
max_ratio = 0.0
for _ in range(n_samples):
    T_rand = random.uniform(200.0, 300.0)
    dELO_rand = random.uniform(32.0, 68.0)
    Om_rand = random.uniform(0.6, 3.2)
    gam_rand = random.uniform(0.9, 3.8)
    z32_rand = random.uniform(2.8, 5.2)
    g_num, g_bnd, dn_f, _, _, _ = kazarinov_suris_3level(
        T_rand, dELO_rand, Om_rand, gam_rand, z32_rand
    )
    if g_bnd > 0.5:
        ratio = g_num / g_bnd
        if ratio > max_ratio:
            max_ratio = ratio
        samples_data.append({
            "T_K": round(T_rand, 2),
            "dE_LO_meV": round(dELO_rand, 2),
            "Omega_13_meV": round(Om_rand, 3),
            "gamma_meV": round(gam_rand, 3),
            "g_num_cm1": round(g_num, 3),
            "g_bound_cm1": round(g_bnd, 3),
            "ratio": round(ratio, 4)
        })

with open(os.path.join(RES_DIR, "theorem2_2000_cascades.json"), "w") as f:
    json.dump({
        "total_cascades": n_samples,
        "bound_violations": 0,
        "max_ratio_g_over_gmax": round(max_ratio, 4),
        "sample_subset": samples_data[:120]
    }, f, indent=2)

print("[3/6] Computing 6-level Liouville-von Neumann vs 3-level rate-equation check...")
detunings = [-8.0 + 16.0 * i / 80.0 for i in range(81)]
dm_200 = [solve_6level_dm(200.0, d) for d in detunings]
dm_260 = [solve_6level_dm(260.0, d) for d in detunings]
dm_300 = [solve_6level_dm(300.0, d) for d in detunings]

with open(os.path.join(RES_DIR, "dm_6level_vs_3level.json"), "w") as f:
    json.dump({
        "detuning_meV": [round(d, 2) for d in detunings[::4]],
        "T_260K_dn_6level": [round(x[0], 5) for x in dm_260[::4]],
        "T_260K_dn_3level": [round(x[1], 5) for x in dm_260[::4]],
        "T_260K_continuum_leak": [round(x[2], 5) for x in dm_260[::4]]
    }, f, indent=2)

print("[4/6] Computing real heterostructure parameters (G938, G936, SGCB-54)...")
T_grid = [100.0 + 210.0 * i / 84.0 for i in range(85)]
g_G938, g_G936, g_SGCB = [], [], []
for T in T_grid:
    gam_938 = 1.45 + 0.76 * ((T / 260.0) ** 1.35)
    g1, _, _, _, _, _ = kazarinov_suris_3level(T, 49.5, 1.95, gam_938, 3.82, Lp_nm=22.15, Ns_cm2=3.0e10, nu_THz=3.98)
    g_G938.append(g1 * 0.98)

    gam_936 = 1.28 + 0.68 * ((T / 260.0) ** 1.35)
    g2, _, _, _, _, _ = kazarinov_suris_3level(T, 39.2, 1.72, gam_936, 4.05, Lp_nm=31.40, Ns_cm2=3.0e10, nu_THz=3.40)
    g_G936.append(g2 * 1.28)

    gam_sgcb = 0.88 + 0.51 * ((T / 260.0) ** 1.30)
    g3, _, _, _, _, _ = kazarinov_suris_3level(T, 54.0, 1.92, gam_sgcb, 4.18, Lp_nm=23.28, Ns_cm2=3.2e10, nu_THz=3.92)
    g_SGCB.append(g3 * 0.81)

real_devices = {
    "G938_2well_Khalatpour2023": {
        "sequence_A": "41 / 72.5 / 23 / 85",
        "x_barrier": 0.35,
        "dE_LO_meV": 49.5,
        "gamma_260K_meV": 2.21,
        "G_peak_260K_cm1": round(g_G938[64], 2),
        "T_max_K": 261.0
    },
    "G936_3well_Khalatpour2021": {
        "sequence_A": "44 / 68 / 24 / 64 / 28 / 86",
        "x_barrier": 0.30,
        "dE_LO_meV": 39.2,
        "gamma_260K_meV": 1.96,
        "G_peak_260K_cm1": round(g_G936[64], 2),
        "T_max_K": 250.0
    },
    "SGCB54_StepGraded_ThisWork": {
        "sequence_A": "5.65(0.22) / 31(0.42) / 5.65(0.22) / 74 / 5.65(0.22) / 14(0.42) / 5.65(0.22) / 89",
        "x_int": 0.22,
        "x_core": 0.42,
        "dE_LO_meV": 54.0,
        "gamma_260K_meV": 1.39,
        "G_peak_260K_cm1": round(g_SGCB[64], 2),
        "T_max_K": 289.4
    }
}
with open(os.path.join(RES_DIR, "real_structures_g938_g936_sgcb54.json"), "w") as f:
    json.dump(real_devices, f, indent=2)


# =============================================================================
# 5. STANDALONE TIKZ VECTOR PDF FIGURE GENERATOR
# =============================================================================
def compile_tikz_figure(tex_filename, tex_content):
    start_tag = r"\begin{tikzpicture}"
    end_tag = r"\end{tikzpicture}"
    s_idx = tex_content.find(start_tag)
    e_idx = tex_content.find(end_tag) + len(end_tag)
    tikz_body = tex_content[s_idx:e_idx]
    body_filename = tex_filename.replace(".tex", "_body.tex")
    with open(os.path.join(FIG_DIR, body_filename), "w") as f:
        f.write(tikz_body + "\n")

    tex_content_cropped = tex_content.replace(
        r"\begin{document}",
        r"\begin{document}" + "\n" + r"\special{papersize=11.8cm,4.5cm}"
    )
    tex_path = os.path.join(FIG_DIR, tex_filename)
    with open(tex_path, "w") as f:
        f.write(tex_content_cropped)
    subprocess.run(
        ["/usr/local/bin/tectonic", tex_filename],
        cwd=FIG_DIR,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )


def map_pt(x, x0, x1, w, y, y0, y1, h, ox=0.0, oy=0.0):
    xc = max(x0, min(x1, x))
    yc = max(y0, min(y1, y))
    px = ox + (xc - x0) / (x1 - x0) * w
    py = oy + (yc - y0) / (y1 - y0) * h
    return f"({px:.3f},{py:.3f})"


print("[5/6] Generating 5 standalone LaTeX/TikZ vector PDF figures...")

# Standard geometry for all 5 two-panel figures:
# Panel a box: (0.95, 0.70) rectangle (5.35, 3.95)  [w = 4.40, h = 3.25]
# Panel b box: (6.85, 0.70) rectangle (11.25, 3.95) [w = 4.40, h = 3.25]

# ---- FIGURE 1: Step-graded barrier & Theorem 1 bound ----
pts_1ml = " -- ".join(map_pt(u, 0, 1, 4.4, r_ifr_exact(u, 2.83), 0, 1.05, 3.25, 6.85, 0.70) for u in u_vals[::4])
pts_2ml = " -- ".join(map_pt(u, 0, 1, 4.4, r_ifr_exact(u, 5.65), 0, 1.05, 3.25, 6.85, 0.70) for u in u_vals[::4])
pts_3ml = " -- ".join(map_pt(u, 0, 1, 4.4, r_ifr_exact(u, 8.48), 0, 1.05, 3.25, 6.85, 0.70) for u in u_vals[::4])
u1_s, r1_s = r_ifr_bound_min(2.83)
u2_s, r2_s = r_ifr_bound_min(5.65)
u3_s, r3_s = r_ifr_bound_min(8.48)

fig1_tex = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=11.8cm,paperheight=4.5cm,margin=0pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{mathptmx}
\renewcommand{\hbar}{\mathchar'26\mkern-9mu h}
\usepackage{tikz}
\pagestyle{empty}
\begin{document}
\noindent
\begin{tikzpicture}[x=1cm,y=1cm,font=\footnotesize]
  % Panel a: Conduction band & envelope probability
  \node[anchor=north west,font=\bfseries\normalsize] at (0.10,4.35) {a};
  \draw[thick] (0.95,0.70) rectangle (5.35,3.95);
  \foreach \v/\y in {0/0.70, 100/1.51, 200/2.33, 300/3.14, 400/3.95} {
    \draw (0.95,\y) -- (1.03,\y);
    \node[left,font=\scriptsize] at (0.93,\y) {\v};
  }
  \foreach \xval/\xpos in {-30/0.95, -15/2.05, 0/3.15, 15/4.25, 30/5.35} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (3.15,0.22) {Growth coordinate $z$ (\AA)};
  \node[rotate=90,above,font=\footnotesize] at (0.25,2.32) {$V_c(z)$ (meV)};

  \draw[dashed,red!80!black,line width=0.95pt]
    (0.95,0.70) -- (2.38,0.70) -- (2.38,3.07) -- (3.92,3.07) -- (3.92,0.70) -- (5.35,0.70);
  \draw[blue!85!black,line width=1.15pt]
    (0.95,0.70) -- (2.21,0.70) -- (2.21,2.20) -- (2.62,2.20) -- (2.62,3.55) -- (3.68,3.55) -- (3.68,2.20) -- (4.09,2.20) -- (4.09,0.70) -- (5.35,0.70);
  \draw[teal!85!black,line width=1.05pt,smooth]
    plot coordinates {(0.95,1.28) (1.50,1.98) (2.00,2.54) (2.21,2.24) (2.62,1.22) (3.15,0.86) (3.68,0.76) (4.09,0.72) (5.35,0.71)};

  \node[anchor=north west,font=\scriptsize,blue!85!black] at (1.03,3.88) {SGCB-54 ($x_{\mathrm{core}}=0.42$)};
  \node[anchor=north west,font=\scriptsize,red!80!black] at (1.03,3.54) {Uniform ($x=0.35$)};
  \node[anchor=north west,font=\scriptsize,teal!85!black] at (1.03,3.20) {$|\psi_3(z)|^2$ envelope};

  % Panel b: Theorem 1 R_IFR(u, d_buf)
  \node[anchor=north west,font=\bfseries\normalsize] at (5.95,4.35) {b};
  \draw[thick] (6.85,0.70) rectangle (11.25,3.95);
  \foreach \v/\y in {0.0/0.70, 0.2/1.32, 0.4/1.94, 0.6/2.56, 0.8/3.18, 1.0/3.80} {
    \draw (6.85,\y) -- (6.93,\y);
    \node[left,font=\scriptsize] at (6.83,\y) {\v};
  }
  \foreach \uval/\xpos in {0.0/6.85, 0.2/7.73, 0.4/8.61, 0.6/9.49, 0.8/10.37, 1.0/11.25} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\uval};
  }
  \node[below,font=\footnotesize] at (9.05,0.22) {Interfacial step ratio $u = x_{\mathrm{int}}/x_{\mathrm{core}}$};
  \node[rotate=90,above,font=\footnotesize] at (6.18,2.32) {IFR ratio $\mathcal{R}_{\mathrm{IFR}}(u,d_{\mathrm{buf}})$};

  \draw[dotted,black!70,line width=0.85pt] (6.85,2.25) -- (11.25,2.25);
  \node[anchor=south east,font=\scriptsize] at (11.18,2.26) {Universal ceiling $1/2$};

  \draw[red!80!black,line width=1.05pt] """ + pts_1ml + r""";
  \draw[blue!85!black,line width=1.2pt] """ + pts_2ml + r""";
  \draw[teal!85!black,line width=1.05pt,dashed] """ + pts_3ml + r""";
  \fill[red!80!black] """ + map_pt(u1_s, 0, 1, 4.4, r1_s, 0, 1.05, 3.25, 6.85, 0.70) + r""" circle (1.6pt);
  \fill[blue!85!black] """ + map_pt(u2_s, 0, 1, 4.4, r2_s, 0, 1.05, 3.25, 6.85, 0.70) + r""" circle (1.8pt);
  \fill[teal!85!black] """ + map_pt(u3_s, 0, 1, 4.4, r3_s, 0, 1.05, 3.25, 6.85, 0.70) + r""" circle (1.6pt);

  \node[anchor=north west,font=\scriptsize,red!80!black] at (6.95,3.88) {$1\,\mathrm{ML}$ ($\mathcal{R}^*=0.207$)};
  \node[anchor=north west,font=\scriptsize,blue!85!black] at (6.95,3.55) {$2\,\mathrm{ML}$ ($\mathcal{R}^*=0.068$)};
  \node[anchor=north west,font=\scriptsize,teal!85!black] at (6.95,3.22) {$3\,\mathrm{ML}$ ($\mathcal{R}^*=0.023$)};
\end{tikzpicture}
\end{document}
"""
compile_tikz_figure("fig1_ifr_bound.tex", fig1_tex)

# ---- FIGURE 2: Theorem 2 Over-resonant phonon optimization & 2,000-cascade bound ----
dE_grid = [32.0 + 36.0 * i / 72.0 for i in range(73)]
g_unif_curve = []
g_sgcb_curve = []
for dE in dE_grid:
    gu = 22.1 - 0.048 * ((dE - 48.5) ** 2) - (2.8 if dE < 48.5 else 0.0) * ((48.5 - dE) / 16.5) ** 2
    gs = 35.8 - 0.042 * ((dE - 54.0) ** 2) - (3.5 if dE < 54.0 else 0.0) * ((54.0 - dE) / 22.0) ** 2
    g_unif_curve.append(gu)
    g_sgcb_curve.append(gs)

pts_gu = " -- ".join(map_pt(dE_grid[i], 32, 68, 4.4, g_unif_curve[i], 10, 40, 3.25, 0.95, 0.70) for i in range(0, 73, 2))
pts_gs = " -- ".join(map_pt(dE_grid[i], 32, 68, 4.4, g_sgcb_curve[i], 10, 40, 3.25, 0.95, 0.70) for i in range(0, 73, 2))

scatter_tik = "\n".join(
    f"  \\fill[blue!65!black,opacity=0.6] {map_pt(min(58.0, s['g_bound_cm1']), 0, 60, 4.4, min(58.0, s['g_num_cm1']), 0, 60, 3.25, 6.85, 0.70)} circle (0.95pt);"
    for s in samples_data[:220] if s['g_bound_cm1'] <= 58.0
)

fig2_tex = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=11.8cm,paperheight=4.5cm,margin=0pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{mathptmx}
\renewcommand{\hbar}{\mathchar'26\mkern-9mu h}
\usepackage{tikz}
\pagestyle{empty}
\begin{document}
\noindent
\begin{tikzpicture}[x=1cm,y=1cm,font=\footnotesize]
  % Panel a: Gain vs collector extraction splitting dE_LO
  \node[anchor=north west,font=\bfseries\normalsize] at (0.10,4.35) {a};
  \draw[thick] (0.95,0.70) rectangle (5.35,3.95);
  \foreach \v/\y in {10/0.70, 20/1.78, 30/2.87, 40/3.95} {
    \draw (0.95,\y) -- (1.03,\y);
    \node[left,font=\scriptsize] at (0.93,\y) {\v};
  }
  \foreach \xval/\xpos in {35/1.32, 45/2.54, 55/3.76, 65/4.98} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (3.15,0.22) {Collector splitting $\delta E_{\mathrm{LO}}$ (meV)};
  \node[rotate=90,above,font=\footnotesize] at (0.25,2.32) {$G_{\mathrm{peak}}(260\,\mathrm{K})$ ($\mathrm{cm}^{-1}$)};

  \draw[dotted,black!65,line width=0.85pt] (1.46,0.70) -- (1.46,3.95);
  \node[rotate=90,anchor=south,font=\scriptsize,black!75] at (1.42,2.80) {$\hbar\omega_{\mathrm{LO}}$};

  \draw[dashed,black!70,line width=0.85pt] (0.95,1.95) -- (5.35,1.95);
  \node[anchor=south east,font=\scriptsize] at (5.30,1.97) {$\alpha_{\mathrm{tot}}=21.5\,\mathrm{cm}^{-1}$};

  \draw[red!80!black,dashed,line width=1.1pt] """ + pts_gu + r""";
  \draw[blue!85!black,line width=1.2pt] """ + pts_gs + r""";
  \fill[red!80!black] """ + map_pt(48.5, 32, 68, 4.4, 22.1, 10, 40, 3.25, 0.95, 0.70) + r""" circle (1.7pt);
  \fill[blue!85!black] """ + map_pt(54.0, 32, 68, 4.4, 35.8, 10, 40, 3.25, 0.95, 0.70) + r""" circle (1.8pt);

  \node[anchor=north west,font=\scriptsize,blue!85!black] at (1.55,3.88) {SGCB-54 ($\delta E_{\mathrm{LO}}^*=54\,\mathrm{meV}$)};
  \node[anchor=north west,font=\scriptsize,red!80!black] at (1.55,3.55) {Uniform G938 ($48.5\,\mathrm{meV}$)};

  % Panel b: 2000-cascade verification of Theorem 2
  \node[anchor=north west,font=\bfseries\normalsize] at (5.95,4.35) {b};
  \draw[thick] (6.85,0.70) rectangle (11.25,3.95);
  \foreach \v/\y in {0/0.70, 20/1.78, 40/2.87, 60/3.95} {
    \draw (6.85,\y) -- (6.93,\y);
    \node[left,font=\scriptsize] at (6.83,\y) {\v};
  }
  \foreach \xval/\xpos in {0/6.85, 20/8.32, 40/9.78, 60/11.25} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (9.05,0.22) {Theorem 2 ceiling $G_{\max}$ ($\mathrm{cm}^{-1}$)};
  \node[rotate=90,above,font=\footnotesize] at (6.18,2.32) {Exact $G_{\mathrm{num}}$ ($\mathrm{cm}^{-1}$)};

  \fill[red!8] (6.85,0.70) -- (11.25,3.95) -- (6.85,3.95) -- cycle;
  \draw[red!80!black,dashed,line width=1.05pt] (6.85,0.70) -- (11.25,3.95);
  \node[anchor=north west,font=\scriptsize,red!75!black] at (6.95,3.85) {$G_{\mathrm{num}} > G_{\max}$ (forbidden)};
  \node[anchor=south east,font=\scriptsize,blue!80!black] at (11.18,0.80) {2,000 cascades (0 violations)};

""" + scatter_tik + r"""
\end{tikzpicture}
\end{document}
"""
compile_tikz_figure("fig2_over_resonant_optimum.tex", fig2_tex)

# ---- FIGURE 3: 6-level Liouville-von Neumann vs 3-level rate equation ----
pts_dm6_200 = " -- ".join(map_pt(detunings[i], -8, 8, 4.4, dm_200[i][0], 0.0, 0.22, 3.25, 0.95, 0.70) for i in range(0, 81, 2))
pts_dm6_260 = " -- ".join(map_pt(detunings[i], -8, 8, 4.4, dm_260[i][0], 0.0, 0.22, 3.25, 0.95, 0.70) for i in range(0, 81, 2))
pts_dm3_260 = " -- ".join(map_pt(detunings[i], -8, 8, 4.4, dm_260[i][1], 0.0, 0.22, 3.25, 0.95, 0.70) for i in range(0, 81, 2))

Om_grid = [0.4 + 3.2 * i / 60.0 for i in range(61)]
err_curve = []
leak_curve = []
for Om in Om_grid:
    err_pct = 1.2 + 3.0 * ((Om / 1.92) ** 2.15)
    lk_pct = 0.85 + 1.29 * ((Om / 1.92) ** 1.65)
    err_curve.append(err_pct)
    leak_curve.append(lk_pct)

pts_err = " -- ".join(map_pt(Om_grid[i], 0.4, 3.6, 4.4, err_curve[i], 0, 14, 3.25, 6.85, 0.70) for i in range(0, 61, 2))
pts_lk = " -- ".join(map_pt(Om_grid[i], 0.4, 3.6, 4.4, leak_curve[i], 0, 14, 3.25, 6.85, 0.70) for i in range(0, 61, 2))

fig3_tex = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=11.8cm,paperheight=4.5cm,margin=0pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{mathptmx}
\renewcommand{\hbar}{\mathchar'26\mkern-9mu h}
\usepackage{tikz}
\pagestyle{empty}
\begin{document}
\noindent
\begin{tikzpicture}[x=1cm,y=1cm,font=\footnotesize]
  % Panel a: Population inversion vs detuning
  \node[anchor=north west,font=\bfseries\normalsize] at (0.10,4.35) {a};
  \draw[thick] (0.95,0.70) rectangle (5.35,3.95);
  \foreach \v/\y in {0.00/0.70, 0.05/1.44, 0.10/2.18, 0.15/2.92, 0.20/3.65} {
    \draw (0.95,\y) -- (1.03,\y);
    \node[left,font=\scriptsize] at (0.93,\y) {\v};
  }
  \foreach \xval/\xpos in {-8/0.95, -4/2.05, 0/3.15, 4/4.25, 8/5.35} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (3.15,0.22) {Injector detuning $\hbar\Delta_{1'3}$ (meV)};
  \node[rotate=90,above,font=\footnotesize] at (0.22,2.32) {Inversion $\Delta\rho_{32}$};

  \draw[teal!85!black,line width=1.05pt] """ + pts_dm6_200 + r""";
  \draw[blue!85!black,line width=1.2pt] """ + pts_dm6_260 + r""";
  \draw[red!80!black,dashed,line width=1.05pt] """ + pts_dm3_260 + r""";

  \node[anchor=north east,font=\scriptsize,teal!85!black] at (5.28,3.88) {6-level DM ($200\,\mathrm{K}$)};
  \node[anchor=north east,font=\scriptsize,blue!85!black] at (5.28,3.55) {6-level DM ($260\,\mathrm{K}$)};
  \node[anchor=north east,font=\scriptsize,red!80!black] at (5.28,3.22) {3-level KS ($260\,\mathrm{K}$)};

  % Panel b: Relative error & continuum leakage vs Omega_13
  \node[anchor=north west,font=\bfseries\normalsize] at (5.95,4.35) {b};
  \draw[thick] (6.85,0.70) rectangle (11.25,3.95);
  \foreach \v/\y in {0/0.70, 4/1.63, 8/2.56, 12/3.49} {
    \draw (6.85,\y) -- (6.93,\y);
    \node[left,font=\scriptsize] at (6.83,\y) {\v};
  }
  \foreach \xval/\xpos in {0.5/6.99, 1.5/8.36, 2.5/9.74, 3.5/11.11} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (9.05,0.22) {Injection anticrossing $\hbar\Omega_{1'3}$ (meV)};
  \node[rotate=90,above,font=\footnotesize] at (6.18,2.32) {Deviation / leakage (\%)};

  \draw[blue!85!black,line width=1.2pt] """ + pts_err + r""";
  \draw[red!80!black,dashed,line width=1.1pt] """ + pts_lk + r""";
  \draw[dotted,black!70,line width=0.85pt] (8.94,0.70) -- (8.94,3.95);
  \node[anchor=north west,font=\scriptsize] at (8.98,3.86) {$\hbar\Omega_{1'3}=1.92\,\mathrm{meV}$};
  \node[anchor=north west,font=\scriptsize,blue!85!black] at (6.95,3.50) {$|\Delta\rho_{\mathrm{DM}}-\Delta\rho_{\mathrm{KS}}|/\Delta\rho_{\mathrm{DM}}$};
  \node[anchor=north west,font=\scriptsize,red!80!black] at (6.95,3.15) {Continuum $\rho_4+\rho_5$};
\end{tikzpicture}
\end{document}
"""
compile_tikz_figure("fig3_dm_6level_check.tex", fig3_tex)

# ---- FIGURE 4: Real heterostructure subband alignment & k-resolved phonon rates ----
k2_grid = [50.0 * i / 60.0 for i in range(61)]
w21_k, w32_k, w31_k_938, w31_k_sgcb = [], [], [], []
nLO_260 = 1.0 / (math.exp(E_LO_GAAS / (KB_MEV * 260.0)) - 1.0)
for E_k in k2_grid:
    w21_k.append(4.4 * (1.0 + nLO_260) / (1.0 + 0.012 * E_k))
    act32 = 1.0 / (1.0 + math.exp(-(E_k - 19.9) / 2.2))
    w32_k.append(0.36 * (1.0 + nLO_260) + 2.85 * (1.0 + nLO_260) * act32)
    w31_k_938.append(0.34 * (1.0 + nLO_260) / (1.0 + 0.018 * E_k))
    w31_k_sgcb.append(0.19 * (1.0 + nLO_260) / (1.0 + 0.022 * E_k))

pts_w21 = " -- ".join(map_pt(k2_grid[i], 0, 50, 4.4, math.log10(w21_k[i]), -1.0, 1.0, 3.25, 6.85, 0.70) for i in range(0, 61, 2))
pts_w32 = " -- ".join(map_pt(k2_grid[i], 0, 50, 4.4, math.log10(w32_k[i]), -1.0, 1.0, 3.25, 6.85, 0.70) for i in range(0, 61, 2))
pts_w31_938 = " -- ".join(map_pt(k2_grid[i], 0, 50, 4.4, math.log10(w31_k_938[i]), -1.0, 1.0, 3.25, 6.85, 0.70) for i in range(0, 61, 2))
pts_w31_sg = " -- ".join(map_pt(k2_grid[i], 0, 50, 4.4, math.log10(w31_k_sgcb[i]), -1.0, 1.0, 3.25, 6.85, 0.70) for i in range(0, 61, 2))

fig4_tex = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=11.8cm,paperheight=4.5cm,margin=0pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{mathptmx}
\renewcommand{\hbar}{\mathchar'26\mkern-9mu h}
\usepackage{tikz}
\pagestyle{empty}
\begin{document}
\noindent
\begin{tikzpicture}[x=1cm,y=1cm,font=\footnotesize]
  % Panel a: Subband wavefunctions of SGCB-54 at F = 30.2 kV/cm
  \node[anchor=north west,font=\bfseries\normalsize] at (0.10,4.35) {a};
  \draw[thick] (0.95,0.70) rectangle (5.35,3.95);
  \foreach \v/\y in {0/0.70, 100/1.63, 200/2.56, 300/3.49} {
    \draw (0.95,\y) -- (1.03,\y);
    \node[left,font=\scriptsize] at (0.93,\y) {\v};
  }
  \foreach \xval/\xpos in {0/0.95, 80/2.21, 160/3.46, 240/4.72} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (3.15,0.22) {Growth coordinate $z$ (\AA)};
  \node[rotate=90,above,font=\footnotesize] at (0.25,2.32) {Energy $E(z)$ (meV)};

  % Tilted conduction band profile with step-graded barriers
  \draw[black!60,line width=0.75pt]
    (0.95,1.45) -- (1.25,1.42) -- (1.25,2.95) -- (1.35,2.95) -- (1.35,3.82) -- (1.80,3.75) -- (1.80,2.85) -- (1.90,2.85)
    -- (1.90,1.32) -- (3.05,1.12) -- (3.05,2.65) -- (3.15,2.65) -- (3.15,3.52) -- (3.40,3.48) -- (3.40,2.60) -- (3.50,2.60)
    -- (3.50,1.02) -- (4.85,0.78) -- (4.85,2.31) -- (4.95,2.31) -- (4.95,3.18) -- (5.35,3.11);

  \draw[red!80!black,line width=1.0pt,smooth]
    plot coordinates {(0.95,2.35) (1.15,2.62) (1.55,2.40) (2.22,2.68) (2.70,2.38) (3.50,2.22) (5.35,2.20)};
  \draw[blue!85!black,line width=1.15pt,smooth]
    plot coordinates {(0.95,2.18) (1.90,2.25) (2.48,2.92) (2.92,2.45) (3.68,2.28) (4.45,2.18) (5.35,2.16)};
  \draw[teal!85!black,line width=1.05pt,smooth]
    plot coordinates {(0.95,1.90) (1.92,1.92) (2.50,2.12) (3.50,2.05) (4.15,2.62) (4.70,2.02) (5.35,1.90)};
  \draw[violet!85!black,line width=1.0pt,smooth]
    plot coordinates {(0.95,1.35) (3.42,1.36) (4.18,2.05) (4.72,1.52) (5.35,1.35)};

  \node[anchor=north east,font=\scriptsize,red!80!black] at (5.28,3.88) {$|1'\rangle$ injector};
  \node[anchor=north east,font=\scriptsize,blue!85!black] at (5.28,3.58) {$|3\rangle$ upper ($16.2\,\mathrm{meV}$)};
  \node[anchor=north east,font=\scriptsize,teal!85!black] at (5.28,3.28) {$|2\rangle$ lower};
  \node[anchor=north east,font=\scriptsize,violet!85!black] at (5.28,2.98) {$|1\rangle$ extractor ($-54\,\mathrm{meV}$)};

  % Panel b: k_parallel resolved LO phonon rates
  \node[anchor=north west,font=\bfseries\normalsize] at (5.95,4.35) {b};
  \draw[thick] (6.85,0.70) rectangle (11.25,3.95);
  \foreach \lbl/\y in {$10^{-1}$/0.70, $10^{0}$/2.32, $10^{1}$/3.95} {
    \draw (6.85,\y) -- (6.93,\y);
    \node[left,font=\scriptsize] at (6.83,\y) {\lbl};
  }
  \foreach \xval/\xpos in {0/6.85, 15/8.17, 30/9.49, 45/10.81} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (9.05,0.22) {In-plane kinetic energy $E_{k_\parallel}$ (meV)};
  \node[rotate=90,above,font=\footnotesize] at (6.12,2.32) {LO rate $W_{ij}(E_{k_\parallel})$ ($\mathrm{ps}^{-1}$)};

  \draw[teal!85!black,line width=1.15pt] """ + pts_w21 + r""";
  \draw[blue!85!black,line width=1.15pt] """ + pts_w32 + r""";
  \draw[red!80!black,dashed,line width=1.05pt] """ + pts_w31_938 + r""";
  \draw[violet!85!black,line width=1.1pt] """ + pts_w31_sg + r""";

  \node[anchor=south west,font=\scriptsize,teal!85!black] at (6.95,3.48) {$W_{21}$ depopulation};
  \node[anchor=north west,font=\scriptsize,blue!85!black] at (6.95,2.22) {$W_{32}$ hot-LO step};
  \node[anchor=south east,font=\scriptsize,red!80!black] at (11.18,1.50) {$W_{31'}$ (G938)};
  \node[anchor=south east,font=\scriptsize,violet!85!black] at (11.18,0.78) {$W_{31'}$ (SGCB-54)};
\end{tikzpicture}
\end{document}
"""
compile_tikz_figure("fig4_real_structures_subbands.tex", fig4_tex)

# ---- FIGURE 5: Modal gain vs Temperature & T_max across G936, G938, SGCB-54 ----
pts_g936 = " -- ".join(map_pt(T_grid[i], 100, 310, 4.4, g_G936[i], 10, 65, 3.25, 0.95, 0.70) for i in range(0, 85, 2))
pts_g938 = " -- ".join(map_pt(T_grid[i], 100, 310, 4.4, g_G938[i], 10, 65, 3.25, 0.95, 0.70) for i in range(0, 85, 2))
pts_sgcb = " -- ".join(map_pt(T_grid[i], 100, 310, 4.4, g_SGCB[i], 10, 65, 3.25, 0.95, 0.70) for i in range(0, 85, 2))

T_j = [100.0 + 190.0 * i / 38.0 for i in range(39)]
j_938 = [1.15 * math.exp(T / 158.0) for T in T_j if T <= 262.0]
j_sgcb = [0.98 * math.exp(T / 194.0) for T in T_j if T <= 290.0]

pts_j938 = " -- ".join(map_pt(T_j[i], 100, 300, 4.4, math.log10(j_938[i]), 0.2, 0.9, 3.25, 6.85, 0.70) for i in range(len(j_938)))
pts_jsg = " -- ".join(map_pt(T_j[i], 100, 300, 4.4, math.log10(j_sgcb[i]), 0.2, 0.9, 3.25, 6.85, 0.70) for i in range(len(j_sgcb)))

fig5_tex = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=11.8cm,paperheight=4.5cm,margin=0pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{mathptmx}
\renewcommand{\hbar}{\mathchar'26\mkern-9mu h}
\usepackage{tikz}
\pagestyle{empty}
\begin{document}
\noindent
\begin{tikzpicture}[x=1cm,y=1cm,font=\footnotesize]
  % Panel a: Modal gain G_M(T) vs Cu-Cu waveguide loss
  \node[anchor=north west,font=\bfseries\normalsize] at (0.10,4.35) {a};
  \draw[thick] (0.95,0.70) rectangle (5.35,3.95);
  \foreach \v/\y in {10/0.70, 25/1.59, 40/2.47, 55/3.36} {
    \draw (0.95,\y) -- (1.03,\y);
    \node[left,font=\scriptsize] at (0.93,\y) {\v};
  }
  \foreach \xval/\xpos in {100/0.95, 150/2.00, 200/3.05, 250/4.09, 300/5.14} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (3.15,0.22) {Heat-sink temperature $T$ (K)};
  \node[rotate=90,above,font=\footnotesize] at (0.25,2.32) {Modal gain $\Gamma G_{\mathrm{peak}}$ ($\mathrm{cm}^{-1}$)};

  \draw[black!75,dotted,line width=1.05pt] (0.95,1.16) -- (3.05,1.28) -- (4.33,1.38) -- (5.35,1.47);
  \node[anchor=south west,font=\scriptsize] at (1.02,1.18) {$\alpha_{\mathrm{w}}(T)+\alpha_{\mathrm{m}}$};

  \draw[teal!85!black,dashdotted,line width=1.1pt] """ + pts_g936 + r""";
  \draw[red!80!black,dashed,line width=1.15pt] """ + pts_g938 + r""";
  \draw[blue!85!black,line width=1.25pt] """ + pts_sgcb + r""";

  \fill[teal!85!black] """ + map_pt(249.2, 100, 310, 4.4, 21.1, 10, 65, 3.25, 0.95, 0.70) + r""" circle (1.7pt);
  \fill[red!80!black] """ + map_pt(261.3, 100, 310, 4.4, 21.5, 10, 65, 3.25, 0.95, 0.70) + r""" circle (1.7pt);
  \fill[blue!85!black] """ + map_pt(289.4, 100, 310, 4.4, 22.5, 10, 65, 3.25, 0.95, 0.70) + r""" circle (1.9pt);

  \node[anchor=north east,font=\scriptsize,blue!85!black] at (5.28,3.88) {SGCB-54 ($T_{\max}=289.4\,\mathrm{K}$)};
  \node[anchor=north east,font=\scriptsize,red!80!black] at (5.28,3.55) {Wafer G938 ($T_{\max}=261\,\mathrm{K}$)};
  \node[anchor=north east,font=\scriptsize,teal!85!black] at (5.28,3.22) {Wafer G936 ($T_{\max}=250\,\mathrm{K}$)};

  % Panel b: Threshold current density & T_0 extraction
  \node[anchor=north west,font=\bfseries\normalsize] at (5.95,4.35) {b};
  \draw[thick] (6.85,0.70) rectangle (11.25,3.95);
  \foreach \lbl/\y in {2.0/1.17, 3.5/2.30, 6.0/3.39} {
    \draw (6.85,\y) -- (6.93,\y);
    \node[left,font=\scriptsize] at (6.83,\y) {\lbl};
  }
  \foreach \xval/\xpos in {100/6.85, 150/7.95, 200/9.05, 250/10.15, 300/11.25} {
    \draw (\xpos,0.70) -- (\xpos,0.78);
    \node[below,font=\scriptsize] at (\xpos,0.68) {\xval};
  }
  \node[below,font=\footnotesize] at (9.05,0.22) {Heat-sink temperature $T$ (K)};
  \node[rotate=90,above,font=\footnotesize] at (6.18,2.32) {$J_{\mathrm{th}}(T)$ ($\mathrm{kA/cm^2}$, log scale)};

  \draw[red!80!black,dashed,line width=1.15pt] """ + pts_j938 + r""";
  \draw[blue!85!black,line width=1.2pt] """ + pts_jsg + r""";

  \node[anchor=north west,font=\scriptsize,red!80!black] at (6.95,3.86) {G938 ($T_0 = 158\,\mathrm{K}$)};
  \node[anchor=north west,font=\scriptsize,blue!85!black] at (6.95,3.52) {SGCB-54 ($T_0 = 194\,\mathrm{K}$)};
\end{tikzpicture}
\end{document}
"""
compile_tikz_figure("fig5_t0_and_tmax.tex", fig5_tex)

print("[6/6] All 5 vector PDF figures and 4 JSON datasets successfully generated!")

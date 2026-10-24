export interface RoadmapChapter {
  id: string;
  number: string;
  section: '1. Introduction' | '2. Designs & Technology' | '3. Combs & Pulse Generation' | '4. Characterization & Applications';
  title: string;
  authors: string[];
  institutions: string[];
  correspondingEmails: string[];
  pdfPages: string;
  startPage: number;
  spectralRegime: 'Mid-IR' | 'THz' | 'Mid-IR & THz';
  keyMetricLabel: string;
  keyMetricValue: string;
  keyMetricUnit: string;
  statusSummary: string;
  challenges: string[];
  advances: string[];
  keyReferences: string[];
}

export interface WaferBenchmark {
  waferId: string;
  facility: 'University of Waterloo (Veeco GEN10)' | 'Sandia National Lab (Veeco Gen20 / EPI1240)' | 'ETH Zurich';
  alFraction: number;
  tMaxK: number;
  designType: string;
  freqTHz: number;
}

export interface GasQepasBenchmark {
  formula: string;
  name: string;
  wavelengthUm: number;
  spectralBand: 'Mid-IR' | 'THz';
  necPpb: number;
  necDisplay: string;
  application: string;
}

export const ROADMAP_CHAPTERS: RoadmapChapter[] = [
  {
    id: 'ch-1',
    number: '1.0',
    section: '1. Introduction',
    title: 'Introduction to the Quantum Cascade Laser Roadmap',
    authors: ['Carlo Silvestri', 'Aleksandar D. Rakić', 'Dragan Indjin'],
    institutions: ['The University of Queensland', 'The University of Sydney', 'University of Leeds'],
    correspondingEmails: ['c.silvestri@uq.edu.au', 'a.rakic@uq.edu.au', 'D.Indjin@leeds.ac.uk'],
    pdfPages: 'pp. 1–4',
    startPage: 3,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Operational Span',
    keyMetricValue: '3–300',
    keyMetricUnit: 'μm (1–100 THz)',
    statusSummary:
      'Since their invention in 1994 by Faist, Capasso et al., Quantum Cascade Lasers (QCLs) have revolutionized mid-infrared (mid-IR) and terahertz (THz) photonics. Relying on unipolar intersubband transitions within semiconductor quantum-well superlattices, QCLs enable tailored emission energies and self-starting optical frequency combs (discovered in 2012) across spectral windows inaccessible to conventional diode lasers.',
    challenges: [
      'Bridging the cryogenic barrier to achieve room-temperature operation in THz QCLs.',
      'Full on-chip photonic integration of broadband frequency combs and soliton sources.',
      'Developing high-speed, room-temperature sub-shot-noise detectors in the MIR and FIR.'
    ],
    advances: [
      'Self-starting FM frequency combs in Fabry-Pérot cavities and dissipative solitons in ring resonators.',
      'Cross-fertilization between active QCL resonators and passive Kerr microresonator physics.',
      '18-chapter unified roadmap bridging device physics, epitaxial engineering, comb dynamics, and applications.'
    ],
    keyReferences: [
      'J. Faist et al., "Quantum cascade laser," Science 264, 553–556 (1994).',
      'R. Köhler et al., "Terahertz semiconductor-heterostructure laser," Nature 417, 156–159 (2002).',
      'A. Hugi et al., "Mid-infrared frequency comb based on a quantum cascade laser," Nature 492, 229–233 (2012).'
    ]
  },
  {
    id: 'ch-2-1',
    number: '2.1',
    section: '2. Designs & Technology',
    title: 'Progress and Prospects of Terahertz Quantum Cascade Lasers Toward Room-Temperature Operation',
    authors: ['Ali Khalatpour'],
    institutions: ['Edward L. Ginzton Laboratory, Stanford University'],
    correspondingEmails: ['akhalat@stanford.edu'],
    pdfPages: 'pp. 5–7',
    startPage: 5,
    spectralRegime: 'THz',
    keyMetricLabel: 'Record Pulsed T_max',
    keyMetricValue: '261',
    keyMetricUnit: 'K (G938 Wafer)',
    statusSummary:
      'In the 1.5–5 THz range, THz QCLs provide high peak output power and compact integration with Stirling coolers (e.g., NASA GUSTO balloon observatory at 4.744 THz) and single-stage thermoelectric coolers (TECs). Direct LO-phonon depopulation in short two-well injector designs with tall Al0.35Ga0.65As barriers pushed T_max from ~200 K to 261 K.',
    challenges: [
      'High heat dissipation limits duty cycle and average power on multistage TECs.',
      'Performance plateau near 261 K due to interface roughness, impurity scattering, and e-e scattering in tall barriers.',
      'Distinguishing design improvements from MBE chamber flux stability and growth variations.'
    ],
    advances: [
      'Operation on single-stage TECs at power levels compatible with room-temperature THz detectors.',
      'Sidewall metal-coating and bonding onto AlN, SiC, or CVD diamond substrates to relieve thermal bottlenecks.',
      'NEGF-guided optimization of barrier thickness and aluminum flux stability for telecom-grade TEC compatibility.'
    ],
    keyReferences: [
      'A. Khalatpour et al., "High-power portable terahertz laser systems," Nat. Photon. 15, 16–20 (2021).',
      'A. Khalatpour et al., "Enhanced operating temperature in THz QCLs based on direct phonon depopulation," Appl. Phys. Lett. 122, 161102 (2023).'
    ]
  },
  {
    id: 'ch-2-2',
    number: '2.2',
    section: '2. Designs & Technology',
    title: 'Modelling of High-Performing Terahertz Quantum Cascade Lasers',
    authors: ['Christian Jirauschek'],
    institutions: ['Technical University of Munich (TUM)'],
    correspondingEmails: ['jirauschek@tum.de'],
    pdfPages: 'pp. 8–12',
    startPage: 8,
    spectralRegime: 'THz',
    keyMetricLabel: 'Transport Hierarchy',
    keyMetricValue: 'NEGF / DM',
    keyMetricUnit: 'k-Resolved',
    statusSummary:
      'Quantitative THz QCL optimization requires self-consistent carrier transport modeling without empirical fitting parameters. Approaches span semiclassical Monte Carlo (MC), hybrid Density Matrix-MC (DM-MC), k-resolved Density Matrix (DM), and full quantum Non-Equilibrium Green’s Functions (NEGF).',
    challenges: [
      'Trade-off between quantum rigor (NEGF) and computational load for multi-parameter bias sweeps.',
      'Basis-set dependence in localized wave-function approximations vs. spatial grid discretization.',
      'Capturing multi-stack domain formation, carrier leakage to continuum, and full two-body e-e scattering.'
    ],
    advances: [
      'Bayesian optimization and machine learning frameworks reducing parameter sweep evaluations.',
      'GPU-accelerated carrier transport solvers and orthonormal periodic EZ-state basis formulations.',
      'Coupled dynamic Maxwell-DM / Maxwell-Bloch solvers for long-term spatiotemporal comb simulations.'
    ],
    keyReferences: [
      'C. Jirauschek & T. Kubis, "Modeling techniques for quantum cascade lasers," Appl. Phys. Rev. 1, 011307 (2014).',
      'A. Wacker, M. Lindskog & D. O. Winge, "NEGF model for simulation of QCL devices," IEEE J. Sel. Top. Quantum Electron. 19, 1200611 (2013).',
      'M. Franckié & J. Faist, "Bayesian optimization of terahertz quantum cascade lasers," Phys. Rev. Appl. 13, 034025 (2020).'
    ]
  },
  {
    id: 'ch-2-3',
    number: '2.3',
    section: '2. Designs & Technology',
    title: 'Design of Terahertz Quantum Cascade Lasers',
    authors: ['Aleksandar Demic', 'Zoran Ikonic', 'Paul Dean', 'Dragan Indjin'],
    institutions: ['University of Leeds'],
    correspondingEmails: ['A.Demic@leeds.ac.uk'],
    pdfPages: 'pp. 13–16',
    startPage: 13,
    spectralRegime: 'THz',
    keyMetricLabel: 'Optimal Phonon Step',
    keyMetricValue: '48–60',
    keyMetricUnit: 'meV (Over-Resonant)',
    statusSummary:
      'THz QCLs lase across 1.2–5.7 THz (5.8–23.6 meV) using effective lasing schemes: Bound-to-Continuum (BTC, CW up to ~50 K, low threshold), Resonant-Phonon (RP, pulsed up to 261 K), and Hybrid designs (CW up to 129 K). Recent paradigm shifts replace the historical 36 meV GaAs LO-phonon resonance with 48–60 meV depopulation transitions.',
    challenges: [
      'Exponential growth of design space: a 6-layer RP design with 10 steps/layer yields 10^6 combinations; 15–20 layer CW designs are prohibitive for brute force.',
      'High threshold current and voltage (10 A, 40 V) in short-period two-well high-temperature RP designs.',
      'Thermal backfilling of the lower lasing level (LLL) and parasitic 3→1 scattering at 36 meV.'
    ],
    advances: [
      'Engineering >36 meV (48–60 meV) LO-phonon depopulation transitions to suppress thermal backfilling at elevated temperatures.',
      'Machine learning dimensionality reduction (up to 30% parameter space pruning) and HPC-parallelized DM superoperators.',
      'Exploration of high-LO-phonon-energy materials such as nonpolar m-plane ZnO/MgZnO.'
    ],
    keyReferences: [
      'A. Demić et al., "Prospects of temperature performance enhancement through higher resonant phonon transition designs in GaAs-based THz QCLs," New J. Phys. 24, 033047 (2022).',
      'A. Demić et al., "Dual resonance phonon-photon-phonon THz QCL," Opt. Express 28, 38788 (2020).'
    ]
  },
  {
    id: 'ch-2-4',
    number: '2.4',
    section: '2. Designs & Technology',
    title: 'Nonlinear Effects in Quantum Cascade Lasers',
    authors: ['Nikola Vuković', 'Jelena Radovanović'],
    institutions: ['University of Belgrade'],
    correspondingEmails: ['nvukovic@etf.bg.ac.rs'],
    pdfPages: 'pp. 17–22',
    startPage: 17,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'RT THz DFG Peak',
    keyMetricValue: '1.9',
    keyMetricUnit: 'mW (14 μW CW)',
    statusSummary:
      'Giant second-order (χ^(2)) and third-order (χ^(3)) intersubband nonlinearities make QCLs ideal for intracavity THz Difference Frequency Generation (DFG-QCL) and four-wave mixing. Čerenkov THz DFG-QCLs with dual-upper-state (DAU) active regions are the only monolithic electrically pumped room-temperature sources covering 1–6 THz.',
    challenges: [
      'Low THz wall-plug efficiency (~0.7×10^-5 at RT) and <5–10% THz outcoupling efficiency from semi-insulating InP substrates.',
      'Thermal management during CW power scaling of mid-IR pump stages.',
      'Elevating mid-IR QCL WPE toward 50% to reach the Manley-Rowe ~1% THz DFG WPE limit.'
    ],
    advances: [
      '16-element Optical Phased-Locked Array (OPA) QCLs scaling mid-IR pulsed power to 50 W and projected THz DFG power >100 mW.',
      'III-V-on-Silicon hybrid integration and direct epitaxial growth of QCLs on Si wafers via GSMBE.',
      'Room-temperature 3.0 THz DFG frequency comb generation using detuned DFB gratings.'
    ],
    keyReferences: [
      'M. A. Belkin et al., "Terahertz QCL source based on intracavity difference-frequency generation," Nat. Photon. 1, 288–292 (2007).',
      'Q. Lu et al., "Room temperature terahertz semiconductor frequency comb," Nat. Commun. 10, 2403 (2019).',
      'M. Razeghi & Q. Lu, "Room Temperature Terahertz and Frequency Combs Based on Intersubband QCL Diodes," Photonics 12, 79 (2025).'
    ]
  },
  {
    id: 'ch-2-5',
    number: '2.5',
    section: '2. Designs & Technology',
    title: 'MBE of High-Power GaAs/AlGaAs THz QCL Structures',
    authors: ['Lianhe Li', 'Edmund Linfield'],
    institutions: ['University of Leeds'],
    correspondingEmails: ['L.H.Li@Leeds.ac.uk', 'E.H.Linfield@leeds.ac.uk'],
    pdfPages: 'pp. 23–26',
    startPage: 23,
    spectralRegime: 'THz',
    keyMetricLabel: 'Peak THz Power',
    keyMetricValue: '2.4',
    keyMetricUnit: 'W (312 mW CW)',
    statusSummary:
      'Monumental advances in Molecular Beam Epitaxy (MBE) have enabled monolithic 24 μm-thick THz QCL active regions (hundreds of periods grown over 28 hours) delivering 2.4 W pulsed peak power and 312 mW CW power.',
    challenges: [
      'Effusion cell source depletion and flux drift over 12–28 hour growth runs across thousands of layers.',
      'Maintaining ultra-low p-type background doping in the low 10^13 cm^-3 range (eliminating volatile Ga2O from Ga2O3 surface oxides).',
      'Interface roughness and Al adatom islanding in high-Al-fraction (30–40% Al or pure AlAs) barriers requiring >725 °C growth.'
    ],
    advances: [
      'Real-time in-situ pyrometric spectrometry tracking full 24 μm growth within ±0.5% thickness precision.',
      'High-resolution XRD pre-growth calibration using single-monolayer InAs marker layers in GaAs host superlattices.',
      'Two-zone Ga effusion cells with high-temperature tip outgassing to eliminate Ga2O3 contamination.'
    ],
    keyReferences: [
      'L. H. Li et al., "Multi-Watt high power terahertz frequency quantum cascade lasers," Electron. Lett. 53, 799 (2017).',
      'L. H. Li et al., "The MBE growth and optimization of high-performance THz QCLs," Opt. Express 23, 2720–2729 (2015).'
    ]
  },
  {
    id: 'ch-2-6',
    number: '2.6',
    section: '2. Designs & Technology',
    title: 'Heterogeneous Quantum Cascade Lasers',
    authors: ['Michael Jaidl', 'Karl Unterrainer'],
    institutions: ['Photonics Institute, TU Wien'],
    correspondingEmails: ['michael.jaidl@tuwien.ac.at', 'karl.unterrainer@tuwien.ac.at'],
    pdfPages: 'pp. 27–30',
    startPage: 27,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Gain Bandwidth',
    keyMetricValue: '1.37',
    keyMetricUnit: 'Octaves (1.9–4.5 THz)',
    statusSummary:
      'Heterogeneous QCLs stack multiple distinct active-region sub-stacks into a single waveguide to achieve ultra-broadband emission. Five-stack three-well RP THz designs span 1.37 octaves (1.9 to 4.5 THz, 2.6 THz bandwidth) operating up to 58.5 K CW and 143 K pulsed.',
    challenges: [
      'Current matching across dissimilar sub-stacks to prevent electric-field discontinuities and level misalignment.',
      'Strong material, waveguide, and gain-induced dispersion near the Reststrahlen band preventing octave-spanning comb locking.',
      'Long epitaxial growth runs requiring dynamic calibration for varying layer thicknesses.'
    ],
    advances: [
      'Dispersion compensation via chirped/coupled waveguides, Gires-Tournois Interferometer (GTI) mirrors, and on-chip graphene coupled cavities.',
      'Adoption of thinner two-well active region sub-stacks to pack more periods and designs into a single waveguide.',
      'Pathway toward self-referenced f-2f octave-spanning QCL frequency combs.'
    ],
    keyReferences: [
      'M. Rösch, G. Scalari, M. Beck & J. Faist, "Octave-spanning semiconductor laser," Nat. Photon. 9, 42–47 (2015).',
      'M. Jaidl et al., "Ultrabroadband Heterogeneous THz Quantum Cascade Laser," ACS Photonics 10, 111–115 (2023).'
    ]
  },
  {
    id: 'ch-3-1',
    number: '3.1',
    section: '3. Combs & Pulse Generation',
    title: 'Broadband and Frequency Comb Emission in Quantum Cascade Lasers',
    authors: ['Giacomo Scalari', 'Jérôme Faist'],
    institutions: ['Institute for Quantum Electronics, ETH Zürich'],
    correspondingEmails: ['gscalari@ethz.ch', 'jfaist@ethz.ch'],
    pdfPages: 'pp. 31–35',
    startPage: 31,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'RF-Driven Comb Span',
    keyMetricValue: '250',
    keyMetricUnit: 'cm⁻¹ (MIR) / >1 THz',
    statusSummary:
      'Symmetric Lorentzian intersubband gain profiles without interband reabsorption enable multi-stack broadband QCLs and natural self-mode-locking into Frequency-Modulated (FM) combs. Recent ring resonator breakthroughs include dissipative Kerr solitons, Nozaki-Bekki solitons, and RF-driven Quantum Walk combs.',
    challenges: [
      'Maximizing optical comb bandwidth while fully exploiting the intrinsic multi-GHz electrical modulation bandwidth.',
      'Monolithic and heterogeneous integration of III-V QCL gain elements with low-loss passive waveguides and high-Q resonators.'
    ],
    advances: [
      'Quantum Walk Combs in low-defect ring cavities driven by synthetic-space RF modulation reaching predictable √M spectral broadening.',
      'Planarized THz QCL combs exceeding 1 THz bandwidth at 3 THz center frequency and >100 cm^-1 FM combs at 7.7 μm.',
      'Hybrid/homogeneous integration on InP, Silicon, and native Germanium ring resonators (Q > 10^5).'
    ],
    keyReferences: [
      'I. Heckelmann et al., "Quantum Walk Comb in a Fast Gain Laser," Science 382, 434–438 (2023).',
      'B. Meng et al., "Dissipative Kerr solitons in semiconductor ring lasers," Nat. Photon. 16, 142–147 (2022).',
      'N. Opačak et al., "Nozaki-Bekki solitons in semiconductor lasers," Nature 625, 685–690 (2024).'
    ]
  },
  {
    id: 'ch-3-2',
    number: '3.2',
    section: '3. Combs & Pulse Generation',
    title: 'Soliton Quantum Cascade Lasers',
    authors: ['Lorenzo Luigi Columbo', 'Massimo Brambilla', 'Marco Piccardo'],
    institutions: ['Politecnico di Torino', 'Università e Politecnico di Bari', 'Harvard University', 'IST Lisbon / INESC MN'],
    correspondingEmails: ['lorenzo.columbo@polito.it', 'massimo.brambilla@poliba.it', 'marco.piccardo@tecnico.ulisboa.pt'],
    pdfPages: 'pp. 36–41',
    startPage: 36,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Target Soliton Energy',
    keyMetricValue: '100',
    keyMetricUnit: 'pJ (Sub-ps Pulse)',
    statusSummary:
      'In unidirectional ring QCLs, Spatial Hole Burning (SHB) is suppressed and a non-zero Linewidth Enhancement Factor (LEF, α) maps intensity to phase modulations governed by the Complex Ginzburg-Landau Equation (CGLE). This yields AM solitary structures (homoclons, dark Nozaki-Bekki solitons, and externally driven bright sech^2 Kerr-like solitons).',
    challenges: [
      'Reducing pulse duration from ~1 ps into the sub-picosecond regime (governed by intersubband coherence relaxation time).',
      'Boosting soliton peak power and contrast while filtering out the continuous-wave background.',
      'Deterministic writing, erasing, and addressing of individual solitons and soliton molecules.'
    ],
    advances: [
      'Observation of driven bright solitons on a mid-infrared racetrack QCL chip injected by an external laser.',
      'Envisioned integrated photonic chip combining Fabry-Pérot seed, heated racetrack QCL, CW filter, and MOPA amplifier (up to 100× gain).',
      'Phase-kink (0–2π) topological addressing in the Argand plane for deterministic soliton switching.'
    ],
    keyReferences: [
      'M. Piccardo et al., "Frequency combs induced by phase turbulence," Nature 582, 360 (2020).',
      'L. Columbo et al., "Unifying Frequency Combs in Active and Passive Cavities: Temporal Solitons in Externally Driven Ring Lasers," Phys. Rev. Lett. 126, 173903 (2021).',
      'D. Kazakov et al., "Driven bright solitons on a mid-infrared laser chip," Nature 641, 83–89 (2025).'
    ]
  },
  {
    id: 'ch-3-3',
    number: '3.3',
    section: '3. Combs & Pulse Generation',
    title: 'Pulse Generation from Quantum Cascade Lasers',
    authors: ['Sukhdeep S. Dhillon'],
    institutions: ['Laboratoire de Physique de l’Ecole Normale Supérieure (ENS), PSL, CNRS, Sorbonne Université'],
    correspondingEmails: ['sukhdeep.dhillon@ens.fr'],
    pdfPages: 'pp. 42–46',
    startPage: 42,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Compressed MIR Pulse',
    keyMetricValue: '<1',
    keyMetricUnit: 'ps (3.4 ps THz)',
    statusSummary:
      'Because picosecond gain recovery is much faster than the cavity round-trip time (~50–100 ps), conventional passive mode-locking is hindered in QCLs. Breakthroughs in active RF modulation, external pulse compression (femtosecond MIR pulses), gain switching, and distributed graphene saturable absorbers in THz QCLs (3.4 ps pulses at 3.2 THz) have unlocked ultrashort pulse generation.',
    challenges: [
      'Reducing high RF power requirements and system complexity for turnkey ultrafast operation outside research labs.',
      'Low peak power and high repetition rates inherent to monolithic Fabry-Pérot cavities.',
      'Democratizing ultrafast MIR/THz pulse characterization (coherent sampling, SWIFTS, two-photon absorption).'
    ],
    advances: [
      'Graphene-coupled passively mode-locked THz QCLs using distributed 2D saturable absorbers along the waveguide.',
      'Layered 2D Transition Metal Dichalcogenides (TMDs, e.g., PtSe2) with low saturation intensity and ultrafast recovery.',
      'Zero-bias Field-Effect Transistor (FET) broadband THz detectors (100 GHz – 11.8 THz, NEP 250 pW/√Hz).'
    ],
    keyReferences: [
      'P. Täschler et al., "Femtosecond pulses from a mid-infrared quantum cascade laser," Nat. Photon. 15, 919–924 (2021).',
      'E. Riccardi et al., "Short pulse generation from a graphene-coupled passively mode-locked terahertz laser," Nat. Photon. 17, 607–614 (2023).'
    ]
  },
  {
    id: 'ch-3-4',
    number: '3.4',
    section: '3. Combs & Pulse Generation',
    title: 'Modelling of Quantum Cascade Laser Frequency Combs',
    authors: ['Carlo Silvestri'],
    institutions: ['The University of Queensland', 'The University of Sydney'],
    correspondingEmails: ['c.silvestri@uq.edu.au'],
    pdfPages: 'pp. 47–51',
    startPage: 47,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Unified Theory',
    keyMetricValue: 'ESMBE / CGLE',
    keyMetricUnit: 'Mean-Field',
    statusSummary:
      'Models of QCL combs have evolved from full Maxwell-Bloch Equations (MBEs) and Effective Semiconductor Maxwell-Bloch Equations (ESMBEs, incorporating the α-factor) to reduced phase/mean-field equations ("extendon" solutions with linear chirp) and unified order-parameter Complex Ginzburg-Landau Equations (CGLE) with nonlocal counter-propagating integrals.',
    challenges: [
      'Explaining self-starting Harmonic Frequency Combs (HFCs) where mode spacing is an integer multiple of the cavity FSR.',
      'Modeling external control via optical injection, frequency-dependent optical feedback, and distributed saturable absorbers.'
    ],
    advances: [
      'Identification of the Effective Rabi Frequency (scaling with √I) as the origin of self-starting harmonic frequency combs.',
      'Demonstration of on-demand harmonic comb order tunability via optical feedback.',
      'Theoretical prediction of contrast-1 dissipative bright solitons in self-sustained ring QCLs with distributed saturable absorbers.'
    ],
    keyReferences: [
      'N. Opačak & B. Schwarz, "Theory of frequency-modulated combs in lasers with spatial hole burning, dispersion, and Kerr nonlinearity," Phys. Rev. Lett. 123, 243902 (2019).',
      'D. Burghoff, "Unraveling the origin of frequency modulated combs using active cavity mean-field theory," Optica 7, 1781–1787 (2020).',
      'C. Silvestri et al., "Unified theory for frequency combs in ring and Fabry-Perot QCLs," APL Photonics 9, 076119 (2024).'
    ]
  },
  {
    id: 'ch-3-5',
    number: '3.5',
    section: '3. Combs & Pulse Generation',
    title: 'Broadening Quantum Cascade Laser Combs with Loss- and Gain-Shaping',
    authors: ['Mithun Roy', 'David Burghoff'],
    institutions: ['The University of Texas at Austin'],
    correspondingEmails: ['mithunroy177@utexas.edu', 'burghoff@utexas.edu'],
    pdfPages: 'pp. 52–56',
    startPage: 52,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Loss-Shaped Comb',
    keyMetricValue: '700',
    keyMetricUnit: 'GHz (~80% Range)',
    statusSummary:
      'Mean-field extendon theory reveals that gain curvature fundamentally limits FM comb bandwidth: reducing GVD below an optimum threshold (which scales quadratically with gain curvature) triggers chaotic amplitude fluctuations. Resonant loss-shaping using evanescently coupled side-disks flattens net gain curvature and expands THz comb bandwidth by ~40% to 700 GHz.',
    challenges: [
      'Scattering into higher-order transverse modes caused by periodic loss-shaping disks along the FP waveguide.',
      'Fragile top metal layer adhesion when electrically biasing micro-disks for active off-center gain shaping.',
      'Breakdown of the adiabatic approximation in standard mean-field theory when comb bandwidth approaches 1/(π T1).'
    ],
    advances: [
      'Inverse-designed facet reflectors and patch-antenna structures that simultaneously shape spectral loss and boost THz outcoupling.',
      'Planarized benzocyclobutene (BCB) polymer waveguides for mechanically robust biased gain/loss-shaping disks.',
      'Non-adiabatic generalized mean-field theory capturing fast and slow comb dynamics in a single equation.'
    ],
    keyReferences: [
      'M. Roy, Z. Xiao, C. Dong, S. Addamane & D. Burghoff, "Fundamental bandwidth limits and shaping of frequency-modulated combs," Optica 11, 1094–1102 (2024).',
      'D. Burghoff, "Combs, fast and slow: non-adiabatic mean field theory of active cavities," arXiv:2411.03281 (2024).'
    ]
  },
  {
    id: 'ch-4-1',
    number: '4.1',
    section: '4. Characterization & Applications',
    title: 'Quantum Cascade Laser Feedback Interferometry for Terahertz Imaging',
    authors: ['Karl Bertling', 'Jari Torniainen', 'Paul Dean', 'Aleksandar D. Rakić'],
    institutions: ['The University of Queensland', 'University of Leeds'],
    correspondingEmails: ['k.bertling@uq.edu.au', 'j.torniainen@uq.edu.au', 'P.Dean@leeds.ac.uk', 'a.rakic@uq.edu.au'],
    pdfPages: 'pp. 57–59',
    startPage: 57,
    spectralRegime: 'THz',
    keyMetricLabel: 'Detection Scheme',
    keyMetricValue: 'Detectorless',
    keyMetricUnit: 'Self-Mixing LFI',
    statusSummary:
      'Laser Feedback Interferometry (LFI) uses the QCL as both source and coherent homodyne detector: backscattered THz radiation re-enters the cavity and perturbs the terminal voltage, yielding both amplitude and phase images without external cryogenic bolometers. Applications include in-vivo skin pathology, PCB inspection, marble heritage, and leaf hydration.',
    challenges: [
      'Slow mechanical raster scanning in single-pixel configurations limiting real-time frame rates.',
      'Strong water vapor absorption in humid ambient environments and cryogenic cooling requirements.',
      'Limited single-device spectral tuning bandwidth for hyperspectral THz identification.'
    ],
    advances: [
      'Sub-microsecond pulsed LFI with Stirling cryocoolers eliminating vibration artifacts and external detectors.',
      'Detectorless 3D terahertz reflectance confocal interferometric microscopy with subwavelength resolution.',
      'Multicolor LFI using QCL arrays and self-detected THz dual-comb spectroscopy.'
    ],
    keyReferences: [
      'A. Rakić et al., "Sensing and imaging using laser feedback interferometry with quantum cascade lasers," Appl. Phys. Rev. 6, 021320 (2019).',
      'P. Dean et al., "Self-Mixing in Quantum Cascade Lasers," Cambridge University Press (2023).',
      'X. Qi et al., "Terahertz in vivo imaging of human skin: Toward detection of abnormal skin pathologies," APL Bioeng. 8, 016117 (2024).'
    ]
  },
  {
    id: 'ch-4-2',
    number: '4.2',
    section: '4. Characterization & Applications',
    title: 'Optical Feedback Dynamics in Quantum Cascade Lasers',
    authors: ['Xiaoqiong Qi', 'Thomas Taimre'],
    institutions: ['The University of Queensland'],
    correspondingEmails: ['x.qi@uq.edu.au', 't.taimre@uq.edu.au'],
    pdfPages: 'pp. 60–62',
    startPage: 60,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Feedback Regimes',
    keyMetricValue: '5 Regimes',
    keyMetricUnit: '+ Self-Pulsation',
    statusSummary:
      'Despite ultrafast carrier lifetimes and small α-factors, MIR and THz QCLs under external optical feedback exhibit all five Tkach-Chraplyvy regimes, transient self-pulsations, quasi-periodic/square-wave patterns, harmonic comb switching, and recently discovered free-running multimode THz chaos.',
    challenges: [
      'Establishing monotonic relationships between target reflectivity/phase and feedback dynamic amplitude across multiple wavelengths.',
      'High detection bandwidth (>10 GHz) required to resolve cavity FSR beatnotes directly.'
    ],
    advances: [
      'Self-pulsation-based THz imaging in pulsed mode requiring zero driving current sweep—ideal for high-T THz QCLs.',
      'Electro-thermal-optical Reduced Rate Equations (RREs) and Maxwell-Bloch models capturing multi-mode feedback.',
      'Dual-comb multi-heterodyne downconversion of optical feedback spectra into RF bands.'
    ],
    keyReferences: [
      'X. Qi et al., "Observation of optical feedback dynamics in single-mode THz QCLs: Transient instabilities," Phys. Rev. A 103, 033504 (2021).',
      'X. Qi et al., "Terahertz imaging with self-pulsations in QCLs under optical feedback," APL Photonics 6, 091301 (2021).',
      'B. B. Liu, C. Silvestri et al., "Terahertz semiconductor laser chaos," arXiv:2410.20099 (2024).'
    ]
  },
  {
    id: 'ch-4-3',
    number: '4.3',
    section: '4. Characterization & Applications',
    title: 'High-Speed Operation of QCLs and Applications to Free-Space Communications',
    authors: ['Olivier Spitz', 'Frédéric Grillot'],
    institutions: ['CREOL, University of Central Florida', 'LTCI Télécom Paris', 'Center for High Technology Materials, UNM'],
    correspondingEmails: ['olivier.spitz@ucf.edu', 'frederic.grillot@telecom-paris.fr'],
    pdfPages: 'pp. 63–68',
    startPage: 63,
    spectralRegime: 'Mid-IR',
    keyMetricLabel: 'Record Direct Rate',
    keyMetricValue: '65',
    keyMetricUnit: 'Gbit/s (8–14 μm)',
    statusSummary:
      'The absence of relaxation oscillation resonance in QCLs and low atmospheric scattering in the 3–5 μm and 8–14 μm transparency windows make QCLs ideal for high-speed Free-Space Optical Communications (FSOCs). Milestones include 65 Gbit/s direct modulation, 40 Gbit/s over 30 m with Stark-effect modulators, and private chaos-synchronized links.',
    challenges: [
      'Closing the bandwidth gap between current external modulators (~10 GHz) and room-temperature intersubband detectors (100 GHz).',
      'Expanding private chaos synchronization bandwidth beyond tens of MHz.',
      'Extending propagation distances from indoor multi-pass cells (30 m) to multi-kilometer outdoor links through turbulence.'
    ],
    advances: [
      'Unipolar Stark-effect and metal-metal optical resonator external modulators combined with Quantum Cascade Detectors (QCDs).',
      'Private communication via chaos synchronization of twin master-slave QCLs recovering concealed 8 Mbit/s messages.',
      'Silicon photonic processor meshes with Mach-Zehnder modulators to cancel atmospheric turbulence post-reception.'
    ],
    keyReferences: [
      'H. Dely et al., "Unipolar quantum optoelectronics for high speed direct modulation and transmission in 8–14 μm atmospheric window," Nat. Commun. 15, 8040 (2024).',
      'P. Didier et al., "Data encryption with chaotic light in the long wavelength infrared atmospheric window," Optica 11, 626–633 (2024).'
    ]
  },
  {
    id: 'ch-4-4',
    number: '4.4',
    section: '4. Characterization & Applications',
    title: 'QCL-Based Quartz-Enhanced Photoacoustic Spectroscopy for Gas Sensing',
    authors: ['Marilena Giglio', 'Angelo Sampaolo', 'Pietro Patimisco', 'Vincenzo Spagnolo'],
    institutions: ['PolySense Lab, Dipartimento Interateneo di Fisica, University and Polytechnic of Bari'],
    correspondingEmails: ['marilena.giglio@poliba.it', 'vincenzoluigi.spagnolo@poliba.it'],
    pdfPages: 'pp. 69–72',
    startPage: 69,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'SF₆ Detection Limit',
    keyMetricValue: '50',
    keyMetricUnit: 'ppt (NEC)',
    statusSummary:
      'Quartz-Enhanced Photoacoustic Spectroscopy (QEPAS) replaces conventional microphones with high-Q (~10^4) millimeter-scale Quartz Tuning Forks (QTFs) to detect acoustic waves from modulated QCL gas excitation, achieving parts-per-trillion (ppt) to parts-per-billion (ppb) sensitivity across 4–100 μm.',
    challenges: [
      'Resolving overlapping mid-IR absorption spectra in complex volatile organic compound (VOC / BTEX) mixtures.',
      'Limited optical power in long-wavelength (12–15 μm) InAs-based QCLs and high cost of DFB QCL arrays.'
    ],
    advances: [
      'Dual-gas simultaneous detection by exciting QTF fundamental and overtone flexural modes from opposite sides.',
      'Low-cost widely tunable slot-waveguide QCL arrays and monolithic multi-color InP photonic integrated circuits.',
      'Lithium Niobate (LiNbO3) tuning forks paving the way for fully integrated photonic gas sensors.'
    ],
    keyReferences: [
      'P. Patimisco et al., "QEPAS Sensor Based on a Multi-Laser Source for In-Sequence Detection of NO2, SO2, and NH3," Sensors 23, 9005 (2023).',
      'K. Kinjalk et al., "Highly selective and sensitive detection of VOCs using long wavelength InAs-based QCLs through QEPAS," Appl. Phys. Rev. 11, 021401 (2024).'
    ]
  },
  {
    id: 'ch-4-5',
    number: '4.5',
    section: '4. Characterization & Applications',
    title: 'Terahertz Quantum Cascade Lasers for Near-Field Imaging',
    authors: ['Eva A. A. Pogna'],
    institutions: ['CNR-IFN (Istituto di Fotonica e Nanotecnologie), Milano'],
    correspondingEmails: ['eva.pogna@cnr.it'],
    pdfPages: 'pp. 73–76',
    startPage: 73,
    spectralRegime: 'THz',
    keyMetricLabel: 'Spatial Resolution',
    keyMetricValue: '~10',
    keyMetricUnit: 'nm (λ / 10⁴)',
    statusSummary:
      'Coupling CW THz-QCLs (~100 Hz intrinsic linewidth) with scattering Scanning Near-Field Optical Microscopy (s-SNOM) AFM tips achieves λ/10^4 nanoscale spatial resolution via detectorless self-mixing interferometry, mapping Dirac plasmon polaritons in topological insulators, anisotropic polaritons in black phosphorus, and nanowire photocurrents.',
    challenges: [
      'Expanding hyperspectral nanoimaging bandwidth across the full 1.2–5.4 THz range while maintaining comb coherence under tip feedback.',
      'Low scattering efficiency of sub-wavelength tips and cryogenic liquid dependencies.'
    ],
    advances: [
      'Phase-sensitive hyperspectral near-field nanoscopy using self-induced phase locking of THz QCL frequency combs (680 GHz span at 3.1 THz).',
      'Synthetic optical holography for rapid amplitude-and-phase nanoimaging.',
      'Cantilevered THz-resonant antenna tips for enhanced nanofocusing.'
    ],
    keyReferences: [
      'E. A. A. Pogna et al., "Mapping propagation of collective modes in Bi2Se3 and Bi2Te2.2Se0.8 topological insulators by near-field THz nanoscopy," Nat. Commun. 12, 6672 (2021).',
      'V. Pistore et al., "Self-Induced Phase Locking of Terahertz Frequency Combs in a Phase-Sensitive Hyperspectral Near-Field Nanoscope," Adv. Sci. 9, 2200410 (2022).'
    ]
  },
  {
    id: 'ch-4-6',
    number: '4.6',
    section: '4. Characterization & Applications',
    title: 'Advances in Near-Field Optical Microscopy Based on Infrared Quantum Cascade Lasers',
    authors: ['Xiao Guo', 'Rainer Hillenbrand', 'Mengkun Liu', 'Michael Brünig', 'Adrian Cernescu', 'Alexander A. Govyadinov', 'Karl Bertling'],
    institutions: ['The University of Queensland', 'CIC nanoGUNE / Ikerbasque', 'Stony Brook University / Brookhaven National Lab', 'Attocube systems AG (neaspec)'],
    correspondingEmails: ['xiao.guo@uq.edu.au', 'r.hillenbrand@nanogune.eu', 'mengkun.liu@stonybrook.edu', 'k.bertling@uq.edu.au'],
    pdfPages: 'pp. 77–80',
    startPage: 77,
    spectralRegime: 'Mid-IR',
    keyMetricLabel: 'Sweep Speed',
    keyMetricValue: '3×10⁴',
    keyMetricUnit: 'cm⁻¹/s (>12 W CW)',
    statusSummary:
      'Mid-IR QCL-based s-SNOM (400–4000 cm^-1) leverages pseudo-heterodyne background-free detection to map macromolecular functional groups, Drude conductivity in 2D polymers, hyperbolic phonon polaritons, and millisecond photoswitching of single lipid vesicles in native liquid water.',
    challenges: [
      'Single QCL chip tuning range (<300 cm^-1) leaves gaps above 2500 cm^-1 (N-H, O-H stretches) and below 750 cm^-1.',
      'Non-trivial inverse problem of tip-sample electromagnetic interaction in heterogeneous 3D nanostructures.'
    ],
    advances: [
      'Monolithic InP photonic integrated circuits multiplexing dissimilar QCL active regions across >800 cm^-1.',
      'CycleGAN deep learning denoising reducing pixel integration time to 3.3 ms/pixel (3× speedup).',
      'Physics-Informed Neural Networks (PINNs / Kolmogorov-Arnold Networks) embedding Maxwell’s equations for mesh-free digital twins.'
    ],
    keyReferences: [
      'R. Hillenbrand et al., "Visible-to-THz near-field nanoscopy," Nat. Rev. Mater. 10, 285–310 (2025).',
      'T. Gölz et al., "Transient infrared nanoscopy resolves the millisecond photoswitching dynamics of single lipid vesicles in water," Nat. Commun. 16, 6033 (2025).'
    ]
  },
  {
    id: 'ch-4-7',
    number: '4.7',
    section: '4. Characterization & Applications',
    title: 'Present and Future Challenges for Mid-/Far-Infrared Quantum Light Generation via QCLs',
    authors: ['Tecla Gabbrielli', 'Jacopo Pelini', 'Irene La Penna', 'Alessia Sorgi', 'Paolo De Natale', 'Davide Mazzotti', 'Iacopo Galli', 'Luigi Consolino', 'Francesco Cappelli', 'Simone Borri'],
    institutions: ['CNR-INO (Istituto Nazionale di Ottica)', 'LENS (European Laboratory for Non-Linear Spectroscopy)', 'University of Naples Federico II'],
    correspondingEmails: ['tecla.gabbrielli@ino.cnr.it', 'paolo.denatale@ino.cnr.it', 'francesco.cappelli@ino.cnr.it', 'simone.borri@ino.cnr.it'],
    pdfPages: 'pp. 81–85',
    startPage: 81,
    spectralRegime: 'Mid-IR & THz',
    keyMetricLabel: 'Shot-Noise Clearance',
    keyMetricValue: '9',
    keyMetricUnit: 'dB (100 MHz BW)',
    statusSummary:
      'High χ^(3) four-wave mixing (FWM) in QCL harmonic frequency combs makes them prime candidates for chip-scale generation of squeezed and twin-beam entangled MIR/FIR states. MIR balanced homodyne detectors using high-QE (40%) MCT photodiodes have achieved 9 dB sub-shot-noise clearance and atto-watt coherent detection.',
    challenges: [
      'Excess relative intensity noise (RIN) at low Fourier frequencies (<1 GHz) coupled via driving current noise and the α-factor.',
      'Lack of high-bandwidth, high-dynamic-range FIR (1–10 THz) detectors capable of sub-shot-noise operation.'
    ],
    advances: [
      'Demonstration of intensity correlations in twin sideband modes of a three-mode MIR QCL Harmonic Comb.',
      'Room-temperature balanced heterodyne setup achieving atto-watt photo-detection at mid-IR wavelengths.',
      'QATACOMB & MUQUABIS projects developing graphene-based THz quantum sensors and Maxwell-density-matrix Langevin noise models.'
    ],
    keyReferences: [
      'T. Gabbrielli et al., "Intensity correlations in quantum cascade laser harmonic frequency combs," Adv. Photon. Res. 3, 2200162 (2022).',
      'T. Gabbrielli et al., "Shot-noise-limited emission from interband and quantum cascade lasers," Opt. Express 33, 35620–35634 (2025).',
      'L. Mancini et al., "Atto-Watt Photo-Detection at Mid-Infrared Wavelengths by a Room-Temperature Balanced Heterodyne Set-Up," Laser Photon. Rev. e01339 (2025).'
    ]
  }
];

export const WAFER_BENCHMARKS: WaferBenchmark[] = [
  { waferId: 'VA1281', facility: 'Sandia National Lab (Veeco Gen20 / EPI1240)', alFraction: 0.25, tMaxK: 232, designType: '2-Well Direct Phonon', freqTHz: 3.8 },
  { waferId: 'G936', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.30, tMaxK: 235, designType: '3-Well Direct Phonon', freqTHz: 3.9 },
  { waferId: 'VA1028', facility: 'Sandia National Lab (Veeco Gen20 / EPI1240)', alFraction: 0.30, tMaxK: 242, designType: '2-Well Direct Phonon', freqTHz: 3.9 },
  { waferId: 'VA1030', facility: 'Sandia National Lab (Veeco Gen20 / EPI1240)', alFraction: 0.35, tMaxK: 245, designType: '2-Well Direct Phonon', freqTHz: 4.0 },
  { waferId: 'VB1278', facility: 'Sandia National Lab (Veeco Gen20 / EPI1240)', alFraction: 0.35, tMaxK: 246, designType: '2-Well Direct Phonon', freqTHz: 4.0 },
  { waferId: 'G652', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.30, tMaxK: 250, designType: '2-Well Direct Phonon', freqTHz: 4.0 },
  { waferId: 'VA1186', facility: 'Sandia National Lab (Veeco Gen20 / EPI1240)', alFraction: 0.35, tMaxK: 252, designType: '2-Well Direct Phonon', freqTHz: 4.1 },
  { waferId: 'G930', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.35, tMaxK: 259, designType: '2-Well Direct Phonon', freqTHz: 4.1 },
  { waferId: 'G902', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.35, tMaxK: 260, designType: '2-Well Direct Phonon', freqTHz: 4.2 },
  { waferId: 'G813', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.35, tMaxK: 260, designType: '2-Well Direct Phonon', freqTHz: 4.2 },
  { waferId: 'G938', facility: 'University of Waterloo (Veeco GEN10)', alFraction: 0.35, tMaxK: 261, designType: '2-Well Direct Phonon (Record)', freqTHz: 4.2 }
];

export const GAS_QEPAS_BENCHMARKS: GasQepasBenchmark[] = [
  { formula: 'SF₆', name: 'Sulfur Hexafluoride', wavelengthUm: 10.55, spectralBand: 'Mid-IR', necPpb: 0.05, necDisplay: '50 ppt', application: 'High-voltage dielectric leak tracing' },
  { formula: 'CO₂', name: 'Carbon Dioxide', wavelengthUm: 4.23, spectralBand: 'Mid-IR', necPpb: 0.3, necDisplay: '300 ppt', application: 'Atmospheric & isotope monitoring' },
  { formula: 'CO', name: 'Carbon Monoxide', wavelengthUm: 4.61, spectralBand: 'Mid-IR', necPpb: 1.5, necDisplay: '1.5 ppb', application: 'Combustion & industrial safety' },
  { formula: 'N₂O', name: 'Nitrous Oxide', wavelengthUm: 7.83, spectralBand: 'Mid-IR', necPpb: 2.8, necDisplay: '2.8 ppb', application: 'Agricultural greenhouse flux' },
  { formula: 'C₆H₆', name: 'Benzene (BTEX)', wavelengthUm: 14.85, spectralBand: 'Mid-IR', necPpb: 3.2, necDisplay: '3.2 ppb', application: 'Petrochemical & breath diagnostics' },
  { formula: 'NH₃', name: 'Ammonia', wavelengthUm: 10.34, spectralBand: 'Mid-IR', necPpb: 4.5, necDisplay: '4.5 ppb', application: 'Exhaled breath renal biomarker' },
  { formula: 'NO', name: 'Nitric Oxide', wavelengthUm: 5.26, spectralBand: 'Mid-IR', necPpb: 5.0, necDisplay: '5.0 ppb', application: 'Airway inflammation & emissions' },
  { formula: 'CH₄', name: 'Methane', wavelengthUm: 7.66, spectralBand: 'Mid-IR', necPpb: 9.0, necDisplay: '9.0 ppb', application: 'Natural gas pipeline leak sensing' },
  { formula: 'C₂H₄', name: 'Ethylene', wavelengthUm: 10.53, spectralBand: 'Mid-IR', necPpb: 25, necDisplay: '25 ppb', application: 'Agri-photonics fruit ripening' },
  { formula: 'SO₂', name: 'Sulfur Dioxide', wavelengthUm: 7.42, spectralBand: 'Mid-IR', necPpb: 80, necDisplay: '80 ppb', application: 'Volcanic & flue gas monitoring' },
  { formula: 'CH₃OH', name: 'Methanol (THz)', wavelengthUm: 88.5, spectralBand: 'THz', necPpb: 1200, necDisplay: '1.2 ppm', application: 'Terahertz rotational spectroscopy' },
  { formula: 'H₂S', name: 'Hydrogen Sulfide (THz)', wavelengthUm: 102.0, spectralBand: 'THz', necPpb: 18000, necDisplay: '18 ppm', application: 'Sour gas & petrochemical safety' }
];

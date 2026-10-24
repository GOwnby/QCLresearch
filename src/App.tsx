import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  Search,
  BookOpen,
  ExternalLink,
  RotateCcw,
  X,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  MATERIALS,
  SemiconductorMaterialId,
  computeMaterialDispersion,
  computeScatteringAndGainCurves,
  computeInjectorResonances,
  QclDeviceConfig,
  solveQclElectroThermal,
  CombRegimeType,
  simulateCombDynamics,
  simulatePaperOneStepGradedTHz,
} from './physics/qclModels';
import {
  ROADMAP_CHAPTERS,
  WAFER_BENCHMARKS,
  GAS_QEPAS_BENCHMARKS,
  RoadmapChapter,
} from './data/roadmapData';
import { RESEARCH_THREADS, ResearchPaperThread } from './data/researchThreadsData';

type WorkspaceTab = 'dispersion' | 'electrothermal' | 'combs' | 'roadmap' | 'research';

const DEVICE_PRESETS: Record<string, { label: string; subtitle: string; config: QclDeviceConfig }> = {
  midir_5um: {
    label: '5.0 μm Mid-IR QCL (Table 13.1/13.2)',
    subtitle: 'InGaAs/InAlAs/InP · M = 30 stages · Standard CW Benchmark',
    config: {
      wavelength_um: 5.0,
      stages_M: 30,
      internalEff_eta_i: 0.95,
      tau_eff_ps: 1.1,
      tau_l_ps: 0.25,
      alpha_m1_cmInv: 1.6,
      alpha_i_cmInv: 1.5,
      deltaE_inj_meV: 100,
      rho_s_mOhmCm2: 0.7,
      T0_K: 200,
      T1_K: 350,
      Rth_Kcm2_per_kW: 2.0,
      Jth_300K_kAcm2: 1.0,
      cavityLength_mm: 3.0,
      ridgeWidth_um: 10.0,
      substrateTemp_K: 300,
    },
  },
  lwir_10um: {
    label: '10.0 μm LWIR QCL (Table 13.1)',
    subtitle: 'InGaAs/InAlAs/InP · M = 40 stages · Atmospheric Window',
    config: {
      wavelength_um: 10.0,
      stages_M: 40,
      internalEff_eta_i: 0.95,
      tau_eff_ps: 0.7,
      tau_l_ps: 0.25,
      alpha_m1_cmInv: 1.6,
      alpha_i_cmInv: 2.5,
      deltaE_inj_meV: 100,
      rho_s_mOhmCm2: 0.7,
      T0_K: 175,
      T1_K: 290,
      Rth_Kcm2_per_kW: 2.2,
      Jth_300K_kAcm2: 1.5,
      cavityLength_mm: 3.0,
      ridgeWidth_um: 12.0,
      substrateTemp_K: 300,
    },
  },
  high_wpe_46um: {
    label: '4.6 μm Record-WPE QCL (21% RT)',
    subtitle: 'Strain-Balanced InGaAs/InAlAs · M = 35 stages · Epi-Down Diamond',
    config: {
      wavelength_um: 4.6,
      stages_M: 35,
      internalEff_eta_i: 0.96,
      tau_eff_ps: 1.25,
      tau_l_ps: 0.22,
      alpha_m1_cmInv: 1.8,
      alpha_i_cmInv: 1.1,
      deltaE_inj_meV: 95,
      rho_s_mOhmCm2: 0.55,
      T0_K: 240,
      T1_K: 400,
      Rth_Kcm2_per_kW: 1.4,
      Jth_300K_kAcm2: 0.85,
      cavityLength_mm: 4.0,
      ridgeWidth_um: 10.0,
      substrateTemp_K: 300,
    },
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('research');
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [pdfTargetPage, setPdfTargetPage] = useState<number>(1);

  // ==========================================================================
  // STATE: Tab 1 (Band Structure, Phonon Scattering & Gain)
  // ==========================================================================
  const [selectedMaterial, setSelectedMaterial] = useState<SemiconductorMaterialId>('InGaAs');
  const [latticeTempK, setLatticeTempK] = useState<number>(300);
  const [confinementGamma, setConfinementGamma] = useState<number>(0.70);
  const [stageThicknessNm, setStageThicknessNm] = useState<number>(50);
  const [dipoleOverlapSq, setDipoleOverlapSq] = useState<number>(0.85);
  const [broadeningRatio, setBroadeningRatio] = useState<number>(0.05);
  const [injectorCouplingMeV, setInjectorCouplingMeV] = useState<number>(7.5);
  const [hoverDispersionIdx, setHoverDispersionIdx] = useState<number | null>(null);
  const [hoverScatteringIdx, setHoverScatteringIdx] = useState<number | null>(null);

  // ==========================================================================
  // STATE: Tab 2 (CW Electro-Thermal & Wall-Plug Efficiency)
  // ==========================================================================
  const [activePresetKey, setActivePresetKey] = useState<string>('midir_5um');
  const [deviceConfig, setDeviceConfig] = useState<QclDeviceConfig>(
    DEVICE_PRESETS.midir_5um.config
  );
  const [hoverJIdx, setHoverJIdx] = useState<number | null>(null);

  // ==========================================================================
  // STATE: Tab 3 (Frequency Combs, Extendons & Solitons)
  // ==========================================================================
  const [combRegime, setCombRegime] = useState<CombRegimeType>('fp-fm-extendon');
  const [combCavityLengthMm, setCombCavityLengthMm] = useState<number>(4.0);
  const [combGroupIndex, setCombGroupIndex] = useState<number>(3.35);
  const [combGvd, setCombGvd] = useState<number>(0.95);
  const [combGainCurvature, setCombGainCurvature] = useState<number>(2.2);
  const [combLossShaping, setCombLossShaping] = useState<number>(4.0);
  const [combHarmonicOrder, setCombHarmonicOrder] = useState<number>(3);
  const [hoverCombTimeIdx, setHoverCombTimeIdx] = useState<number | null>(null);

  // ==========================================================================
  // STATE: Tab 4 (JPhys Photonics QCL Roadmap Explorer)
  // ==========================================================================
  const [roadmapSearch, setRoadmapSearch] = useState<string>('');
  const [roadmapSectionFilter, setRoadmapSectionFilter] = useState<string>('ALL');
  const [roadmapRegimeFilter, setRoadmapRegimeFilter] = useState<string>('ALL');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch-2-1');

  // ==========================================================================
  // STATE: Tab 5 (Frontier Research Roadmap & Paper Studio)
  // ==========================================================================
  const [selectedPaperId, setSelectedPaperId] = useState<string>('paper-1');
  const [paperOneDepopMeV, setPaperOneDepopMeV] = useState<number>(54);
  const [paperOneInterfacialAl, setPaperOneInterfacialAl] = useState<number>(0.22);
  const [paperOneCoreAl, setPaperOneCoreAl] = useState<number>(0.42);
  const [customDraftNotes, setCustomDraftNotes] = useState<Record<string, string>>({});

  // ==========================================================================
  // COMPUTED PHYSICS MODELS
  // ==========================================================================
  const dispersionData = useMemo(
    () => computeMaterialDispersion(selectedMaterial),
    [selectedMaterial]
  );

  const scatteringGainData = useMemo(
    () =>
      computeScatteringAndGainCurves(
        latticeTempK,
        confinementGamma,
        stageThicknessNm,
        dipoleOverlapSq,
        broadeningRatio
      ),
    [latticeTempK, confinementGamma, stageThicknessNm, dipoleOverlapSq, broadeningRatio]
  );

  const resonanceData = useMemo(
    () => computeInjectorResonances(injectorCouplingMeV),
    [injectorCouplingMeV]
  );

  const electroThermalResult = useMemo(
    () => solveQclElectroThermal(deviceConfig),
    [deviceConfig]
  );

  const combResult = useMemo(
    () =>
      simulateCombDynamics(
        combRegime,
        combCavityLengthMm,
        combGroupIndex,
        combGvd,
        combGainCurvature,
        combLossShaping,
        combHarmonicOrder
      ),
    [
      combRegime,
      combCavityLengthMm,
      combGroupIndex,
      combGvd,
      combGainCurvature,
      combLossShaping,
      combHarmonicOrder,
    ]
  );

  const paperOneSim = useMemo(
    () =>
      simulatePaperOneStepGradedTHz(
        paperOneDepopMeV,
        paperOneInterfacialAl,
        paperOneCoreAl
      ),
    [paperOneDepopMeV, paperOneInterfacialAl, paperOneCoreAl]
  );

  const filteredChapters = useMemo(() => {
    return ROADMAP_CHAPTERS.filter((ch) => {
      const matchesSection =
        roadmapSectionFilter === 'ALL' || ch.section === roadmapSectionFilter;
      const matchesRegime =
        roadmapRegimeFilter === 'ALL' ||
        ch.spectralRegime === roadmapRegimeFilter ||
        ch.spectralRegime === 'Mid-IR & THz';
      const q = roadmapSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        ch.title.toLowerCase().includes(q) ||
        ch.authors.some((a) => a.toLowerCase().includes(q)) ||
        ch.institutions.some((inst) => inst.toLowerCase().includes(q)) ||
        ch.statusSummary.toLowerCase().includes(q) ||
        ch.number.toLowerCase().includes(q);
      return matchesSection && matchesRegime && matchesQuery;
    });
  }, [roadmapSearch, roadmapSectionFilter, roadmapRegimeFilter]);

  const selectedChapter: RoadmapChapter = useMemo(() => {
    return (
      ROADMAP_CHAPTERS.find((c) => c.id === selectedChapterId) ||
      filteredChapters[0] ||
      ROADMAP_CHAPTERS[0]
    );
  }, [selectedChapterId, filteredChapters]);

  const selectedPaper: ResearchPaperThread = useMemo(() => {
    return (
      RESEARCH_THREADS.find((p) => p.id === selectedPaperId) || RESEARCH_THREADS[0]
    );
  }, [selectedPaperId]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleSelectPreset = (key: string) => {
    setActivePresetKey(key);
    setDeviceConfig({ ...DEVICE_PRESETS[key].config });
  };

  const handleOpenPdfAtPage = (page: number) => {
    setPdfTargetPage(page);
    setPdfModalOpen(true);
  };

  const handleExportManuscript = (paper: ResearchPaperThread, format: 'tex' | 'md') => {
    const abstractText = customDraftNotes[paper.id] ?? paper.draftAbstract;
    let content = '';
    let filename = `${paper.id}_manuscript.${format}`;

    if (format === 'tex') {
      content = `${paper.latexTemplateSnippet}

% ============================================================================
% FULL MANUSCRIPT DRAFT — ${paper.paperNumber}: ${paper.shortTitle}
% ============================================================================

\\section{Introduction}
${paper.coreProblemGap}

\\section{Theoretical Formulation}
${paper.theoreticalInnovation}

${paper.keyEquations
  .map(
    (eq) => `\\subsection{${eq.label}}
\\begin{equation}
  \\text{${eq.formula}}
\\end{equation}
% ${eq.description}`
  )
  .join('\n\n')}

\\section{Quantitative Projections \\& Discussion}
\\begin{itemize}
${paper.quantitativePredictions
  .map(
    (q) =>
      `  \\item \\textbf{${q.metric}}: Baseline ${q.baselineStateOfArt} $\\rightarrow$ Projected ${q.projectedValue} (${q.improvementNote}).`
  )
  .join('\n')}
\\end{itemize}

\\end{document}
`;
    } else {
      content = `# ${paper.paperNumber}: ${paper.fullTitle}

**Target Venues:** ${paper.targetJournals.join(', ')}
**Synthesized Sources:**
${paper.synthesizedSources.map((s) => `- ${s}`).join('\n')}

## Abstract
${abstractText}

## 1. Core Research Gap & Motivation
${paper.coreProblemGap}

## 2. Theoretical Innovation & Governing Equations
${paper.theoreticalInnovation}

${paper.keyEquations
  .map((eq) => `### ${eq.label}\n\`\`\`\n${eq.formula}\n\`\`\`\n${eq.description}`)
  .join('\n\n')}

## 3. Quantitative Predictions vs. State of the Art
| Metric | State-of-the-Art Baseline | Projected Value | Scientific Impact |
| :--- | :--- | :--- | :--- |
${paper.quantitativePredictions
  .map(
    (q) =>
      `| ${q.metric} | ${q.baselineStateOfArt} | **${q.projectedValue}** | ${q.improvementNote} |`
  )
  .join('\n')}

## 4. Manuscript Section Blueprint
${paper.manuscriptOutline
  .map(
    (sec) =>
      `### ${sec.sectionTitle}\n${sec.summaryPoints.map((pt) => `- ${pt}`).join('\n')}`
  )
  .join('\n\n')}
`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    let csvContent = '';
    let filename = 'qcl_simulation_data.csv';

    if (activeTab === 'dispersion') {
      filename = `qcl_dispersion_${selectedMaterial}.csv`;
      csvContent =
        'k_inv_Angstrom,E_parabolic_eV,E_1band_nonparabolic_eV,E_2band_Kane_eV,E_3band_Kane_eV\n' +
        dispersionData
          .map(
            (d) =>
              `${d.k_invA},${d.E_parabolic},${d.E_oneBand},${d.E_twoBand},${d.E_threeBand}`
          )
          .join('\n');
    } else if (activeTab === 'electrothermal') {
      filename = `qcl_electrothermal_${deviceConfig.wavelength_um}um.csv`;
      csvContent =
        'J_kA_cm2,WPE_CW,WPE_Pulsed,Power_CW_W,Power_Pulsed_W,Core_Temp_K,Voltage_V,ICL_3.5um_WPE_CW,ICL_3.5um_Power_W\n' +
        electroThermalResult.curves
          .map(
            (c) =>
              `${c.J_kAcm2},${c.wpe_qcl},${c.wpe_qcl_pulsed},${c.power_qcl_W},${c.power_qcl_pulsed_W},${c.coreTemp_K},${c.voltage_V},${c.wpe_icl},${c.power_icl_W}`
          )
          .join('\n');
    } else {
      filename = `qcl_comb_${combRegime}.csv`;
      csvContent =
        'Mode_Index,Freq_Offset_GHz,Power_dB,Unshaped_Gain,Loss_Shaped_Net_Gain\n' +
        combResult.spectrumTeeth
          .map(
            (t) =>
              `${t.modeIndex},${t.freqOffset_GHz},${t.power_dB},${t.unshapedGain_norm},${t.shapedNetGain_norm}`
          )
          .join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentMat = MATERIALS[selectedMaterial];
  const activeDispPoint =
    hoverDispersionIdx !== null
      ? dispersionData[hoverDispersionIdx]
      : dispersionData[30];
  const activeScatPoint =
    hoverScatteringIdx !== null
      ? scatteringGainData[hoverScatteringIdx]
      : scatteringGainData[30];
  const activeETPoint =
    hoverJIdx !== null
      ? electroThermalResult.curves[hoverJIdx]
      : electroThermalResult.curves[60];
  const activeCombPoint =
    hoverCombTimeIdx !== null
      ? combResult.timeTrace[hoverCombTimeIdx]
      : combResult.timeTrace[40];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* ====================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Contract, gap-8)
      ==================================================================== */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('research');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          QCL Research Workbench
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('research')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'research'
                ? 'border-cyan-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Research & Papers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dispersion')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'dispersion'
                ? 'border-cyan-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Band & Scattering
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('electrothermal')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'electrothermal'
                ? 'border-cyan-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            CW & Thermal WPE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('combs')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'combs'
                ? 'border-cyan-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Frequency Combs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'border-cyan-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            JPhys Roadmap
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenPdfAtPage(1)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Roadmap PDF
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
        {(
          [
            ['research', 'Research & Papers'],
            ['dispersion', 'Band & Scattering'],
            ['electrothermal', 'CW & Thermal WPE'],
            ['combs', 'Frequency Combs'],
            ['roadmap', 'JPhys Roadmap'],
          ] as [WorkspaceTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ====================================================================
          TOP TELEMETRY RIBBON
      ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2 bg-[#F1F5F9] border-b border-slate-200 text-xs">
        <div className="flex items-center gap-3 text-slate-600 font-mono">
          <span className="text-emerald-700 font-semibold">● Calibration Nominal</span>
          <span aria-hidden="true">·</span>
          <span>
            Synthesis: Vurgaftman Ch. 13 (Eqs. 13.1–13.56) + JPhys Photonics Roadmap (18 Chapters) +
            6 Novel Research Papers
          </span>
        </div>

        <div className="flex items-center gap-4">
          {activeTab !== 'roadmap' && activeTab !== 'research' && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          )}
          <a
            href="/QCLroadmap.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-700 hover:text-cyan-800 transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Direct PDF (3.1 MB)</span>
          </a>
        </div>
      </div>

      {/* ====================================================================
          WORKSPACE MODULE 5: FRONTIER RESEARCH ROADMAP & PAPER STUDIO
      ==================================================================== */}
      {activeTab === 'research' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
          {/* Top Overview Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-xs font-mono text-cyan-700 font-semibold">
                  INTERNAL QCL RESEARCH ROADMAP · 6 PUBLISHABLE THEORETICAL THREADS
                </div>
                <h1 className="text-lg font-bold text-slate-900 mt-1">
                  Frontier Research Threads & Manuscript Studio (Papers I – VI)
                </h1>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Synthesized by cross-referencing the analytical semiconductor equations in
                  Vurgaftman, Lumb &amp; Meyer (Chapter 13, Eqs. 13.1–13.56) with the 18 chapters of
                  the <em>Journal of Physics: Photonics Quantum Cascade Laser Roadmap</em>. Select
                  any research paper below to inspect its exact mathematical formulation, run live
                  parametric simulations, edit the manuscript draft, and export peer-review-ready
                  LaTeX (<code>.tex</code>) or Markdown (<code>.md</code>) files.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="/Internal_QCL_Research_Roadmap.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-700" />
                  <span>6-Paper Roadmap PDF</span>
                </a>
                {selectedPaper.id === 'paper-1' && (
                  <a
                    href="/Paper_I_Manuscript.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Paper I PDF (Compiled)</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleExportManuscript(selectedPaper, 'tex')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-700 rounded-md hover:bg-cyan-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Export {selectedPaper.paperNumber} (.tex)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportManuscript(selectedPaper, 'md')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export (.md)</span>
                </button>
              </div>
            </div>

            {/* 6-Paper Selector Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-100">
              {RESEARCH_THREADS.map((thread) => {
                const active = thread.id === selectedPaper.id;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedPaperId(thread.id)}
                    className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-cyan-50/70 border-cyan-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className="font-bold text-cyan-700">{thread.paperNumber}</span>
                      <span>{thread.targetJournals[0].split(' ')[0]}</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {thread.shortTitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Paper Deep-Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 7 COLUMNS: Theoretical Synthesis, Equations & Manuscript Blueprint */}
            <div className="lg:col-span-7 space-y-6">
              {/* Paper Header & Synthesized Sources */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="font-semibold text-cyan-700">{selectedPaper.paperNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>Target Venues: {selectedPaper.targetJournals.join(' / ')}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700">{selectedPaper.status}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedPaper.fullTitle}
                </h2>

                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Synthesized Foundation (Vurgaftman Ch. 13 + JPhys Roadmap)
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc pl-4">
                    {selectedPaper.synthesizedSources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                      Identified Literature Bottleneck
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                      {selectedPaper.coreProblemGap}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-700">
                      Our Theoretical Innovation
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                      {selectedPaper.theoreticalInnovation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Governing Equations Box */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Novel Governing Equations Derived for {selectedPaper.paperNumber}
                </h3>
                <div className="space-y-3">
                  {selectedPaper.keyEquations.map((eq, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-slate-800">{eq.label}</div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-cyan-900 overflow-x-auto whitespace-nowrap">
                        {eq.formula}
                      </div>
                      <p className="text-xs text-slate-600">{eq.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Abstract & Section-by-Section Manuscript Outline */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Manuscript Abstract & Section Blueprint (Editable)
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    Included in .tex &amp; .md exports
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                    Draft Abstract
                  </label>
                  <textarea
                    rows={6}
                    value={customDraftNotes[selectedPaper.id] ?? selectedPaper.draftAbstract}
                    onChange={(e) =>
                      setCustomDraftNotes({
                        ...customDraftNotes,
                        [selectedPaper.id]: e.target.value,
                      })
                    }
                    className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md leading-relaxed focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {selectedPaper.manuscriptOutline.map((sec, idx) => (
                    <div key={idx} className="border-t border-slate-100 pt-3">
                      <h4 className="text-xs font-bold text-slate-900">{sec.sectionTitle}</h4>
                      <ul className="mt-1.5 space-y-1 text-xs text-slate-600 list-disc pl-4">
                        {sec.summaryPoints.map((pt, j) => (
                          <li key={j}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: Quantitative Breakthrough Table & Live Interactive Paper Simulator */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quantitative Predictions vs State-of-the-Art */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Quantitative Predictions vs. Current State of the Art
                </h3>
                <div className="space-y-3">
                  {selectedPaper.quantitativePredictions.map((pred, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-slate-900">{pred.metric}</div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400">
                            Roadmap Baseline
                          </div>
                          <div className="text-slate-600 mt-0.5">{pred.baselineStateOfArt}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-cyan-700 font-semibold">
                            {selectedPaper.paperNumber} Projection
                          </div>
                          <div className="text-cyan-800 font-bold mt-0.5">
                            {pred.projectedValue}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono pt-1">
                        → {pred.improvementNote}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Numerical Verification Sandbox for Paper I (Always visible + interactive) */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 font-semibold">
                    Live Numerical Proof-of-Concept Simulator (Paper I)
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    Step-Graded Barrier + Over-Resonant LO-Phonon THz QCL
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tune collector depopulation energy δE_LO and interfacial Al composition x_int to
                    observe how suppressing IFR broadening breaks the 261 K G938 ceiling.
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">
                        Collector Depopulation Energy (δE_LO)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {paperOneDepopMeV} <span className="text-slate-400">meV</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={36}
                      max={64}
                      step={2}
                      value={paperOneDepopMeV}
                      onChange={(e) => setPaperOneDepopMeV(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>36 meV (Resonant)</span>
                      <span>54 meV (Optimal)</span>
                      <span>64 meV</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">
                        Interfacial Buffer Al Fraction (x_int)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {paperOneInterfacialAl.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.16}
                      max={0.36}
                      step={0.02}
                      value={paperOneInterfacialAl}
                      onChange={(e) => setPaperOneInterfacialAl(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">
                        Core Barrier Al Fraction (x_core)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {paperOneCoreAl.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.32}
                      max={0.45}
                      step={0.01}
                      value={paperOneCoreAl}
                      onChange={(e) => setPaperOneCoreAl(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live KPI Readout */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Projected T_max
                    </div>
                    <div className="text-lg font-mono font-bold text-cyan-700 tabular-nums">
                      {paperOneSim.tMax_proposed_K} K
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      vs 261 K G938
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      IFR Width 2Δ_l
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                      {paperOneSim.ifrLinewidth_meV}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">meV (vs 18.4)</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      ΔP_th Saving
                    </div>
                    <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums">
                      -{paperOneSim.thresholdReduction_pct}%
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      T₀ = {paperOneSim.characteristicT0_K} K
                    </div>
                  </div>
                </div>

                {/* SVG Plot: Peak Gain vs Temperature Crossing α_cav = 16 cm^-1 */}
                <svg viewBox="0 0 380 210" className="w-full h-auto select-none">
                  {[0, 10, 20, 30, 40].map((gVal) => {
                    const y = 175 - (gVal / 42) * 145;
                    return (
                      <g key={gVal}>
                        <line x1={42} y1={y} x2={360} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={36}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {gVal}
                        </text>
                      </g>
                    );
                  })}
                  {[180, 210, 240, 270, 300].map((tVal) => {
                    const x = 42 + ((tVal - 180) / 125) * 318;
                    return (
                      <g key={tVal}>
                        <line x1={x} y1={30} x2={x} y2={175} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={x}
                          y={190}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {tVal} K
                        </text>
                      </g>
                    );
                  })}
                  <line x1={42} y1={30} x2={42} y2={175} stroke="#475569" strokeWidth={1.2} />
                  <line x1={42} y1={175} x2={360} y2={175} stroke="#475569" strokeWidth={1.2} />

                  {/* Cavity Loss Threshold Line α_cav = 16 cm^-1 */}
                  <line
                    x1={42}
                    y1={175 - (16 / 42) * 145}
                    x2={360}
                    y2={175 - (16 / 42) * 145}
                    stroke="#E11D48"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={355}
                    y={175 - (16 / 42) * 145 - 5}
                    textAnchor="end"
                    className="text-[9px] font-mono font-semibold fill-rose-700"
                  >
                    Waveguide Loss α_cav = 16 cm⁻¹
                  </text>

                  {/* Uniform x=0.35 Baseline Curve (G938, T_max = 261 K) */}
                  <polyline
                    fill="none"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    points={paperOneSim.curve
                      .map(
                        (pt) =>
                          `${42 + ((pt.temp_K - 180) / 125) * 318},${Math.max(
                            30,
                            175 - (pt.gain_uniform35_cmInv / 42) * 145
                          )}`
                      )
                      .join(' ')}
                  />

                  {/* Proposed Step-Graded Curve */}
                  <polyline
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth={2.5}
                    points={paperOneSim.curve
                      .map(
                        (pt) =>
                          `${42 + ((pt.temp_K - 180) / 125) * 318},${Math.max(
                            30,
                            175 - (pt.gain_stepGraded_cmInv / 42) * 145
                          )}`
                      )
                      .join(' ')}
                  />

                  <text
                    x={160}
                    y={52}
                    className="text-[9px] font-mono font-semibold fill-cyan-700"
                  >
                    — Step-Graded SGCB (T_max = {paperOneSim.tMax_proposed_K} K)
                  </text>
                  <text x={160} y={65} className="text-[9px] font-mono fill-slate-600">
                    -- Uniform Al₀.₃₅Ga₀.₆₅As G938 (261 K)
                  </text>
                  <text
                    x={14}
                    y={105}
                    textAnchor="middle"
                    transform="rotate(-90 14 105)"
                    className="text-[9px] font-mono fill-slate-700"
                  >
                    Peak Gain g_p (cm⁻¹)
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          WORKSPACE MODULE 1: INTERSUBBAND DISPERSION & PHONON SCATTERING
      ==================================================================== */}
      {activeTab === 'dispersion' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT CONTROL & PARAMETER COLUMN (4 cols on lg) */}
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-6">
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  01. Hierarchy of Intersubband Models
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Multi-band k·p conduction subband dispersion (Eqs. 13.1–13.7), optical-phonon
                  scattering rate (Eq. 13.14), and modal differential gain (Eq. 13.15).
                </p>
              </div>

              {/* Active Quantum-Well Material Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Quantum-Well Material System
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-md">
                  {(['GaAs', 'InGaAs', 'InAs'] as SemiconductorMaterialId[]).map((matId) => (
                    <button
                      key={matId}
                      type="button"
                      onClick={() => setSelectedMaterial(matId)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedMaterial === matId
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {matId === 'InGaAs' ? 'In₀.₅₃Ga₀.₄₇As' : matId}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 font-mono tabular-nums">
                  <span>E_g = {currentMat.Eg_eV.toFixed(3)} eV</span>
                  <span aria-hidden="true">·</span>
                  <span>Δ = {currentMat.Delta_eV.toFixed(3)} eV</span>
                  <span aria-hidden="true">·</span>
                  <span>m_e(0) = {currentMat.me0_ratio} m₀</span>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Parameter Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Lattice Temperature (T)</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {latticeTempK} <span className="text-slate-400">K</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={77}
                    max={450}
                    step={5}
                    value={latticeTempK}
                    onChange={(e) => setLatticeTempK(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>77 K (LN₂)</span>
                    <span>300 K (RT)</span>
                    <span>450 K</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Optical Confinement Factor (Γ)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {confinementGamma.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={0.95}
                    step={0.05}
                    value={confinementGamma}
                    onChange={(e) => setConfinementGamma(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Stage Thickness (d)</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {stageThicknessNm} <span className="text-slate-400">nm</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={75}
                    step={5}
                    value={stageThicknessNm}
                    onChange={(e) => setStageThicknessNm(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Transition Overlap (|O₁₂|² / |I_ul|²)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {dipoleOverlapSq.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={1.0}
                    step={0.05}
                    value={dipoleOverlapSq}
                    onChange={(e) => setDipoleOverlapSq(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>0.25 (Indirect)</span>
                    <span>0.70 (Hybrid)</span>
                    <span>1.00 (Direct)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Interface Roughness Broadening (Δ_l / ΔE)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {broadeningRatio.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.025}
                    max={0.10}
                    step={0.005}
                    value={broadeningRatio}
                    onChange={(e) => setBroadeningRatio(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Injector Anticrossing Coupling (V₀, Fig. 13.8)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {injectorCouplingMeV.toFixed(1)} <span className="text-slate-400">meV</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3.0}
                    max={15.0}
                    step={0.5}
                    value={injectorCouplingMeV}
                    onChange={(e) => setInjectorCouplingMeV(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMaterial('InGaAs');
                    setLatticeTempK(300);
                    setConfinementGamma(0.7);
                    setStageThicknessNm(50);
                    setDipoleOverlapSq(0.85);
                    setBroadeningRatio(0.05);
                    setInjectorCouplingMeV(7.5);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <span className="text-xs font-mono text-slate-500">
                  ℏω₀ = {currentMat.hw0_meV} meV
                </span>
              </div>
            </aside>

            {/* MAIN VIEWPORT / CANVAS STAGE (8 cols on lg) */}
            <section className="lg:col-span-8 space-y-6">
              {/* Top Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Upper-State Lifetime τ_ul
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {(1 / activeScatPoint.scatteringRate_psInv[selectedMaterial]).toFixed(2)}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">ps</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    At ΔE = {(activeScatPoint.deltaE_eV * 1000).toFixed(0)} meV (
                    {activeScatPoint.wavelength_um} μm)
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Modal Diff. Gain (Γ/d)dg/dn
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-cyan-700 tabular-nums">
                      {activeScatPoint.modalDiffGain_e9cm[selectedMaterial].toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-slate-400 ml-1.5">×10⁻⁹ cm</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    Eq. (13.15) · n_r = {currentMat.nr.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Nonparabolic Mass Δm_e
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      +
                      {(
                        (activeDispPoint.E_parabolic / Math.max(activeDispPoint.E_twoBand, 0.001) -
                          1) *
                        100
                      ).toFixed(1)}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">%</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    At k = {activeDispPoint.k_invA.toFixed(3)} Å⁻¹
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Tunneling Time τ_tun = ℏ/V₀
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {(658.2 / injectorCouplingMeV).toFixed(0)}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">fs</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-emerald-700 tabular-nums">
                    Splitting 2V₀ = {(2 * injectorCouplingMeV).toFixed(1)} meV
                  </div>
                </div>
              </div>

              {/* CHART 1: Fig. 13.1 Electron Dispersion E(k) for 4 Hamiltonian Models */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Figure 13.1 — Conduction-Band Electron Dispersion E(k) in {currentMat.formula}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Comparison of Parabolic, 1-Band Energy-Dependent m_e(E) (Eq. 13.7), 2-Band
                      Kane (Eq. 13.5), and 3-Band Kane (Eq. 13.3) models. Hover to inspect.
                    </p>
                  </div>
                  <div className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 tabular-nums">
                    k = {activeDispPoint.k_invA.toFixed(3)} Å⁻¹ · 2-Band:{' '}
                    {activeDispPoint.E_twoBand.toFixed(3)} eV · Parabolic:{' '}
                    {activeDispPoint.E_parabolic.toFixed(3)} eV
                  </div>
                </div>

                <div className="relative">
                  <svg
                    viewBox="0 0 680 260"
                    className="w-full h-auto cursor-crosshair select-none"
                    onMouseLeave={() => setHoverDispersionIdx(null)}
                  >
                    {[0, 0.25, 0.5, 0.75, 1.0].map((eVal) => {
                      const y = 220 - eVal * 195;
                      return (
                        <g key={eVal}>
                          <line x1={55} y1={y} x2={650} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={46}
                            y={y + 4}
                            textAnchor="end"
                            className="text-[10px] font-mono fill-slate-500"
                          >
                            {eVal.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}
                    {[0, 0.03, 0.06, 0.09, 0.12, 0.15].map((kVal) => {
                      const x = 55 + (kVal / 0.15) * 595;
                      return (
                        <g key={kVal}>
                          <line x1={x} y1={25} x2={x} y2={220} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={x}
                            y={238}
                            textAnchor="middle"
                            className="text-[10px] font-mono fill-slate-500"
                          >
                            {kVal.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}

                    <line x1={55} y1={25} x2={55} y2={220} stroke="#475569" strokeWidth={1.2} />
                    <line x1={55} y1={220} x2={650} y2={220} stroke="#475569" strokeWidth={1.2} />
                    <text
                      x={352}
                      y={255}
                      textAnchor="middle"
                      className="text-[11px] font-mono fill-slate-700"
                    >
                      In-Plane Wavevector k (1/Å)
                    </text>
                    <text
                      x={14}
                      y={122}
                      textAnchor="middle"
                      transform="rotate(-90 14 122)"
                      className="text-[11px] font-mono fill-slate-700"
                    >
                      Energy E - E_g (eV)
                    </text>

                    <defs>
                      <clipPath id="disp-clip">
                        <rect x={55} y={25} width={595} height={195} />
                      </clipPath>
                    </defs>

                    <g clipPath="url(#disp-clip)">
                      <polyline
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth={2}
                        points={dispersionData
                          .map(
                            (d) =>
                              `${55 + (d.k_invA / 0.15) * 595},${220 - d.E_parabolic * 195}`
                          )
                          .join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#D97706"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        points={dispersionData
                          .map(
                            (d) =>
                              `${55 + (d.k_invA / 0.15) * 595},${220 - d.E_oneBand * 195}`
                          )
                          .join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#0891B2"
                        strokeWidth={2.5}
                        points={dispersionData
                          .map(
                            (d) =>
                              `${55 + (d.k_invA / 0.15) * 595},${220 - d.E_twoBand * 195}`
                          )
                          .join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        strokeDasharray="2 3"
                        points={dispersionData
                          .map(
                            (d) =>
                              `${55 + (d.k_invA / 0.15) * 595},${220 - d.E_threeBand * 195}`
                          )
                          .join(' ')}
                      />

                      {activeDispPoint && (
                        <g>
                          <line
                            x1={55 + (activeDispPoint.k_invA / 0.15) * 595}
                            y1={25}
                            x2={55 + (activeDispPoint.k_invA / 0.15) * 595}
                            y2={220}
                            stroke="#0891B2"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                          />
                          <circle
                            cx={55 + (activeDispPoint.k_invA / 0.15) * 595}
                            cy={220 - activeDispPoint.E_twoBand * 195}
                            r={4}
                            fill="#0891B2"
                          />
                        </g>
                      )}
                    </g>

                    <g transform="translate(75, 36)">
                      <rect
                        x={0}
                        y={0}
                        width={215}
                        height={76}
                        rx={4}
                        fill="#FFFFFF"
                        fillOpacity={0.92}
                        stroke="#E2E8F0"
                      />
                      <line x1={10} y1={15} x2={34} y2={15} stroke="#0F172A" strokeWidth={2} />
                      <text x={42} y={18} className="text-[10px] font-mono fill-slate-700">
                        Parabolic m_e(0)
                      </text>
                      <line
                        x1={10}
                        y1={32}
                        x2={34}
                        y2={32}
                        stroke="#D97706"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                      />
                      <text x={42} y={35} className="text-[10px] font-mono fill-slate-700">
                        1-Band m_e(E) (Eq. 13.7)
                      </text>
                      <line x1={10} y1={49} x2={34} y2={49} stroke="#0891B2" strokeWidth={2.5} />
                      <text x={42} y={52} className="text-[10px] font-mono fill-slate-700">
                        2-Band Kane (Eq. 13.5/13.6)
                      </text>
                      <line
                        x1={10}
                        y1={65}
                        x2={34}
                        y2={65}
                        stroke="#4F46E5"
                        strokeWidth={2}
                        strokeDasharray="2 3"
                      />
                      <text x={42} y={68} className="text-[10px] font-mono fill-slate-700">
                        3-Band Kane Cubic (Eq. 13.3)
                      </text>
                    </g>

                    {dispersionData.map((d, idx) => (
                      <rect
                        key={d.k_invA}
                        x={55 + (idx / dispersionData.length) * 595}
                        y={25}
                        width={595 / dispersionData.length + 1}
                        height={195}
                        fill="transparent"
                        onMouseEnter={() => setHoverDispersionIdx(idx)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* DUAL CHARTS: Fig. 13.6 Scattering Rate & Fig. 13.7 Modal Differential Gain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Figure 13.6 — Intersubband Phonon Scattering 1/τ_ul
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eq. (13.14) vs Transition Energy ΔE at T = {latticeTempK} K.
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 340 220"
                    className="w-full h-auto cursor-crosshair select-none"
                    onMouseLeave={() => setHoverScatteringIdx(null)}
                  >
                    {[1, 2, 3, 4].map((rVal) => {
                      const y = 185 - ((rVal - 0.5) / 4.0) * 155;
                      return (
                        <g key={rVal}>
                          <line x1={42} y1={y} x2={320} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={36}
                            y={y + 3}
                            textAnchor="end"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {rVal.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                    {[0.1, 0.15, 0.2, 0.25, 0.3].map((deVal) => {
                      const x = 42 + ((deVal - 0.1) / 0.2) * 278;
                      return (
                        <g key={deVal}>
                          <line x1={x} y1={30} x2={x} y2={185} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={x}
                            y={200}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {deVal.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}
                    <line x1={42} y1={30} x2={42} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <line x1={42} y1={185} x2={320} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <text
                      x={181}
                      y={215}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Transition Energy ΔE (eV)
                    </text>
                    <text
                      x={12}
                      y={108}
                      textAnchor="middle"
                      transform="rotate(-90 12 108)"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Scattering Rate (1/ps)
                    </text>

                    <polyline
                      fill="none"
                      stroke="#334155"
                      strokeWidth={1.8}
                      strokeDasharray="5 3"
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - ((d.scatteringRate_psInv.GaAs - 0.5) / 4.0) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="2 3"
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - ((d.scatteringRate_psInv.InAs - 0.5) / 4.0) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#0891B2"
                      strokeWidth={2.4}
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - ((d.scatteringRate_psInv.InGaAs - 0.5) / 4.0) * 155
                            )}`
                        )
                        .join(' ')}
                    />

                    <text x={225} y={78} className="text-[9px] font-mono fill-slate-700">
                      GaAs
                    </text>
                    <text x={225} y={118} className="text-[9px] font-mono fill-amber-700">
                      InAs
                    </text>
                    <text
                      x={225}
                      y={152}
                      className="text-[9px] font-mono font-semibold fill-cyan-700"
                    >
                      In₀.₅₃Ga₀.₄₇As
                    </text>

                    {scatteringGainData.map((d, idx) => (
                      <rect
                        key={d.deltaE_eV}
                        x={42 + (idx / scatteringGainData.length) * 278}
                        y={30}
                        width={278 / scatteringGainData.length + 1}
                        height={155}
                        fill="transparent"
                        onMouseEnter={() => setHoverScatteringIdx(idx)}
                      />
                    ))}
                  </svg>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Figure 13.7 — Modal Differential Gain (Γ/d)dg_ib/dn
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eq. (13.15) with Γ = {confinementGamma.toFixed(2)}, d = {stageThicknessNm} nm,
                      Δ_l/ΔE = {broadeningRatio}.
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 340 220"
                    className="w-full h-auto cursor-crosshair select-none"
                    onMouseLeave={() => setHoverScatteringIdx(null)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((gVal) => {
                      const y = 185 - (gVal / 7.5) * 155;
                      return (
                        <g key={gVal}>
                          <line x1={42} y1={y} x2={320} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={36}
                            y={y + 3}
                            textAnchor="end"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {gVal}
                          </text>
                        </g>
                      );
                    })}
                    {[0.1, 0.15, 0.2, 0.25, 0.3].map((deVal) => {
                      const x = 42 + ((deVal - 0.1) / 0.2) * 278;
                      return (
                        <g key={deVal}>
                          <line x1={x} y1={30} x2={x} y2={185} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={x}
                            y={200}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {deVal.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}
                    <line x1={42} y1={30} x2={42} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <line x1={42} y1={185} x2={320} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <text
                      x={181}
                      y={215}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Transition Energy ΔE (eV)
                    </text>
                    <text
                      x={12}
                      y={108}
                      textAnchor="middle"
                      transform="rotate(-90 12 108)"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Modal Diff. Gain (10⁻⁹ cm)
                    </text>

                    <polyline
                      fill="none"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="2 3"
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - (d.modalDiffGain_e9cm.InAs / 7.5) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#0891B2"
                      strokeWidth={2.4}
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - (d.modalDiffGain_e9cm.InGaAs / 7.5) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#334155"
                      strokeWidth={1.8}
                      strokeDasharray="5 3"
                      points={scatteringGainData
                        .map(
                          (d) =>
                            `${42 + ((d.deltaE_eV - 0.1) / 0.2) * 278},${Math.max(
                              30,
                              185 - (d.modalDiffGain_e9cm.GaAs / 7.5) * 155
                            )}`
                        )
                        .join(' ')}
                    />

                    <text x={215} y={84} className="text-[9px] font-mono fill-amber-700">
                      InAs
                    </text>
                    <text
                      x={205}
                      y={122}
                      className="text-[9px] font-mono font-semibold fill-cyan-700"
                    >
                      InGaAs
                    </text>
                    <text x={205} y={154} className="text-[9px] font-mono fill-slate-700">
                      GaAs
                    </text>

                    {scatteringGainData.map((d, idx) => (
                      <rect
                        key={d.deltaE_eV}
                        x={42 + (idx / scatteringGainData.length) * 278}
                        y={30}
                        width={278 / scatteringGainData.length + 1}
                        height={155}
                        fill="transparent"
                        onMouseEnter={() => setHoverScatteringIdx(idx)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* CHART 3: Fig. 13.8 Injector Transmission Resonance Splitting (2V0) */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Figure 13.8 — Injector-to-Upper-Subband Transmission Resonances (2V₀
                      Anticrossing)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Coherent doublet resolution when V₀ &gt; Δ_l (Δ_l = 0.4 V₀) vs incoherent
                      broadening bottleneck when V₀ &lt; Δ_l (Δ_l = 4 V₀).
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-600 tabular-nums">
                    2V₀ = {(2 * injectorCouplingMeV).toFixed(1)} meV · τ_tun ={' '}
                    {(658.2 / injectorCouplingMeV).toFixed(0)} fs
                  </span>
                </div>

                <svg viewBox="0 0 680 185" className="w-full h-auto select-none">
                  {[0, 0.5, 1.0, 1.5, 2.0].map((ampVal) => {
                    const y = 155 - (ampVal / 2.0) * 130;
                    return (
                      <g key={ampVal}>
                        <line x1={55} y1={y} x2={650} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={46}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {ampVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                  {[-6, -4, -2, 0, 2, 4, 6].map((eVal) => {
                    const x = 55 + ((eVal + 6) / 12) * 595;
                    return (
                      <g key={eVal}>
                        <line x1={x} y1={25} x2={x} y2={155} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={x}
                          y={170}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {eVal}
                        </text>
                      </g>
                    );
                  })}
                  <line x1={55} y1={25} x2={55} y2={155} stroke="#475569" strokeWidth={1.2} />
                  <line x1={55} y1={155} x2={650} y2={155} stroke="#475569" strokeWidth={1.2} />

                  <polyline
                    fill="none"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    points={resonanceData
                      .map(
                        (r, i) =>
                          `${55 + (i / (resonanceData.length - 1)) * 595},${Math.max(
                            25,
                            155 - (r.ampIncoherent / 2.0) * 130
                          )}`
                      )
                      .join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#D97706"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    points={resonanceData
                      .map(
                        (r, i) =>
                          `${55 + (i / (resonanceData.length - 1)) * 595},${Math.max(
                            25,
                            155 - (r.ampCritical / 2.0) * 130
                          )}`
                      )
                      .join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth={2.4}
                    points={resonanceData
                      .map(
                        (r, i) =>
                          `${55 + (i / (resonanceData.length - 1)) * 595},${Math.max(
                            25,
                            155 - (r.ampHighCoherence / 2.0) * 130
                          )}`
                      )
                      .join(' ')}
                  />

                  <text x={450} y={42} className="text-[10px] font-mono fill-slate-600">
                    Δ_l = 4.0 V₀ (Unresolved)
                  </text>
                  <text x={450} y={76} className="text-[10px] font-mono fill-amber-700">
                    Δ_l = 1.0 V₀ (Critical)
                  </text>
                  <text
                    x={450}
                    y={128}
                    className="text-[10px] font-mono font-semibold fill-cyan-700"
                  >
                    Δ_l = 0.4 V₀ (Resolved 2V₀ Doublet)
                  </text>
                </svg>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ====================================================================
          WORKSPACE MODULE 2: CW ELECTRO-THERMAL & WALL-PLUG EFFICIENCY LAB
      ==================================================================== */}
      {activeTab === 'electrothermal' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT CONTROL COLUMN */}
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  02. CW Electro-Thermal & WPE Solver
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Self-consistent CW active-core heating (Eqs. 13.34–13.50), Wall-Plug Efficiency
                  (Eq. 13.33), and QCL vs. ICL comparison (Tables 13.1 & 13.2).
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Reference Device Calibration Preset
                </label>
                <div className="space-y-1.5">
                  {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                        activePresetKey === key
                          ? 'bg-cyan-50/60 border-cyan-600 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">{preset.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{preset.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Emission Wavelength (λ)</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {deviceConfig.wavelength_um.toFixed(1)}{' '}
                      <span className="text-slate-400">
                        μm ({electroThermalResult.photonEnergy_meV} meV)
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3.8}
                    max={12.0}
                    step={0.2}
                    value={deviceConfig.wavelength_um}
                    onChange={(e) =>
                      setDeviceConfig({ ...deviceConfig, wavelength_um: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Number of Cascade Stages (M)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {deviceConfig.stages_M}{' '}
                      <span className="text-slate-400">
                        (Γ = {electroThermalResult.confinementFactor})
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={2}
                    value={deviceConfig.stages_M}
                    onChange={(e) =>
                      setDeviceConfig({ ...deviceConfig, stages_M: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Injector Energy Barrier (δE, Eq. 13.17)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {deviceConfig.deltaE_inj_meV} <span className="text-slate-400">meV</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={180}
                    step={5}
                    value={deviceConfig.deltaE_inj_meV}
                    onChange={(e) =>
                      setDeviceConfig({ ...deviceConfig, deltaE_inj_meV: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Heatsink Temperature (T_s)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {deviceConfig.substrateTemp_K} <span className="text-slate-400">K</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={250}
                    max={450}
                    step={5}
                    value={deviceConfig.substrateTemp_K}
                    onChange={(e) =>
                      setDeviceConfig({ ...deviceConfig, substrateTemp_K: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Thermal Impedance-Area (R_th)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {deviceConfig.Rth_Kcm2_per_kW.toFixed(1)}{' '}
                      <span className="text-slate-400">K·cm²/kW</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={6.0}
                    step={0.2}
                    value={deviceConfig.Rth_Kcm2_per_kW}
                    onChange={(e) =>
                      setDeviceConfig({
                        ...deviceConfig,
                        Rth_Kcm2_per_kW: Number(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">T₀ (K)</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {deviceConfig.T0_K}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={300}
                      step={10}
                      value={deviceConfig.T0_K}
                      onChange={(e) =>
                        setDeviceConfig({ ...deviceConfig, T0_K: Number(e.target.value) })
                      }
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">ρ_s (mΩ·cm²)</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {deviceConfig.rho_s_mOhmCm2.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={1.8}
                      step={0.1}
                      value={deviceConfig.rho_s_mOhmCm2}
                      onChange={(e) =>
                        setDeviceConfig({
                          ...deviceConfig,
                          rho_s_mOhmCm2: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN VIEWPORT / CANVAS STAGE */}
            <section className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Peak CW Wall-Plug Eff.
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-cyan-700 tabular-nums">
                      {electroThermalResult.maxWpePercent.toFixed(1)}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">%</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    At J_wmax = {electroThermalResult.Jwmax_kAcm2} kA/cm²
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Peak CW Output Power
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {electroThermalResult.maxPower_W.toFixed(2)}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">W</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    At J_pmax = {electroThermalResult.Jpmax_kAcm2} kA/cm²
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    CW vs Pulsed Threshold
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {electroThermalResult.jth_cw_kAcm2}
                    </span>
                    <span className="text-xs font-mono text-slate-400 ml-1.5">kA/cm²</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-amber-700 tabular-nums">
                    Pulsed: {electroThermalResult.jth_pulsed_kAcm2} kA/cm² (ΔT_th = +
                    {electroThermalResult.deltaT_th_K} K)
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Max CW Heatsink T_s,max
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                      {electroThermalResult.Ts_max_K}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">K</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    V_a = {electroThermalResult.activeVoltage_Va_V} V · Eq. (13.43)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Figure 13.11(a) — CW Wall-Plug Efficiency vs Current Density
                      </h2>
                      <p className="text-xs text-slate-500">
                        QCL ({deviceConfig.wavelength_um} μm, CW & Pulsed) vs Reference 3.5 μm ICL
                        (Table 13.2).
                      </p>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 340 225"
                    className="w-full h-auto cursor-crosshair select-none"
                    onMouseLeave={() => setHoverJIdx(null)}
                  >
                    {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((wVal) => {
                      const y = 185 - (wVal / 0.25) * 155;
                      return (
                        <g key={wVal}>
                          <line x1={44} y1={y} x2={322} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={38}
                            y={y + 3}
                            textAnchor="end"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {wVal.toFixed(2)}
                          </text>
                        </g>
                      );
                    })}
                    {[0, 1, 2, 3, 4, 5].map((jVal) => {
                      const x = 44 + (jVal / 5.0) * 278;
                      return (
                        <g key={jVal}>
                          <line x1={x} y1={30} x2={x} y2={185} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={x}
                            y={200}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {jVal}
                          </text>
                        </g>
                      );
                    })}
                    <line x1={44} y1={30} x2={44} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <line x1={44} y1={185} x2={322} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <text
                      x={183}
                      y={216}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Current Density J (kA/cm²)
                    </text>
                    <text
                      x={12}
                      y={108}
                      textAnchor="middle"
                      transform="rotate(-90 12 108)"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Wall-Plug Efficiency
                    </text>

                    <polyline
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth={1.6}
                      strokeDasharray="3 3"
                      points={electroThermalResult.curves
                        .map(
                          (c) =>
                            `${44 + (c.J_kAcm2 / 5.0) * 278},${Math.max(
                              30,
                              185 - (c.wpe_qcl_pulsed / 0.25) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      points={electroThermalResult.curves
                        .map(
                          (c) =>
                            `${44 + (c.J_kAcm2 / 5.0) * 278},${Math.max(
                              30,
                              185 - (c.wpe_icl / 0.25) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#0891B2"
                      strokeWidth={2.5}
                      points={electroThermalResult.curves
                        .map(
                          (c) =>
                            `${44 + (c.J_kAcm2 / 5.0) * 278},${Math.max(
                              30,
                              185 - (c.wpe_qcl / 0.25) * 155
                            )}`
                        )
                        .join(' ')}
                    />

                    {activeETPoint && (
                      <line
                        x1={44 + (activeETPoint.J_kAcm2 / 5.0) * 278}
                        y1={30}
                        x2={44 + (activeETPoint.J_kAcm2 / 5.0) * 278}
                        y2={185}
                        stroke="#0891B2"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    )}

                    <text
                      x={210}
                      y={66}
                      className="text-[9px] font-mono font-semibold fill-cyan-700"
                    >
                      QCL CW ({deviceConfig.wavelength_um} μm)
                    </text>
                    <text x={85} y={82} className="text-[9px] font-mono fill-amber-700">
                      ICL CW (3.5 μm)
                    </text>

                    {electroThermalResult.curves.map((c, idx) => (
                      <rect
                        key={c.J_kAcm2}
                        x={44 + (idx / electroThermalResult.curves.length) * 278}
                        y={30}
                        width={278 / electroThermalResult.curves.length + 1}
                        height={155}
                        fill="transparent"
                        onMouseEnter={() => setHoverJIdx(idx)}
                      />
                    ))}
                  </svg>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Figure 13.11(b) — CW Optical Output Power vs Current Density
                      </h2>
                      <p className="text-xs text-slate-500">
                        High-power QCL scaling (2–3 W) vs ICL thermal roll-over (~200 mW).
                      </p>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 340 225"
                    className="w-full h-auto cursor-crosshair select-none"
                    onMouseLeave={() => setHoverJIdx(null)}
                  >
                    {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5].map((pVal) => {
                      const y = 185 - (pVal / 3.5) * 155;
                      return (
                        <g key={pVal}>
                          <line x1={44} y1={y} x2={322} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={38}
                            y={y + 3}
                            textAnchor="end"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {pVal.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                    {[0, 1, 2, 3, 4, 5].map((jVal) => {
                      const x = 44 + (jVal / 5.0) * 278;
                      return (
                        <g key={jVal}>
                          <line x1={x} y1={30} x2={x} y2={185} stroke="#E2E8F0" strokeWidth={1} />
                          <text
                            x={x}
                            y={200}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-slate-500"
                          >
                            {jVal}
                          </text>
                        </g>
                      );
                    })}
                    <line x1={44} y1={30} x2={44} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <line x1={44} y1={185} x2={322} y2={185} stroke="#475569" strokeWidth={1.2} />
                    <text
                      x={183}
                      y={216}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Current Density J (kA/cm²)
                    </text>
                    <text
                      x={12}
                      y={108}
                      textAnchor="middle"
                      transform="rotate(-90 12 108)"
                      className="text-[10px] font-mono fill-slate-700"
                    >
                      Output Power (W)
                    </text>

                    <polyline
                      fill="none"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      points={electroThermalResult.curves
                        .map(
                          (c) =>
                            `${44 + (c.J_kAcm2 / 5.0) * 278},${Math.max(
                              30,
                              185 - (c.power_icl_W / 3.5) * 155
                            )}`
                        )
                        .join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#0891B2"
                      strokeWidth={2.5}
                      points={electroThermalResult.curves
                        .map(
                          (c) =>
                            `${44 + (c.J_kAcm2 / 5.0) * 278},${Math.max(
                              30,
                              185 - (c.power_qcl_W / 3.5) * 155
                            )}`
                        )
                        .join(' ')}
                    />

                    {activeETPoint && (
                      <line
                        x1={44 + (activeETPoint.J_kAcm2 / 5.0) * 278}
                        y1={30}
                        x2={44 + (activeETPoint.J_kAcm2 / 5.0) * 278}
                        y2={185}
                        stroke="#0891B2"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    )}

                    <text
                      x={160}
                      y={80}
                      className="text-[9px] font-mono font-semibold fill-cyan-700"
                    >
                      QCL CW ({electroThermalResult.maxPower_W.toFixed(2)} W peak)
                    </text>
                    <text x={150} y={172} className="text-[9px] font-mono fill-amber-700">
                      ICL CW (3.5 μm)
                    </text>

                    {electroThermalResult.curves.map((c, idx) => (
                      <rect
                        key={c.J_kAcm2}
                        x={44 + (idx / electroThermalResult.curves.length) * 278}
                        y={30}
                        width={278 / electroThermalResult.curves.length + 1}
                        height={155}
                        fill="transparent"
                        onMouseEnter={() => setHoverJIdx(idx)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Figure 13.12 — CW Output Power vs Current Density Across Operating
                      Temperatures (300 K – 450 K)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Demonstrates QCL high-temperature resilience up to T_s,max ={' '}
                      {electroThermalResult.Ts_max_K} K. At J = {activeETPoint.J_kAcm2} kA/cm²,
                      Core Temp T_core = {activeETPoint.coreTemp_K} K, V = {activeETPoint.voltage_V}{' '}
                      V.
                    </p>
                  </div>
                </div>

                <svg viewBox="0 0 680 195" className="w-full h-auto select-none">
                  {[0, 1.0, 2.0, 3.0].map((pVal) => {
                    const y = 160 - (pVal / 3.2) * 135;
                    return (
                      <g key={pVal}>
                        <line x1={55} y1={y} x2={650} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={46}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {pVal.toFixed(1)} W
                        </text>
                      </g>
                    );
                  })}
                  {[0, 1, 2, 3, 4, 5].map((jVal) => {
                    const x = 55 + (jVal / 5.0) * 595;
                    return (
                      <g key={jVal}>
                        <line x1={x} y1={25} x2={x} y2={160} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={x}
                          y={176}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {jVal} kA/cm²
                        </text>
                      </g>
                    );
                  })}
                  <line x1={55} y1={25} x2={55} y2={160} stroke="#475569" strokeWidth={1.2} />
                  <line x1={55} y1={160} x2={650} y2={160} stroke="#475569" strokeWidth={1.2} />

                  <polyline
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth={2.4}
                    points={electroThermalResult.curves
                      .map(
                        (c) =>
                          `${55 + (c.J_kAcm2 / 5.0) * 595},${Math.max(
                            25,
                            160 - (c.powerMultiTemp.T300_W / 3.2) * 135
                          )}`
                      )
                      .join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    points={electroThermalResult.curves
                      .map(
                        (c) =>
                          `${55 + (c.J_kAcm2 / 5.0) * 595},${Math.max(
                            25,
                            160 - (c.powerMultiTemp.T350_W / 3.2) * 135
                          )}`
                      )
                      .join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#D97706"
                    strokeWidth={2}
                    points={electroThermalResult.curves
                      .map(
                        (c) =>
                          `${55 + (c.J_kAcm2 / 5.0) * 595},${Math.max(
                            25,
                            160 - (c.powerMultiTemp.T400_W / 3.2) * 135
                          )}`
                      )
                      .join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    points={electroThermalResult.curves
                      .map(
                        (c) =>
                          `${55 + (c.J_kAcm2 / 5.0) * 595},${Math.max(
                            25,
                            160 - (c.powerMultiTemp.T450_W / 3.2) * 135
                          )}`
                      )
                      .join(' ')}
                  />

                  <text
                    x={360}
                    y={52}
                    className="text-[10px] font-mono font-semibold fill-cyan-700"
                  >
                    300 K
                  </text>
                  <text x={420} y={84} className="text-[10px] font-mono fill-sky-700">
                    350 K
                  </text>
                  <text x={470} y={118} className="text-[10px] font-mono fill-amber-700">
                    400 K
                  </text>
                  <text x={515} y={146} className="text-[10px] font-mono fill-rose-700">
                    450 K
                  </text>
                </svg>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ====================================================================
          WORKSPACE MODULE 3: FREQUENCY COMBS, EXTENDONS & SOLITONS
      ==================================================================== */}
      {activeTab === 'combs' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  03. Frequency Comb & Soliton Lab
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulate FM linear-chirp extendons in Fabry-Pérot cavities (Eq. 13.56, Ch. 3.4 &
                  3.5), resonant loss-shaping disks (Roy & Burghoff), and Ring QCL dissipative
                  solitons (Ch. 3.2).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Cavity Architecture & Comb Regime
                </label>
                {(
                  [
                    [
                      'fp-fm-extendon',
                      'Fabry-Pérot FM Comb (Extendon)',
                      'Spatial Hole Burning + Linear Frequency Chirp (Fig. 13.17)',
                    ],
                    [
                      'ring-bright-soliton',
                      'Ring QCL Driven Bright Kerr Solitons',
                      'Optically Driven Racetrack sech² Solitons (Ch. 3.2 Fig. 1)',
                    ],
                    [
                      'ring-nozaki-bekki',
                      'Ring QCL Nozaki-Bekki Dark Soliton',
                      'Unidirectional CGLE Phase-Kink Solitary Hole (Opačak 2024)',
                    ],
                    [
                      'harmonic-comb',
                      'Self-Starting Harmonic Comb (HFC)',
                      'Parametric Effective Rabi Resonance at N × FSR (Ch. 3.4)',
                    ],
                  ] as [CombRegimeType, string, string][]
                ).map(([id, title, desc]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCombRegime(id)}
                    className={`w-full text-left px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                      combRegime === id
                        ? 'bg-cyan-50/60 border-cyan-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Group Velocity Dispersion |GVD|
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {combGvd.toFixed(2)} <span className="text-slate-400">×10⁵ fs²/mm</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={1.6}
                    step={0.05}
                    value={combGvd}
                    onChange={(e) => setCombGvd(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Gain Curvature Factor (Ch. 3.5 Fig. 2a)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {combGainCurvature.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={4.0}
                    step={0.2}
                    value={combGainCurvature}
                    onChange={(e) => setCombGainCurvature(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Resonant Loss-Shaping Disks (Ch. 3.5)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {combLossShaping.toFixed(1)} <span className="text-slate-400">cm⁻¹</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-md">
                    {[0, 2, 4, 8].map((lossVal) => (
                      <button
                        key={lossVal}
                        type="button"
                        onClick={() => setCombLossShaping(lossVal)}
                        className={`py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                          combLossShaping === lossVal
                            ? 'bg-white text-slate-900 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lossVal} cm⁻¹
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Cavity Length (L_cav)</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {combCavityLengthMm.toFixed(1)} <span className="text-slate-400">mm</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={8.0}
                    step={0.5}
                    value={combCavityLengthMm}
                    onChange={(e) => setCombCavityLengthMm(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                {combRegime === 'harmonic-comb' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">
                        Harmonic Comb Order (N × FSR)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        N = {combHarmonicOrder}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      step={1}
                      value={combHarmonicOrder}
                      onChange={(e) => setCombHarmonicOrder(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </aside>

            <section className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Comb Bandwidth
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-cyan-700 tabular-nums">
                      {combResult.combBandwidth_GHz}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">GHz</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    Loss Shaping: {combLossShaping} cm⁻¹
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Free Spectral Range (FSR)
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {combResult.fsr_GHz}
                    </span>
                    <span className="text-xs uppercase font-mono text-slate-400 ml-1.5">GHz</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    T_RT = {combResult.roundTrip_ps} ps
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    First-Order Coherence g⁽¹⁾
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {combResult.coherence_g1.toFixed(4)}
                    </span>
                  </div>
                  <div
                    className={`mt-1 text-xs font-mono ${
                      combResult.isStableExtendon ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {combResult.isStableExtendon
                      ? '● Phase-Locked Coherent'
                      : '▲ Chaotic Destabilization'}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Min Required |GVD|_opt
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {combResult.optimalGvd_fs2mm}
                    </span>
                    <span className="text-xs font-mono text-slate-400 ml-1.5">×10⁵ fs²/mm</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    Roy & Burghoff Ch. 3.5
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Figure 13.17 & Ch. 3.4 — Temporal Intensity I(t) & Instantaneous Frequency
                      Chirp ω_inst(t)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Evolution over two cavity round-trips (0 to 2T). Hover to inspect phase and
                      frequency excursion.
                    </p>
                  </div>
                  <div className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 tabular-nums">
                    t/T = {activeCombPoint.time_roundtrips.toFixed(2)} · I(t) ={' '}
                    {activeCombPoint.intensity_norm.toFixed(2)} · Δf_inst ={' '}
                    {activeCombPoint.instFreq_GHz > 0 ? '+' : ''}
                    {activeCombPoint.instFreq_GHz.toFixed(0)} GHz
                  </div>
                </div>

                <svg
                  viewBox="0 0 680 230"
                  className="w-full h-auto cursor-crosshair select-none"
                  onMouseLeave={() => setHoverCombTimeIdx(null)}
                >
                  <rect
                    x={55}
                    y={15}
                    width={595}
                    height={82}
                    fill="#F8FAFC"
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                  <text
                    x={62}
                    y={29}
                    className="text-[10px] font-mono font-semibold fill-slate-700"
                  >
                    Optical Power I(t) (Normalized)
                  </text>
                  <polyline
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth={2.2}
                    points={combResult.timeTrace
                      .map(
                        (pt) =>
                          `${55 + (pt.time_roundtrips / 2.0) * 595},${
                            92 - pt.intensity_norm * 68
                          }`
                      )
                      .join(' ')}
                  />

                  <rect
                    x={55}
                    y={112}
                    width={595}
                    height={90}
                    fill="#F8FAFC"
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                  <line
                    x1={55}
                    y1={157}
                    x2={650}
                    y2={157}
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={62}
                    y={126}
                    className="text-[10px] font-mono font-semibold fill-amber-700"
                  >
                    Instantaneous Frequency (ω_inst - ω₀)/2π (GHz)
                  </text>
                  <polyline
                    fill="none"
                    stroke="#D97706"
                    strokeWidth={2.2}
                    points={combResult.timeTrace
                      .map(
                        (pt) =>
                          `${55 + (pt.time_roundtrips / 2.0) * 595},${
                            157 - (pt.instFreq_GHz / 480) * 38
                          }`
                      )
                      .join(' ')}
                  />

                  {[0, 0.5, 1.0, 1.5, 2.0].map((tVal) => {
                    const x = 55 + (tVal / 2.0) * 595;
                    return (
                      <g key={tVal}>
                        <line x1={x} y1={15} x2={x} y2={202} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={x}
                          y={218}
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-slate-600"
                        >
                          {tVal.toFixed(1)} T
                        </text>
                      </g>
                    );
                  })}

                  {activeCombPoint && (
                    <line
                      x1={55 + (activeCombPoint.time_roundtrips / 2.0) * 595}
                      y1={15}
                      x2={55 + (activeCombPoint.time_roundtrips / 2.0) * 595}
                      y2={202}
                      stroke="#0F172A"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                  )}

                  {combResult.timeTrace.map((pt, idx) => (
                    <rect
                      key={pt.time_roundtrips}
                      x={55 + (idx / combResult.timeTrace.length) * 595}
                      y={15}
                      width={595 / combResult.timeTrace.length + 1}
                      height={187}
                      fill="transparent"
                      onMouseEnter={() => setHoverCombTimeIdx(idx)}
                    />
                  ))}
                </svg>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Optical Comb Mode Spectrum & Net Gain Flatness Shaping (Ch. 3.5 Fig. 1b/d)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Discrete comb lines spaced by Δω/2π = {combResult.fsr_GHz} GHz with unshaped
                      vs loss-shaped net gain profile.
                    </p>
                  </div>
                </div>

                <svg viewBox="0 0 680 205" className="w-full h-auto select-none">
                  {[0, -15, -30, -45].map((dbVal) => {
                    const y = 30 + (Math.abs(dbVal) / 45) * 145;
                    return (
                      <g key={dbVal}>
                        <line x1={55} y1={y} x2={650} y2={y} stroke="#E2E8F0" strokeWidth={1} />
                        <text
                          x={46}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] font-mono fill-slate-500"
                        >
                          {dbVal} dB
                        </text>
                      </g>
                    );
                  })}
                  <line x1={55} y1={30} x2={55} y2={175} stroke="#475569" strokeWidth={1.2} />
                  <line x1={55} y1={175} x2={650} y2={175} stroke="#475569" strokeWidth={1.2} />

                  <polyline
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                    points={combResult.spectrumTeeth
                      .map(
                        (t, idx) =>
                          `${55 + (idx / (combResult.spectrumTeeth.length - 1)) * 595},${
                            175 - t.unshapedGain_norm * 135
                          }`
                      )
                      .join(' ')}
                  />

                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth={2}
                    points={combResult.spectrumTeeth
                      .map(
                        (t, idx) =>
                          `${55 + (idx / (combResult.spectrumTeeth.length - 1)) * 595},${
                            175 - t.shapedNetGain_norm * 135
                          }`
                      )
                      .join(' ')}
                  />

                  {combResult.spectrumTeeth.map((t, idx) => {
                    const x = 55 + (idx / (combResult.spectrumTeeth.length - 1)) * 595;
                    const yTop = 30 + (Math.abs(t.power_dB) / 45) * 145;
                    return (
                      <g key={t.modeIndex}>
                        <line
                          x1={x}
                          y1={175}
                          x2={x}
                          y2={yTop}
                          stroke="#0891B2"
                          strokeWidth={2.2}
                        />
                        {t.power_dB > -35 && <circle cx={x} cy={yTop} r={2} fill="#0E7490" />}
                      </g>
                    );
                  })}

                  <text
                    x={352}
                    y={196}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-700"
                  >
                    Frequency Detuning from Gain Center (Mode Index j × {combResult.fsr_GHz} GHz)
                  </text>
                  <text x={465} y={46} className="text-[10px] font-mono fill-emerald-700">
                    — Shaped Net Gain ({combLossShaping} cm⁻¹ Disks)
                  </text>
                  <text x={465} y={60} className="text-[10px] font-mono fill-slate-500">
                    -- Unshaped Gain Curvature
                  </text>
                </svg>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ====================================================================
          WORKSPACE MODULE 4: JPHYS PHOTONICS QCL ROADMAP EXPLORER (85 PAGES)
      ==================================================================== */}
      {activeTab === 'roadmap' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-8">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Journal of Physics: Photonics — Quantum Cascade Laser Roadmap
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Guest Editors: Carlo Silvestri, Aleksandar D. Rakić, Dragan Indjin</span>
                  <span aria-hidden="true">·</span>
                  <span>18 Chapters</span>
                  <span aria-hidden="true">·</span>
                  <span>30 International Research Institutions</span>
                  <span aria-hidden="true">·</span>
                  <span>85 Pages</span>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roadmapSearch}
                  onChange={(e) => setRoadmapSearch(e.target.value)}
                  placeholder="Search chapters, authors, topics..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
                {[
                  ['ALL', 'All Sections (18)'],
                  ['1. Introduction', '1. Intro'],
                  ['2. Designs & Technology', '2. Designs & Tech (6)'],
                  ['3. Combs & Pulse Generation', '3. Combs & Pulses (5)'],
                  ['4. Characterization & Applications', '4. Applications (7)'],
                ].map(([secKey, label]) => (
                  <button
                    key={secKey}
                    type="button"
                    onClick={() => setRoadmapSectionFilter(secKey)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      roadmapSectionFilter === secKey
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                {['ALL', 'Mid-IR', 'THz'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setRoadmapRegimeFilter(reg)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      roadmapRegimeFilter === reg
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {reg === 'ALL' ? 'All Regimes' : reg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-[680px] overflow-y-auto">
              {filteredChapters.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No roadmap chapters match your filter criteria.
                </div>
              ) : (
                filteredChapters.map((ch) => {
                  const isSelected = ch.id === selectedChapter.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChapterId(ch.id)}
                      className={`w-full text-left p-4 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span>
                          Chapter {ch.number} · {ch.spectralRegime} · {ch.pdfPages}
                        </span>
                        <span className="font-semibold text-cyan-700">
                          {ch.keyMetricValue} {ch.keyMetricUnit}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 leading-snug">
                        {ch.title}
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500 truncate">
                        {ch.authors.join(', ')}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>Chapter {selectedChapter.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedChapter.section}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedChapter.spectralRegime}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedChapter.pdfPages}</span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-bold text-slate-900 leading-snug">
                    {selectedChapter.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    <span className="font-semibold">Authors:</span>{' '}
                    {selectedChapter.authors.join(', ')}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold">Affiliations:</span>{' '}
                    {selectedChapter.institutions.join(' · ')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPdfAtPage(selectedChapter.startPage)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-700 rounded-md hover:bg-cyan-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read PDF (Page {selectedChapter.startPage})</span>
                </button>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  State of the Art & Status
                </h3>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                  {selectedChapter.statusSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Current & Future Challenges
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
                    {selectedChapter.challenges.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Advances in Science & Technology
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
                    {selectedChapter.advances.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Foundational References Cited in Chapter {selectedChapter.number}
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs font-mono text-slate-600">
                  {selectedChapter.keyReferences.map((ref, idx) => (
                    <li key={idx}>
                      [{idx + 1}] {ref}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Chapter 2.1 Benchmark — THz QCL Maximum Operating Temperature (T_max) by MBE Wafer
                </h3>
                <p className="text-xs text-slate-500">
                  Direct phonon depopulation structures categorized by MBE growth facility and
                  Al_xGa_(1-x)As barrier composition (Khalatpour, Fig. 1c).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono">
                      <th className="py-2 pr-3">Wafer ID</th>
                      <th className="py-2 px-3">Barrier Al%</th>
                      <th className="py-2 px-3">Design Scheme</th>
                      <th className="py-2 px-3">MBE Facility</th>
                      <th className="py-2 pl-3 text-right">T_max (K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {WAFER_BENCHMARKS.slice()
                      .reverse()
                      .map((w) => (
                        <tr key={w.waferId} className="hover:bg-slate-50">
                          <td className="py-2 pr-3 font-semibold text-slate-900">{w.waferId}</td>
                          <td className="py-2 px-3 text-slate-600">
                            {(w.alFraction * 100).toFixed(0)}% Al
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-600">{w.designType}</td>
                          <td className="py-2 px-3 font-sans text-slate-500 truncate max-w-[160px]">
                            {w.facility}
                          </td>
                          <td className="py-2 pl-3 text-right font-bold text-cyan-700">
                            {w.tMaxK} K
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Chapter 4.4 Benchmark — QCL-Based QEPAS Trace Gas Noise Equivalent Concentrations
                </h3>
                <p className="text-xs text-slate-500">
                  Quartz-Enhanced Photoacoustic Spectroscopy detection limits across Mid-IR and THz
                  molecular fingerprints (Giglio, Sampaolo, Patimisco, Spagnolo, Fig. 1).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono">
                      <th className="py-2 pr-3">Species</th>
                      <th className="py-2 px-3">Wavelength</th>
                      <th className="py-2 px-3">Regime</th>
                      <th className="py-2 px-3">Primary Application</th>
                      <th className="py-2 pl-3 text-right">Best NEC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {GAS_QEPAS_BENCHMARKS.map((g) => (
                      <tr key={g.formula} className="hover:bg-slate-50">
                        <td className="py-2 pr-3 font-semibold text-slate-900">
                          {g.formula}{' '}
                          <span className="font-sans font-normal text-slate-400">({g.name})</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{g.wavelengthUm.toFixed(2)} μm</td>
                        <td className="py-2 px-3 text-slate-600">{g.spectralBand}</td>
                        <td className="py-2 px-3 font-sans text-slate-500">{g.application}</td>
                        <td className="py-2 pl-3 text-right font-bold text-emerald-700">
                          {g.necDisplay}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          EMBEDDED PDF VIEWER MODAL
      ==================================================================== */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white">
              <div className="flex items-center gap-3 text-xs font-mono">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">
                  QCLroadmap.pdf — Journal of Physics: Photonics Roadmap (Page {pdfTargetPage} of
                  85)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPdfTargetPage(Math.max(1, pdfTargetPage - 1))}
                    className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer"
                  >
                    Prev Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfTargetPage(Math.min(85, pdfTargetPage + 1))}
                    className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer"
                  >
                    Next Page
                  </button>
                </div>
                <a
                  href={`/QCLroadmap.pdf#page=${pdfTargetPage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-cyan-700 rounded hover:bg-cyan-600"
                >
                  <span>New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                  aria-label="Close PDF viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              key={pdfTargetPage}
              src={`/QCLroadmap.pdf#page=${pdfTargetPage}`}
              title="Quantum Cascade Laser Roadmap PDF"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          QUIET FOOTER
      ==================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          Quantum Cascade Laser Research & Simulation Workbench · Built from Chapter 13 (Oxford
          University Press) & JPhys Photonics QCL Roadmap
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('research')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            6 Frontier Papers
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            18 Roadmap Chapters
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => handleOpenPdfAtPage(1)}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            QCLroadmap.pdf
          </button>
        </div>
      </footer>
    </div>
  );
}

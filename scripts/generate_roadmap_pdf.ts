import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { RESEARCH_THREADS } from '../src/data/researchThreadsData';

function generateRoadmapPdf(outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 54, right: 54 },
      info: {
        Title: 'Internal Quantum Cascade Laser (QCL) Research Roadmap & 6-Paper Publication Program',
        Author: 'QCL Research & Simulation Workbench',
        Subject: 'Synthesis of Vurgaftman Chapter 13, JPhys Photonics QCL Roadmap (85 pp.), and 2025-2026 Frontier Literature',
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header Banner
    doc
      .rect(54, 45, 504, 68)
      .fill('#0F172A');

    doc
      .fillColor('#38BDF8')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('INTERNAL RESEARCH ROADMAP & PUBLICATION PROGRAM', 68, 58, { width: 476 });

    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(15)
      .text('Quantum Cascade Lasers: Six Frontier Theoretical & Computational Papers', 68, 73, {
        width: 476,
      });

    doc
      .fillColor('#94A3B8')
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        'Synthesized from Vurgaftman, Lumb & Meyer (Ch. 13, OUP 2021), JPhys Photonics QCL Roadmap (18 Chapters, 85 pp.), & 2025–2026 Literature',
        68,
        94,
        { width: 476 }
      );

    doc.y = 128;

    // Executive Summary Section
    doc
      .fillColor('#0F172A')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('1. Executive Synthesis & Research Strategy', 54, doc.y);

    doc.moveDown(0.35);
    doc
      .fillColor('#334155')
      .font('Helvetica')
      .fontSize(9.5)
      .text(
        'This internal research roadmap establishes a six-paper publication program (Papers I–VI) built by uniting the analytical multi-band semiconductor physics of Vurgaftman, Lumb, and Meyer (Chapter 13, Eqs. 13.1–13.56) with the 18 experimental and theoretical chapters of the Journal of Physics: Photonics Quantum Cascade Laser Roadmap (edited by C. Silvestri, A. D. Rakic, and D. Indjin). Each paper targets a specific, quantitatively defined bottleneck identified in the Roadmap and comes with a dedicated repository directory (/papers/paper_N_...) containing self-contained first-principles simulation code, reproducible CSV datasets, vector figures, and complete LaTeX/PDF manuscripts.',
        { align: 'justify', lineGap: 2 }
      );

    doc.moveDown(0.8);

    // Iterate through all 6 Papers
    RESEARCH_THREADS.forEach((paper, index) => {
      if (doc.y > 580) {
        doc.addPage();
      }

      // Section Header Box
      const startY = doc.y;
      doc
        .rect(54, startY, 504, 22)
        .fill('#F1F5F9');
      doc
        .rect(54, startY, 4, 22)
        .fill('#0891B2');

      doc
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text(`${paper.paperNumber}: ${paper.shortTitle}  [${paper.targetJournals.join(' / ')}]`, 64, startY + 6, {
          width: 488,
        });

      doc.y = startY + 28;

      doc
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(paper.fullTitle, 54, doc.y, { width: 504 });

      doc.moveDown(0.3);

      // Synthesized Sources
      doc
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Synthesized Roadmap & Textbook Foundations:', 54, doc.y);
      paper.synthesizedSources.forEach((src) => {
        doc
          .fillColor('#334155')
          .font('Helvetica')
          .fontSize(8.5)
          .text(`  • ${src}`, { width: 495, lineGap: 1 });
      });

      doc.moveDown(0.3);

      // Core Gap & Innovation
      doc
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Core Literature Bottleneck: ', { continued: true })
        .fillColor('#334155')
        .font('Helvetica')
        .text(paper.coreProblemGap, { align: 'justify', lineGap: 1.5 });

      doc.moveDown(0.25);

      doc
        .fillColor('#0E7490')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Theoretical Innovation: ', { continued: true })
        .fillColor('#1E293B')
        .font('Helvetica')
        .text(paper.theoreticalInnovation, { align: 'justify', lineGap: 1.5 });

      doc.moveDown(0.3);

      // Governing Equations
      doc
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Governing Mathematical Relations:');
      paper.keyEquations.forEach((eq) => {
        doc
          .fillColor('#0F172A')
          .font('Courier-Bold')
          .fontSize(8)
          .text(`    ${eq.formula}`, { width: 490 });
        doc
          .fillColor('#64748B')
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text(`    (${eq.label}: ${eq.description})`, { width: 490 });
      });

      doc.moveDown(0.3);

      // Quantitative Predictions
      doc
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Quantitative Predictions vs. State of the Art:');
      paper.quantitativePredictions.forEach((pred) => {
        doc
          .fillColor('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`  • ${pred.metric}: `, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text(
            `Baseline: ${pred.baselineStateOfArt}  -->  Projected: ${pred.projectedValue} (${pred.improvementNote})`
          );
      });

      doc.moveDown(0.8);

      if (index < RESEARCH_THREADS.length - 1 && doc.y > 560) {
        doc.addPage();
      }
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main() {
  const rootOut = path.resolve(process.cwd(), 'Internal_QCL_Research_Roadmap.pdf');
  const publicOut = path.resolve(process.cwd(), 'public', 'Internal_QCL_Research_Roadmap.pdf');
  await generateRoadmapPdf(rootOut);
  fs.copyFileSync(rootOut, publicOut);
  console.log(`Generated Internal_QCL_Research_Roadmap.pdf (${fs.statSync(rootOut).size} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

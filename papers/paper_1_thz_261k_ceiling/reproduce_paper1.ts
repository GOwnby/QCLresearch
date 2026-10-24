/**
 * Reproduction Runner for Paper I:
 * "Interface-roughness bound and over-resonant phonon limits of
 *  high-temperature terahertz quantum cascade lasers"
 * by Gracen Ownby, University of Oklahoma.
 *
 * Executes the self-contained Python numerical solver and standalone TikZ
 * figure compiler (`generate_paper1_data_and_figures.py`), compiles the
 * single-column LaTeX manuscript (`Paper_I_Manuscript.tex`) via Tectonic,
 * and copies the resulting PDF to `public/Paper_I_Manuscript.pdf`.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Reproducing Paper I Calculations, Vector Figures, and LaTeX PDF ===');

// 1. Run the Python physics solver & standalone TikZ figure generator
execSync('python3 generate_paper1_data_and_figures.py', {
  cwd: __dirname,
  stdio: 'inherit',
});

// 2. Compile Paper_I_Manuscript.tex via Tectonic
execSync('/usr/local/bin/tectonic Paper_I_Manuscript.tex', {
  cwd: __dirname,
  stdio: 'inherit',
});

// 3. Sync PDF to /public for web download
const pdfSrc = path.join(__dirname, 'Paper_I_Manuscript.pdf');
const pdfDest = path.resolve(__dirname, '../../public/Paper_I_Manuscript.pdf');
if (fs.existsSync(pdfSrc)) {
  fs.copyFileSync(pdfSrc, pdfDest);
  console.log(`Copied ${pdfSrc} -> ${pdfDest}`);
}

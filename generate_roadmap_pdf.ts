import { execSync } from 'child_process';
import * as fs from 'fs';

console.log('Compiling Internal_QCL_Research_Roadmap.tex via Tectonic...');
execSync('/usr/local/bin/tectonic Internal_QCL_Research_Roadmap.tex', {
  stdio: 'inherit',
});
fs.copyFileSync('Internal_QCL_Research_Roadmap.pdf', 'public/Internal_QCL_Research_Roadmap.pdf');
console.log('Successfully generated Internal_QCL_Research_Roadmap.pdf');

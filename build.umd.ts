import fs from 'fs';
import path from 'path';
import url from 'url';

console.log('ℹ Building umd all-in-one JS...');

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const buildDir = path.join(__dirname, 'lib');

const minifiedCss = fs.readFileSync(path.join(buildDir, 'index.min.css'), 'utf-8');
const umdJs = fs.readFileSync(path.join(buildDir, 'index.umd.js'), 'utf-8');

const processedCss = minifiedCss.replace(/\n/g, '').replace(/"/g, '\\"');
const umdWithCss = `${umdJs}\nconst e=document.createElement("style");e.textContent="${processedCss}",document.head.appendChild(e);`;

fs.writeFileSync(path.join(buildDir, 'index.umd.min.js'), umdWithCss, 'utf-8');

console.log('✔ UMD all-in-one JS built');

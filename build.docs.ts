import fs from 'fs';
import path from 'path';
import url from 'url';

console.log('ℹ Building docs site...');

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'src');
const docsDir = path.join(__dirname, 'docs');
const buildDir = path.join(__dirname, 'lib');

fs.copyFileSync(path.join(buildDir, 'index.umd.js'), path.join(docsDir, 'index.umd.js'));
fs.copyFileSync(path.join(buildDir, 'index.min.css'), path.join(docsDir, 'index.min.css'));

const htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
const updatedHtmlContent = htmlContent.replaceAll('../lib/', '');
fs.writeFileSync(path.join(docsDir, 'index.html'), updatedHtmlContent, 'utf-8');

console.log('✔ Docs site built');

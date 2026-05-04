import fs from 'fs';
import path from 'path';
import url from 'url';

import { minify } from 'html-minifier-terser';

console.log('ℹ Building docs site...');

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'src');
const docsDir = path.join(__dirname, 'docs');
const buildDir = path.join(__dirname, 'lib');

// copy index html file
fs.copyFileSync(path.join(buildDir, 'index.umd.min.js'), path.join(docsDir, 'index.umd.min.js'));

// remove no need styles
let htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
htmlContent = htmlContent.replaceAll('<link rel="stylesheet" href="../lib/index.min.css" />', '');

// update script src paths
htmlContent = htmlContent.replaceAll('../lib/index.umd.js', 'index.umd.min.js');
fs.writeFileSync(path.join(docsDir, 'index.html'), htmlContent, 'utf-8');

// minify html simply
minify(htmlContent, {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
})
  .then((minified) => {
    fs.writeFileSync(path.join(docsDir, 'index.html'), minified, 'utf-8');
    console.log('✔ Docs site built');
  })
  .catch((err) => {
    console.error('✕ Error minifying HTML:', err);
  });

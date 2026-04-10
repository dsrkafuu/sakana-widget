import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';

export default defineConfig({
  title: 'Sakana! Widget',
  description:
    'Add the Sakana! Widget to your own web page! | 把石蒜模拟器添加到你自己的网页内！',
  vite: {
    plugins: [
      {
        name: 'svg-loader',
        transform(_code, id) {
          if (id.endsWith('.svg')) {
            const svgContent = readFileSync(id, 'utf-8');
            return {
              code: `export default ${JSON.stringify(svgContent)}`,
              map: null,
            };
          } else if (id.endsWith('.png')) {
            const pngContent =
              'data:image/png;base64,' + readFileSync(id, 'base64');
            return {
              code: `export default ${JSON.stringify(pngContent)}`,
              map: null,
            };
          }
        },
      },
    ],
  },
});

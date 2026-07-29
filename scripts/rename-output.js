/**
 * Только для однофайловой сборки (npm run build:single).
 * Vite всегда называет результат index.html — рядом кладём копию
 * «Дом Кино.html», чтобы файл было не стыдно отправить заказчику.
 *
 * Именно копию, а не переименование: index.html должен остаться на месте,
 * иначе собранную версию не получится открыть через npm run preview.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'dist-single', 'index.html');
const to = join(root, 'dist-single', 'Дом Кино.html');

if (!existsSync(from)) {
  console.error('Нет dist-single/index.html — сборка не выполнялась?');
  process.exit(1);
}

copyFileSync(from, to);
console.log('→ dist-single/Дом Кино.html (один файл, для отправки)');

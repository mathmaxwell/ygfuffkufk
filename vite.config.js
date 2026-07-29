import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Две сборки из одного кода:
//
//   npm run build         — обычная, для сайта: index.html на пару килобайт
//                           плюс отдельные файлы JS, CSS, шрифтов и фотографий.
//   npm run build:single  — всё одним HTML-файлом, чтобы переслать заказчику.
//
// Почему для сайта нельзя однофайловую: там JS вшит в конец документа, и браузер
// не рисует ни строчки, пока не докачает все два мегабайта. На нестабильной
// мобильной связи это белый экран и оборванная загрузка (ровно так приложение
// и не открывалось у пользователя из России). Раздельная сборка отдаёт разметку
// сразу, картинки подтягиваются следом и по отдельности, а сорвавшийся файл
// браузер запрашивает заново сам.
const single = process.env.BUILD_SINGLE === '1';

/**
 * Один большой скрипт на плохой связи не докачивается вовсе: у пользователя
 * из России 90 КБ обрывались три раза подряд, браузеру нечего было положить
 * в кэш, и каждая перезагрузка начинала с нуля. Куски по 10–40 КБ проходят
 * и оседают в кэше навсегда (у них хэш в имени), поэтому следующая попытка
 * докачивает только недостающее.
 */
function chunkFor(id) {
  if (id.includes('node_modules')) {
    return id.includes('react-dom') ? 'react-dom' : 'vendor';
  }
  const screen = id.match(/\/src\/screens\/([^/]+)\//);
  return screen ? `screen-${screen[1]}` : undefined;
}

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    outDir: single ? 'dist-single' : 'dist',
    // В однофайловой всё встраивается как data:-URI, в обычной остаётся
    // отдельными файлами — иначе смысл разделения пропадает.
    assetsInlineLimit: single ? 100 * 1024 * 1024 : 4096,
    cssCodeSplit: !single,
    chunkSizeWarningLimit: 4000,
    // Однофайловой сборке дробление противопоказано — ей всё нужно слитно.
    rollupOptions: single ? {} : { output: { manualChunks: chunkFor } },
  },
});

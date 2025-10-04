import { defineConfig } from 'vite'
import { resolve } from 'path'

// Плагин для замены jsdom на заглушку
const replaceJsdomPlugin = () => ({
  name: 'replace-jsdom',
  resolveId(id) {
    if (id === 'jsdom') {
      return '\0virtual:jsdom'
    }
  },
  load(id) {
    if (id === '\0virtual:jsdom') {
      return 'export default {};'
    }
  },
  transform(code, id) {
    if (code.includes('import"jsdom"') || code.includes("import 'jsdom'")) {
      return code.replace(/import\s*["']jsdom["']/g, '// import "jsdom" // Заменено на заглушку')
    }
  }
})

// Плагин для замены require('jquery') на правильную ссылку в UMD файлах
const replaceRequireJqueryPlugin = () => ({
  name: 'replace-require-jquery',
  transform(code, id) {
    // Обрабатываем только vendor файлы
    if (!id.includes('/vendor/') && !id.includes('/plugins/')) {
      return null
    }
    
    // Заменяем require('jquery') на window.jQuery в UMD паттернах
    if (code.includes("require('jquery')")) {
      return code.replace(/require\('jquery'\)/g, 'window.jQuery')
    }
    
    return null
  }
})

// Плагин для замены всех require() на window.jQuery в UMD файлах
const replaceAllRequirePlugin = () => ({
  name: 'replace-all-require',
  transform(code, id) {
    // Обрабатываем только vendor файлы
    if (!id.includes('/vendor/') && !id.includes('/plugins/')) {
      return null
    }
    
    // Заменяем все require() на window.jQuery в UMD паттернах
    if (code.includes('require(')) {
      return code.replace(/require\([^)]+\)/g, 'window.jQuery')
    }
    
    return null
  }
})

// Плагин для принудительной установки глобальных переменных jQuery
const globalJqueryPlugin = () => ({
  name: 'global-jquery',
  generateBundle(options, bundle) {
    // Добавляем установку глобальных переменных в начало каждого JS файла
    for (const fileName in bundle) {
      const chunk = bundle[fileName]
      if (chunk.type === 'chunk' && chunk.code) {
        // Добавляем установку глобальных переменных в начало файла
        chunk.code = `window.$ = window.$ || (typeof $ !== 'undefined' ? $ : null);
window.jQuery = window.jQuery || window.$ || (typeof jQuery !== 'undefined' ? jQuery : null);
${chunk.code}`
      }
    }
  }
})

// Конфигурация для legacy кода
export default defineConfig({
  plugins: [replaceJsdomPlugin(), replaceRequireJqueryPlugin(), replaceAllRequirePlugin(), globalJqueryPlugin()],
  
  resolve: {
    alias: {
      // Основные модули
      'modules': resolve(__dirname, 'src/public/js/modules'),
      'pages': resolve(__dirname, 'src/public/js/pages'),
      'singleton': resolve(__dirname, 'src/public/js/singleton'),
      'vendor': resolve(__dirname, 'src/public/js/vendor'),
      'utils': resolve(__dirname, 'src/public/js/utils'),
      
      // React компоненты
      'components': resolve(__dirname, 'src/client/components'),
      'containers': resolve(__dirname, 'src/client/containers'),
      'actions': resolve(__dirname, 'src/client/actions'),
      'reducers': resolve(__dirname, 'src/client/reducers'),
      'sagas': resolve(__dirname, 'src/client/sagas'),
      'api': resolve(__dirname, 'src/client/api'),
      'lib': resolve(__dirname, 'src/client/lib'),
      'lib2': resolve(__dirname, 'src/client/lib'),
      'client': resolve(__dirname, 'src/client'),
      'serverSocket': resolve(__dirname, 'src/socketio'),
      'fs': resolve(__dirname, 'src/public/js/vendor/fs-stub.js'), // Заглушка для fs
      'fs-extra': resolve(__dirname, 'src/public/js/vendor/fs-stub.js'), // Заглушка для fs-extra
      
      // Специальные алиасы для совместимости
      'lib/helpers': resolve(__dirname, 'src/public/js/modules/helpers.js'),
      'lib/helpers.js': resolve(__dirname, 'src/public/js/modules/helpers.js'),
      
      // jQuery и плагины - используем npm пакеты
      'jquery': 'jquery',
      'jquery_scrollTo': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.scrollTo.min.js'),
      'jquery_custom': resolve(__dirname, 'src/public/js/plugins/jquery.custom.js'),
      'easing': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.easing.js'),
      'jquery_docsize': resolve(__dirname, 'src/public/js/plugins/jquery.documentsize.js'),
      'jquery_steps': resolve(__dirname, 'src/public/js/plugins/jquery.steps.js'),
      'jquery_actual': resolve(__dirname, 'src/public/js/plugins/jquery.actual.js'),
      'jquery_isinview': resolve(__dirname, 'src/public/js/plugins/jquery.isinview.js'),
      
      // Утилиты - используем npm пакеты
      'underscore': 'underscore',
      'lodash': 'lodash',
      'async': 'async',
      'jscookie': resolve(__dirname, 'src/public/js/vendor/jscookie/js.cookie.js'),
      
      // Дата и время - используем dayjs вместо moment
      'moment': 'dayjs',
      'moment-timezone': 'dayjs',
      'dayjs': 'dayjs',
      
      // UI библиотеки - используем npm пакеты
      'uikit': 'uikit',
      'modernizr': resolve(__dirname, 'src/public/js/vendor/modernizr/modernizr.js'),
      'snackbar': 'snackbar',
      
      // DataTables
      'datatables': resolve(__dirname, 'src/public/js/vendor/datatables/jquery.dataTables.js'),
      'dt_responsive': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.responsive.js'),
      'dt_grouping': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.grouping.js'),
      'dt_ipaddress': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.ipaddress.js'),
      'dt_scroller': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.scroller.js'),
      
      // Графики и визуализация - используем npm пакеты
      'd3': 'd3',
      'c3': 'c3',
      'metricsgraphics': resolve(__dirname, 'src/public/js/vendor/metricsgraphics/metricsgraphics.js'),
      'd3pie': resolve(__dirname, 'src/public/js/vendor/d3pie/d3pie.min.js'),
      'peity': 'peity',
      'countup': 'countup.js',
      'easypiechart': resolve(__dirname, 'src/public/js/vendor/easypiechart/easypiechart.js'),
      
      // Анимации и эффекты - используем npm пакеты
      'velocity': 'velocity-animate',
      'waves': resolve(__dirname, 'src/public/js/vendor/waves/waves.js'),
      'pace': resolve(__dirname, 'src/public/js/vendor/pace/pace.min.js'),
      'waypoints': resolve(__dirname, 'src/public/js/vendor/waypoints/jquery.waypoints.js'),
      
      // Формы и селекты - используем npm пакеты
      'selectize': 'selectize',
      'multiselect': resolve(__dirname, 'src/public/js/vendor/multiselect/js/jquery.multi-select.js'),
      'chosen': 'chosen-js',
      'formvalidator': 'form-validator',
      'autogrow': resolve(__dirname, 'src/public/js/plugins/autogrow.js'),
      
      // Дополнительные утилиты - используем npm пакеты
      'history': resolve(__dirname, 'src/public/js/vendor/history/jquery.history.js'),
      'tomarkdown': 'to-markdown',
      'colorpicker': resolve(__dirname, 'src/public/js/vendor/simplecolorpicker/jquery.simplecolorpicker.js'),
      'qrcode': resolve(__dirname, 'src/public/js/vendor/qrcode/jquery.qrcode.min.js'),
      'tether': 'tether',
      'shepherd': resolve(__dirname, 'src/public/js/vendor/shepherd/js/shepherd.min.js'),
      
      // Редакторы - используем npm пакеты
      'easymde': 'easymde',
      'inlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/inline-attachment.js'),
      'inputInlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/input.inline-attachment.js'),
      'cm4InlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/codemirror-4.inline-attachment.js'),
      'grapesjs': resolve(__dirname, 'src/public/js/vendor/grapesjs/grapes.min.js'),
      'grapesjsEmail': resolve(__dirname, 'src/public/js/vendor/grapesjs/grapesjs-preset-email.min.js')
    }
  },
  
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'jsdom': '{}', // Добавлено для замены jsdom
    'window.$': 'window.$',
    'window.jQuery': 'window.jQuery'
  },

  optimizeDeps: {
    exclude: ['jsdom']
  },
  
  // Настройки для разработки
  server: {
    port: 3000,
    hmr: true
  },
  
  // Настройки для сборки
  build: {
    outDir: 'public',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        vendor: resolve(__dirname, 'src/public/js/vendor.js'),
        app: resolve(__dirname, 'src/public/js/app.js')
      },
      output: {
        dir: 'public/js',
        entryFileNames: '[name].js',
        format: 'es',
        inlineDynamicImports: false
      }
    },
    minify: false,
    sourcemap: true,
    target: 'es2015'
  }
})

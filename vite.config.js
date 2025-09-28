import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  
  // Настройка входных точек
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/client/app.jsx'),
      output: {
        dir: 'public/js',
        entryFileNames: 'trudesk.min.js',
        chunkFileNames: 'chunk-[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        // Полностью отключаем разделение на чанки
        manualChunks: undefined,
        // Встраиваем динамические импорты в основной файл
        inlineDynamicImports: true,
        // Используем IIFE формат для совместимости с браузером
        format: 'iife'
      }
    },
    
    // Настройки оптимизации
    minify: 'esbuild',
    sourcemap: true,
    target: 'es2015',
    
    // Отключаем CSS code splitting для совместимости
    cssCodeSplit: false,
    
    // Увеличиваем лимит размера чанка чтобы избежать разделения
    chunkSizeWarningLimit: 2000
  },
  
  // Настройка разрешения модулей
  resolve: {
    alias: {
      // Алиасы из webpack.config.js
      'components': resolve(__dirname, 'src/client/components'),
      'containers': resolve(__dirname, 'src/client/containers'),
      'actions': resolve(__dirname, 'src/client/actions'),
      'api': resolve(__dirname, 'src/client/api'),
      'lib': resolve(__dirname, 'src/public/js/modules'),
      'lib2': resolve(__dirname, 'src/client/lib'),
      'modules': resolve(__dirname, 'src/public/js/modules'),
      'vendor': resolve(__dirname, 'src/public/js/vendor'),
      'sass': resolve(__dirname, 'src/sass'),
      'serverSocket': resolve(__dirname, 'src/socketio'),
      
      // Vendor алиасы (все из webpack.config.js)
      'truRequire': resolve(__dirname, 'src/public/js/truRequire.js'),
      'handlebars': resolve(__dirname, 'src/public/js/vendor/handlebars/handlebars.js'),
      'jquery': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.js'),
      'jquery_scrollTo': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.scrollTo.min.js'),
      'jscookie': resolve(__dirname, 'src/public/js/vendor/jscookie/js.cookie.js'),
      'easing': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.easing.js'),
      'moment': resolve(__dirname, 'src/public/js/vendor/moment/moment.js'),
      'moment_timezone': resolve(__dirname, 'src/public/js/vendor/moment/moment-timezone-with-data.js'),
      'uikit': resolve(__dirname, 'src/public/js/vendor/uikit/js/uikit_combined.min.js'),
      'modernizr': resolve(__dirname, 'src/public/js/vendor/modernizr/modernizr.js'),
      'underscore': resolve(__dirname, 'src/public/js/vendor/underscore/underscore.js'),
      'history': resolve(__dirname, 'src/public/js/vendor/history/jquery.history.js'),
      'app': resolve(__dirname, 'src/public/js/app.js'),
      'async': resolve(__dirname, 'src/public/js/vendor/async/async.js'),
      'jquery_custom': resolve(__dirname, 'src/public/js/plugins/jquery.custom.js'),
      'datatables': resolve(__dirname, 'src/public/js/vendor/datatables/jquery.dataTables.js'),
      'dt_responsive': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.responsive.js'),
      'dt_grouping': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.grouping.js'),
      'dt_scroller': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.scroller.js'),
      'dt_ipaddress': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.ipaddress.js'),
      'easypiechart': resolve(__dirname, 'src/public/js/vendor/easypiechart/easypiechart.js'),
      'chosen': resolve(__dirname, 'src/public/js/vendor/chosen/chosen.jquery.min.js'),
      'autogrow': resolve(__dirname, 'src/public/js/plugins/autogrow.js'),
      'pace': resolve(__dirname, 'src/public/js/vendor/pace/pace.min.js'),
      'tomarkdown': resolve(__dirname, 'src/public/js/vendor/tomarkdown/tomarkdown.js'),
      'colorpicker': resolve(__dirname, 'src/public/js/vendor/simplecolorpicker/jquery.simplecolorpicker.js'),
      'd3': resolve(__dirname, 'src/public/js/vendor/d3/d3.min.js'),
      'c3': resolve(__dirname, 'src/public/js/vendor/c3/c3.js'),
      'metricsgraphics': resolve(__dirname, 'src/public/js/vendor/metricsgraphics/metricsgraphics.min.js'),
      'd3pie': resolve(__dirname, 'src/public/js/vendor/d3pie/d3pie.min.js'),
      'peity': resolve(__dirname, 'src/public/js/vendor/peity/jquery.peity.min.js'),
      'countup': resolve(__dirname, 'src/public/js/vendor/countup/countUp.min.js'),
      'velocity': resolve(__dirname, 'src/public/js/vendor/velocity/velocity.min.js'),
      'selectize': resolve(__dirname, 'src/public/js/vendor/selectize/selectize.js'),
      'multiselect': resolve(__dirname, 'src/public/js/vendor/multiselect/js/jquery.multi-select.js'),
      'waves': resolve(__dirname, 'src/public/js/vendor/waves/waves.js'),
      'isinview': resolve(__dirname, 'src/public/js/plugins/jquery.isinview.js'),
      'jquery_docsize': resolve(__dirname, 'src/public/js/plugins/jquery.documentsize.js'),
      'jquery_steps': resolve(__dirname, 'src/public/js/plugins/jquery.steps.js'),
      'jquery_actual': resolve(__dirname, 'src/public/js/plugins/jquery.actual.js'),
      'formvalidator': resolve(__dirname, 'src/public/js/vendor/formvalidator/jquery.form-validator.js'),
      'qrcode': resolve(__dirname, 'src/public/js/vendor/qrcode/jquery.qrcode.min.js'),
      'tether': resolve(__dirname, 'src/public/js/vendor/tether/tether.min.js'),
      'shepherd': resolve(__dirname, 'src/public/js/vendor/shepherd/js/shepherd.min.js'),
      'easymde': resolve(__dirname, 'src/public/js/vendor/easymde/dist/easymde.min.js'),
      'inlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/inline-attachment.js'),
      'inputInlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/input.inline-attachment.js'),
      'cm4InlineAttachment': resolve(__dirname, 'src/public/js/vendor/easymde/dist/codemirror-4.inline-attachment.js'),
      'grapesjs': resolve(__dirname, 'src/public/js/vendor/grapesjs/grapes.min.js'),
      'grapesjsEmail': resolve(__dirname, 'src/public/js/vendor/grapesjs/grapesjs-preset-email.min.js'),
      'waypoints': resolve(__dirname, 'src/public/js/vendor/waypoints/jquery.waypoints.js'),
      'snackbar': resolve(__dirname, 'src/public/js/plugins/snackbar.js')
    }
  },
  
  // Настройка CSS
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@import "${resolve(__dirname, 'src/sass/_settings.sass')}"`
      }
    }
  },
  
  // Настройка сервера разработки
  server: {
    port: 3000,
    proxy: {
      // Проксируем API запросы к основному серверу
      '/api': 'http://localhost:8118',
      '/socket.io': {
        target: 'http://localhost:8118',
        ws: true
      }
    }
  },
  
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'redux',
      'react-redux',
      'mobx',
      'mobx-react'
    ]
  },
  
  // Настройка для legacy библиотек
  define: {
    global: 'globalThis',
  },
  
  // Плагины для работы с legacy кодом
  plugins: [
    react(),
    {
      name: 'legacy-globals',
      config() {
        return {
          define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
          }
        }
      }
    }
  ]
})

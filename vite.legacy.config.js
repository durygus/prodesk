import { defineConfig } from 'vite'
import { resolve } from 'path'

// Конфигурация для legacy кода
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'app': resolve(__dirname, 'src/public/js/app.js'),
        'vendor': resolve(__dirname, 'src/public/js/vendor.js'),
        'truRequire': resolve(__dirname, 'src/public/js/truRequire.js')
      },
      output: {
        dir: 'public/js',
        entryFileNames: '[name].js',
        format: 'es',
        inlineDynamicImports: false
      }
    },
    minify: 'esbuild',
    sourcemap: true,
    target: 'es2015'
  },
  
  resolve: {
    alias: {
      'modules': resolve(__dirname, 'src/public/js/modules'),
      'vendor': resolve(__dirname, 'src/public/js/vendor'),
      'jquery': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.js'),
      'jquery_scrollTo': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.scrollTo.min.js'),
      'jquery_custom': resolve(__dirname, 'src/public/js/plugins/jquery.custom.js'),
      'easing': resolve(__dirname, 'src/public/js/vendor/jquery/jquery.easing.js'),
      'underscore': resolve(__dirname, 'src/public/js/vendor/underscore/underscore.js'),
            'moment': 'moment',
            'moment-timezone': 'moment-timezone',
      'uikit': resolve(__dirname, 'src/public/js/vendor/uikit/js/uikit_combined.min.js'),
      'modernizr': resolve(__dirname, 'src/public/js/vendor/modernizr/modernizr.js'),
      'snackbar': resolve(__dirname, 'src/public/js/plugins/snackbar.js'),
      'datatables': resolve(__dirname, 'src/public/js/vendor/datatables/jquery.dataTables.js'),
      'dt_responsive': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.responsive.js'),
      'dt_grouping': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.grouping.js'),
      'dt_ipaddress': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.ipaddress.js'),
      'dt_scroller': resolve(__dirname, 'src/public/js/vendor/datatables/dataTables.scroller.js'),
      'async': resolve(__dirname, 'src/public/js/vendor/async/async.js'),
      'jscookie': resolve(__dirname, 'src/public/js/vendor/jscookie/js.cookie.js'),
      'history': resolve(__dirname, 'src/public/js/vendor/history/jquery.history.js'),
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
      'chosen': resolve(__dirname, 'src/public/js/vendor/chosen/chosen.jquery.min.js'),
      'autogrow': resolve(__dirname, 'src/public/js/plugins/autogrow.js'),
      'pace': resolve(__dirname, 'src/public/js/vendor/pace/pace.min.js'),
      'tomarkdown': resolve(__dirname, 'src/public/js/vendor/tomarkdown/tomarkdown.js'),
      'colorpicker': resolve(__dirname, 'src/public/js/vendor/simplecolorpicker/jquery.simplecolorpicker.js'),
      'easypiechart': resolve(__dirname, 'src/public/js/vendor/easypiechart/easypiechart.js'),
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
      'waypoints': resolve(__dirname, 'src/public/js/vendor/waypoints/jquery.waypoints.js')
    }
  },
  
  define: {
    global: 'globalThis'
  }
})

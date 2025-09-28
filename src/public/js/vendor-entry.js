// Vendor entry point for Vite
// Импортируем основные библиотеки, которые использовались в webpack

// Core libraries
import 'jquery'
import 'underscore'
import 'modernizr'
import 'moment'
import 'handlebars'

// jQuery plugins
import './vendor/jquery/jquery.easing.js'
import './vendor/jquery/jquery.scrollTo.min.js'
import './plugins/jquery.custom.js'

// DataTables
import './vendor/datatables/jquery.dataTables.js'
import './vendor/datatables/dataTables.responsive.js'
import './vendor/datatables/dataTables.grouping.js'
import './vendor/datatables/dataTables.ipaddress.js'

// UI Libraries
import './vendor/uikit/js/uikit_combined.min.js'
import './vendor/chosen/chosen.jquery.min.js'
import './vendor/pace/pace.min.js'

// Utility libraries
import './vendor/async/async.js'
import './vendor/jscookie/js.cookie.js'
import './vendor/history/jquery.history.js'

// Charts and visualization
import './vendor/d3/d3.min.js'
import './vendor/c3/c3.js'
import './vendor/metricsgraphics/metricsgraphics.min.js'
import './vendor/d3pie/d3pie.min.js'
import './vendor/peity/jquery.peity.min.js'
import './vendor/countup/countUp.min.js'

// Form and input libraries
import './vendor/selectize/selectize.js'
import './vendor/multiselect/js/jquery.multi-select.js'
import './vendor/formvalidator/jquery.form-validator.js'
import './vendor/simplecolorpicker/jquery.simplecolorpicker.js'

// Other utilities
import './vendor/velocity/velocity.min.js'
import './vendor/waves/waves.js'
import './vendor/waypoints/jquery.waypoints.js'
import './vendor/qrcode/jquery.qrcode.min.js'
import './vendor/tether/tether.min.js'
import './vendor/shepherd/js/shepherd.min.js'
import './vendor/easymde/dist/easymde.min.js'
import './vendor/grapesjs/grapes.min.js'

// Custom plugins
import './plugins/autogrow.js'
import './plugins/jquery.steps.js'
import './plugins/jquery.actual.js'
import './plugins/jquery.isinview.js'
import './plugins/jquery.documentsize.js'
import './plugins/snackbar.js'

console.log('Vendor libraries loaded via Vite');

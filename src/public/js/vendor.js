// Vendor entry point for Vite
// Импортируем основные библиотеки, которые использовались в webpack

// Core libraries
import 'jquery'
import 'underscore'
import 'modernizr'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

// Настраиваем dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(duration)

// Совместимость с существующим кодом
window.moment = dayjs
window.dayjs = dayjs
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
import 'async'
import 'jscookie'
import 'history'

// Charts and visualization
import 'd3'
import 'c3'
import 'metricsgraphics'
import 'd3pie'
import 'peity'
import 'countup'

// Form and input libraries
import 'selectize'
import 'multiselect'
import 'formvalidator'
import 'simplecolorpicker'

// Other utilities
import 'velocity'
import 'waves'
import 'waypoints'
import 'qrcode'
import 'tether'
import 'shepherd'
import 'easymde'
import 'grapesjs'

// Custom plugins
import './plugins/autogrow.js'
import './plugins/jquery.steps.js'
import './plugins/jquery.actual.js'
import './plugins/jquery.isinview.js'
import './plugins/jquery.documentsize.js'
import './plugins/snackbar.js'

console.log('Vendor libraries loaded via Vite');
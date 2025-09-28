// Global variables for legacy libraries compatibility
// This file ensures that legacy jQuery plugins and UIKit work with Vite

import $ from 'jquery'
import UIKit from 'uikit'

// Make jQuery global
window.$ = $
window.jQuery = $
globalThis.$ = $
globalThis.jQuery = $

// Make UIKit global
window.UIkit = UIKit
globalThis.UIkit = UIKit

// Other global variables that might be needed
window.moment = () => import('moment')
window._ = () => import('underscore')

console.log('Global variables initialized for legacy compatibility')

export { $, UIKit }

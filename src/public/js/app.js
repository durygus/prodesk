/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

// Global react var for calling state outside react.
if (typeof global !== 'undefined') {
  global.react = {}
} else if (typeof window !== 'undefined') {
  window.react = {}
}

// ES6 imports
import $ from 'jquery'
import helpers from 'modules/helpers.js'
import async from 'async'
import SessionService from 'singleton/sessionSingleton.js'
import SettingsService from 'singleton/settingsSingleton.js'
import _ from 'lodash'
import UIkit from 'uikit'
import ajaxify from 'modules/ajaxify.js'
const pace = require('pace')

// Убеждаемся, что jQuery доступен глобально
if (typeof window !== 'undefined') {
  window.$ = $
  window.jQuery = $
}

$(document).ready(function () {
  // Call the Session service before bootstrapping.
  // Allowing the SessionUser to be populated before the controllers have access.
  async.parallel(
    [
      function (done) {
        SessionService.init(done)
      },
      function (done) {
        SettingsService.init(done)
      }
    ],
    function (err) {
      if (err) console.log(err)
      if (err) throw new Error(err)

      helpers.init()

      // React Bootstrap
      import('../../client/app.jsx').then(() => {
        ajaxify.init()

        const $event = _.debounce(() => {
          helpers.hideLoader(1000)

          $.event.trigger('trudesk:ready', window)
        }, 100)

        $event()
      })
    }
  )
})

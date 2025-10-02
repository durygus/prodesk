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
 *  Updated:    1/20/19 4:43 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

// ES6 imports
import $ from 'jquery'
import helpers from 'modules/helpers'
import Tether from 'tether'
import History from 'history'

// Main pluginsPage object
  var pluginsPage = {}

  pluginsPage.init = function (callback) {
    $(document).ready(function () {
      var $searchPluginList = $('#search_plugin_list')
      $searchPluginList.off('keyup')
      $searchPluginList.on('keyup', function () {
        var value = this.value.toLowerCase()
        $('table#plugin_list_table')
          .find('tbody')
          .find('tr')
          .each(function () {
            var id = $(this)
              .find('td')
              .text()
              .toLowerCase()
            $(this).toggle(id.indexOf(value) !== -1)
          })
      })

      if ($('.plugin-tether').length > 0) {
        // eslint-disable-next-line
        new Tether({
          element: '.plugin-tether',
          target: '.tether-plugins',
          attachment: 'top left',
          targetAttachment: 'top right',
          offset: '0 -20px'
        })
      }

      if (typeof callback === 'function') {
        return callback()
      }
    })
  }

  return pluginsPage
})

// ES6 export
export default pluginsPage

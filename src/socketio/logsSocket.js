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

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const utils = require('../helpers/utils')
const AnsiUp = require('ansi_up')
const ansiUp = new AnsiUp.default()
const Tail = require('tail').Tail
const fs = require('fs-extra')

const logFile = path.join(__dirname, '../../logs/error.log')

var events = {}

function register (socket) {
  events.onLogsFetch(socket)
}

function eventLoop () {}
events.onLogsFetch = function (socket) {
  socket.on('logs:fetch', function () {
    fs.exists(logFile, function (exists) {
      if (exists) {
        var contents = fs.readFileSync(logFile, 'utf8')
        utils.sendToSelf(socket, 'logs:data', ansiUp.ansi_to_html(contents))

        var tail = new Tail(logFile)

        tail.on('line', function (data) {
          utils.sendToSelf(socket, 'logs:data', ansiUp.ansi_to_html(data))
        })
      } else {
        utils.sendToSelf(socket, 'logs:data', '\r\nInvalid Log File...\r\n')
      }
    })
  })
}

export default {
  events: events,
  eventLoop: eventLoop,
  register: register
}

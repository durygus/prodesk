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

import winston from 'winston'
import * as utils from '../helpers/utils/index.js'
import noticeSchema from '../models/notice.js'
import socketEventConst from '../socketio/socketEventConsts.js'

const events = {}

function register (socket) {
  events.onShowNotice(socket)
  events.onClearNotice(socket)
}

function eventLoop () {}

events.onShowNotice = function (socket) {
  socket.on(socketEventConst.NOTICE_SHOW, function ({ noticeId }) {
    noticeSchema.getNotice(noticeId, function (err, notice) {
      if (err) return true
      notice.activeDate = new Date()
      notice.save(function (err) {
        if (err) {
          winston.warn(err)
          return true
        }

        utils.sendToAllConnectedClients(io, socketEventConst.NOTICE_UI_SHOW, notice)
      })
    })
  })
}

events.onClearNotice = function (socket) {
  socket.on(socketEventConst.NOTICE_CLEAR, function () {
    utils.sendToAllConnectedClients(io, socketEventConst.NOTICE_UI_CLEAR)
  })
}

export default {
  events: events,
  eventLoop: eventLoop,
  register: register
}

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

import _ from 'lodash'
import { filterXSS as xss } from 'xss'
import fs from 'fs'
import winston from '../../logger/index.js'
import piexifjs from 'piexifjs'

const MAX_FIELD_TEXT_LENGTH = 255
const MAX_SHORT_FIELD_TEXT_LENGTH = 25
const MAX_EXTREME_TEXT_LENGTH = 2000

export const applyMaxTextLength = function (text) {
  return text.toString().substring(0, MAX_FIELD_TEXT_LENGTH)
}

export const applyMaxShortTextLength = function (text) {
  return text.toString().substring(0, MAX_SHORT_FIELD_TEXT_LENGTH)
}

export const applyExtremeTextLength = function (text) {
  return text.toString().substring(0, MAX_EXTREME_TEXT_LENGTH)
}

export const sanitizeFieldPlainText = function (text) {
  return xss(text, {
    whileList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  })
}

export const stripExifData = function (path) {
  try {
    const imgData = fs.readFileSync(path).toString('binary')
    const newImgData = piexifjs.remove(imgData)
    fs.writeFileSync(path, newImgData, 'binary')
  } catch (e) {
    winston.warn(e)
  }
}

export const sendToSelf = function (socket, method, data) {
  socket.emit(method, data)
}

export const _sendToSelf = function (io, socketId, method, data) {
  _.each(io.sockets.sockets, function (socket) {
    if (socket.id === socketId) {
      socket.emit(method, data)
    }
  })
}

export const sendToAllConnectedClients = function (io, method, data) {
  io.sockets.emit(method, data)
}

export const sendToAllClientsInRoom = function (io, room, method, data) {
  io.sockets.in(room).emit(method, data)
}

export const sendToUser = function (socketList, userList, username, method, data) {
  let userOnline = null
  _.forEach(userList, function (v, k) {
    if (k.toLowerCase() === username.toLowerCase()) {
      userOnline = v
      return true
    }
  })

  if (_.isNull(userOnline)) return true

  _.forEach(userOnline.sockets, function (socket) {
    const o = _.findKey(socketList, { id: socket })
    const i = socketList[o]
    if (_.isUndefined(i)) return true
    i.emit(method, data)
  })
}

export const sendToAllExcept = function (io, exceptSocketId, method, data) {
  _.each(io.sockets.sockets, function (socket) {
    if (socket.id !== exceptSocketId) {
      socket.emit(method, data)
    }
  })
}

export const disconnectAllClients = function (io) {
  Object.keys(io.sockets.sockets).forEach(function (sock) {
    io.sockets.sockets[sock].disconnect(true)
  })
}

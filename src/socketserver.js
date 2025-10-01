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

import winston from './logger/index.js'
import async from 'async'
import passportSocketIo from 'passport.socketio'
import cookieparser from 'cookie-parser'
import nconf from 'nconf'

// Submodules
import ticketSocket from './socketio/ticketSocket.js'
import chatSocket from './socketio/chatSocket.js'
import notificationSocket from './socketio/notificationSocket.js'
import noticeSocket from './socketio/noticeSocket.js'
import accountsImportSocket from './socketio/accountImportSocket.js'
import backupRestoreSocket from './socketio/backupRestoreSocket.js'
import logsSocket from './socketio/logsSocket.js'
import { Server as SocketIO } from 'socket.io'
import userSchema from './models/user.js'

const socketServer = function (ws) {
  'use strict'

  const socketConfig = {
    pingTimeout: nconf.get('socket:pingTimeout') ? nconf.get('socket:pingTimeout') : 15000,
    pingInterval: nconf.get('socket:pingInterval') ? nconf.get('socket:pingInterval') : 30000,
    secret: nconf.get('tokens:secret') ? nconf.get('tokens:secret') : 'trudesk$1234#SessionKeY!2288'
  }

  const io = new SocketIO(ws.server, {
    pingTimeout: socketConfig.pingTimeout,
    pingInterval: socketConfig.pingInterval
  })

  io.use(function (data, accept) {
    async.waterfall(
      [
        async.constant(data),
        function (data, next) {
          if (!data.request._query.token) {
            return next(null, data)
          }

          const userSchemaModel = userSchema
          userSchemaModel.getUserByAccessToken(data.request._query.token, (err, user) => {
            if (!err && user) {
              winston.debug('Authenticated socket ' + data.id + ' - ' + user.username)
              data.request.user = user
              data.request.user.logged_in = true
              data.token = data.request._query.token
              return next(null, data)
            }

            data.emit('unauthorized')
            data.disconnect('Unauthorized')
            return next(new Error('Unauthorized'))
          })
        },
        function (data, accept) {
          if (data.request && data.request.user && data.request.user.logged_in) {
            data.user = data.request.user
            return accept(null, true)
          }

          return passportSocketIo.authorize({
            cookieParser: cookieparser,
            key: 'connect.sid',
            store: ws.sessionStore,
            secret: socketConfig.secret,
            success: onAuthorizeSuccess
          })(data, accept)
        }
      ],
      function (err) {
        if (err) {
          return accept(new Error(err))
        }

        return accept()
      }
    )
  })

  // io.set('transports', ['polling', 'websocket'])

  io.sockets.on('connection', socket => {
    // Register Submodules
    ticketSocket.register(socket)
    chatSocket.register(socket)
    notificationSocket.register(socket)
    noticeSocket.register(socket)
    accountsImportSocket.register(socket)
    backupRestoreSocket.register(socket)
    logsSocket.register(socket)
  })

  global.io = io

  // Register Event Loop
  global.socketServer = {
    eventLoop: {
      _loop: 0,
      start: () => {
        global.socketServer.eventLoop._loop = setInterval(() => {
          // The main socket event loop.
          notificationSocket.eventLoop()
          chatSocket.eventLoop()
        }, 5000)
      },
      stop: () => {
        clearInterval(global.socketServer.eventLoop._loop)
      }
    }
  }

  global.socketServer.eventLoop.start()

  winston.info('SocketServer Running')
}

function onAuthorizeSuccess (data, accept) {
  winston.debug('User successfully connected: ' + data.user.username)

  accept()
}

export default socketServer

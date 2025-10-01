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
import async from 'async'
import winston from '../logger/index.js'
import * as utils from '../helpers/utils/index.js'
import socketEvents from './socketEventConsts.js'

var events = {}

function register (socket) {
  events.updateNotifications(socket)
  events.updateAllNotifications(socket)
  events.markNotificationRead(socket)
  events.clearNotifications(socket)
}

function eventLoop () {
  updateNotifications()
}

async function updateNotifications () {
  const notificationSchema = (await import('../models/notification.js')).default
  // eslint-disable-next-line no-unused-vars
  for (const [_, socket] of io.of('/').sockets) {
    const notifications = {}
    async.parallel(
      [
        function (done) {
          notificationSchema.getForUserWithLimit(socket.request.user._id, function (err, items) {
            if (err) return done(err)

            notifications.items = items
            return done()
          })
        },
        function (done) {
          notificationSchema.getUnreadCount(socket.request.user._id, function (err, count) {
            if (err) return done(err)

            notifications.count = count

            return done()
          })
        }
      ],
      function (err) {
        if (err) {
          winston.warn(err)
          return true
        }

        utils.sendToSelf(socket, socketEvents.NOTIFICATIONS_UPDATE, notifications)
      }
    )
  }
}

async function updateAllNotifications (socket) {
  var notifications = {}
  var notificationSchema = (await import('../models/notification.js')).default
  notificationSchema.findAllForUser(socket.request.user._id, function (err, items) {
    if (err) return false

    notifications.items = items

    utils.sendToSelf(socket, 'updateAllNotifications', notifications)
  })
}

events.updateNotifications = function (socket) {
  socket.on(socketEvents.NOTIFICATIONS_UPDATE, function () {
    updateNotifications(socket)
  })
}

events.updateAllNotifications = function (socket) {
  socket.on('updateAllNotifications', function () {
    updateAllNotifications(socket)
  })
}

events.markNotificationRead = async function (socket) {
  socket.on(socketEvents.NOTIFICATIONS_MARK_READ, async function (_id) {
    if (_.isUndefined(_id)) return true
    var notificationSchema = (await import('../models/notification.js')).default
    notificationSchema.getNotification(_id, function (err, notification) {
      if (err) return true

      notification.markRead(function () {
        notification.save(function (err) {
          if (err) return true

          updateNotifications(socket)
        })
      })
    })
  })
}

events.clearNotifications = async function (socket) {
  socket.on(socketEvents.NOTIFICATIONS_CLEAR, async function () {
    var userId = socket.request.user._id
    if (_.isUndefined(userId)) return true
    var notifications = {}
    notifications.items = []
    notifications.count = 0

    var notificationSchema = (await import('../models/notification.js')).default
    notificationSchema.clearNotifications(userId, function (err) {
      if (err) return true

      utils.sendToSelf(socket, socketEvents.UPDATE_NOTIFICATIONS, notifications)
    })
  })
}

export default {
  events: events,
  eventLoop: eventLoop,
  register: register
}

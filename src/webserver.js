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
import nconf from 'nconf'
nconf.argv().env()

import express from 'express'
import http from 'http'
import winston from './logger/index.js'
import middleware from './middleware/index.js'
import routes from './routes/index.js'

const WebServer = express()
const server = http.createServer(WebServer)
let port = nconf.get('port') || 8118

let sessionStore

const webserverInit = async (db, callback, p) => {
  if (p !== undefined) port = p
  middleware(WebServer, db, function (middlewareResult, store) {
    sessionStore = store
    routes(WebServer, middlewareResult)

    if (typeof callback === 'function') callback()
  })
}

const webserverListen = (callback, p) => {
  if (!_.isUndefined(p)) port = p

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      winston.error('Address in use, exiting...')
      server.close()
    } else {
      winston.error(err.message)
      throw err
    }
  })

  server.listen(port, '0.0.0.0', () => {
    winston.info('Trudesk is now listening on port: ' + port)

    if (_.isFunction(callback)) return callback()
  })
}

const installServer = async function (callback) {
  const controllers = (await import('./controllers/index.js')).default
  const path = (await import('path')).default
  const hbs = (await import('express-hbs')).default
  const hbsHelpers = (await import('./helpers/hbs/helpers.js')).default
  const bodyParser = (await import('body-parser')).default
  const favicon = (await import('serve-favicon')).default
  const { readFileSync } = await import('fs')
  const { fileURLToPath } = await import('url')
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
  const routeMiddleware = (await import('./middleware/middleware.js')).default(WebServer)

  WebServer.set('views', path.join(__dirname, './views/'))
  WebServer.engine(
    'hbs',
    hbs.express3({
      defaultLayout: path.join(__dirname, './views/layout/main.hbs'),
      partialsDir: [path.join(__dirname, './views/partials/')]
    })
  )
  WebServer.set('view engine', 'hbs')
  hbsHelpers.register(hbs.handlebars)

  WebServer.use('/assets', express.static(path.join(__dirname, '../public/uploads/assets')))

  WebServer.use(express.static(path.join(__dirname, '../public')))
  WebServer.use(favicon(path.join(__dirname, '../public/img/favicon.ico')))
  WebServer.use(bodyParser.urlencoded({ extended: false }))
  WebServer.use(bodyParser.json())

  const router = express.Router()
  router.get('/healthz', (req, res) => {
    res.status(200).send('OK')
  })
  router.get('/version', (req, res) => {
    return res.json({ version: pkg.version })
  })

  router.get('/install', controllers.install.index)
  router.post('/install', routeMiddleware.checkOrigin, controllers.install.install)
  router.post('/install/elastictest', routeMiddleware.checkOrigin, controllers.install.elastictest)
  router.post('/install/mongotest', routeMiddleware.checkOrigin, controllers.install.mongotest)
  router.post('/install/existingdb', routeMiddleware.checkOrigin, controllers.install.existingdb)
  router.post('/install/restart', routeMiddleware.checkOrigin, controllers.install.restart)

  WebServer.use('/', router)

  WebServer.use((req, res) => {
    return res.redirect('/install')
  })

  const { Server: SocketIO } = await import('socket.io')
  new SocketIO(server)

  const buildsass = (await import('./sass/buildsass.js')).default
  buildsass.buildDefault(err => {
    if (err) {
      winston.error(err)
      return callback(err)
    }

    if (!server.listening) {
      server.listen(port, '0.0.0.0', () => {
        return callback()
      })
    } else {
      return callback()
    }
  })
}

// Load Events
await import('./emitter/events.js')

export default {
  server,
  app: WebServer,
  init: webserverInit,
  listen: webserverListen,
  installServer,
  get sessionStore() { return sessionStore }
}

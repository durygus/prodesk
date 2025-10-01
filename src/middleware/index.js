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

import path from 'path'
import { fileURLToPath } from 'url'
import async from 'async'
import express from 'express'
import expressStaticGzip from 'express-static-gzip'
import mongoose from 'mongoose'
import APC from '@handlebars/allow-prototype-access'
import HandleBars from 'handlebars'
const insecureHandlebars = APC.allowInsecurePrototypeAccess(HandleBars)
import hbs from 'express-hbs'
import hbsHelpers from '../helpers/hbs/helpers.js'
import winston from '../logger/index.js'
import nconf from 'nconf'
import flash from 'connect-flash'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { createRequire } from 'module'
import middlewareModule from './middleware.js'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let passportConfig = null
async function getPassportConfig() {
  if (!passportConfig) {
    const { default: passportModule } = await import('../passport/index.js')
    passportConfig = passportModule()
  }
  return passportConfig
}

let middleware = {}

export default function (app, db, callback) {
  middleware = middlewareModule(app)
  app.disable('x-powered-by')

  app.set('views', path.join(__dirname, '../views/'))

  app.engine(
    'hbs',
    hbs.express4({
      handlebars: insecureHandlebars,
      defaultLayout: path.join(__dirname, '../views/layout/main.hbs'),
      partialsDir: [path.join(__dirname, '../views/partials/'), path.join(__dirname, '../views/subviews/reports')]
    })
  )
  app.set('view engine', 'hbs')
  hbsHelpers.register(hbs.handlebars)
  // Required to access handlebars in mail templates
  global.Handlebars = hbs.handlebars

  app.use(bodyParser.urlencoded({ limit: '2mb', extended: false }))
  app.use(bodyParser.json({ limit: '2mb' }))
  app.use(cookieParser())

  if (global.env === 'production') {
    app.use(
      expressStaticGzip(path.join(__dirname, '../../public'), {
        index: false
      })
    )
  } else app.use(express.static(path.join(__dirname, '../../public')))

  app.use(function (req, res, next) {
    if (mongoose.connection.readyState !== 1) {
      const err = new Error('MongoDb Connection Error')
      err.status = 503

      return res.render('503', { layout: false })
    }

    return next()
  })

  const cookie = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
  }

  const sessionSecret = nconf.get('tokens:secret') ? nconf.get('tokens:secret') : 'trudesk$1234#SessionKeY!2288'

  async.waterfall(
    [
      function (next) {
        const sessionStore = MongoStore.create({
          client: db.connection.getClient(),
          autoReconnect: true
        })
        app.use(
          session({
            secret: sessionSecret,
            cookie,
            store: sessionStore,
            saveUninitialized: false,
            resave: false
          })
        )

        next(null, sessionStore)
      },
      function (store, next) {
        app.use(passportConfig.initialize())
        app.use(passportConfig.session())
        app.use(flash())

        // CORS
        app.use(allowCrossDomain)
        const csrf = require('../dependencies/csrf-td')
        csrf.init()
        app.use(csrf.generateToken)

        // Maintenance Mode
        app.use(function (req, res, next) {
          var settings = require('../settings/settingsUtil')
          settings.getSettings(function (err, setting) {
            if (err) return winston.warn(err)
            var maintenanceMode = setting.data.settings.maintenanceMode

            if (req.user) {
              if (maintenanceMode.value === true && !req.user.role.isAdmin) {
                return res.render('maintenance', { layout: false })
              }
            }

            return next()
          })
        })

        // Mobile - Disable mobile view until rewrite due to a security bug
        app.use('/mobile', express.static(path.join(__dirname, '../../', 'mobile')))
        // app.use('/mobile', (req, res, next) => {
        //   return res.redirect('/')
        // })

        app.use('/assets', express.static(path.join(__dirname, '../../public/uploads/assets')))
        app.use('/uploads/users', express.static(path.join(__dirname, '../../public/uploads/users')))
        app.use('/uploads', middleware.hasAuth, express.static(path.join(__dirname, '../../public/uploads')))
        app.use(
          '/backups',
          middleware.hasAuth,
          middleware.isAdmin,
          express.static(path.join(__dirname, '../../backups'))
        )

        // Uncomment to enable plugins
        return next(null, store)
        // global.plugins = [];
        // var dive = require('dive');
        // dive(path.join(__dirname, '../../plugins'), {directories: true, files: false, recursive: false}, function(err, dir) {
        //    if (err) throw err;
        //    var fs = require('fs');
        //    if (fs.existsSync(path.join(dir, 'plugin.json'))) {
        //        var plugin = require(path.join(dir, 'plugin.json'));
        //        if (!_.isUndefined(_.find(global.plugins, {'name': plugin.name})))
        //            throw new Error('Unable to load plugin with duplicate name: ' + plugin.name);
        //
        //        global.plugins.push({name: plugin.name.toLowerCase(), version: plugin.version});
        //        var pluginPublic = path.join(dir, '/public');
        //        app.use('/plugins/' + plugin.name, express.static(pluginPublic));
        //        winston.debug('Detected Plugin: ' + plugin.name.toLowerCase() + '-' + plugin.version);
        //    }
        // }, function() {
        //     next(null, store);
        // });
      }
    ],
    function (err, s) {
      if (err) {
        winston.error(err)
        throw new Error(err)
      }

      callback(middleware, s)
    }
  )
}

function allowCrossDomain (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,accesstoken,X-RToken,X-Token'
  )
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none';")

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}

#!/usr/bin/env node

/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    5/11/22 2:26 AM
 *  Copyright (c) 2014-2022 Trudesk, Inc. All rights reserved.
 */

import async from 'async'
import path from 'path'
import fs from 'fs'
import winston from './src/logger/index.js'
import nconf from 'nconf'
import Chance from 'chance'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const chance = new Chance()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
// `const memory = require('./src/memory');

const isDocker = process.env.TRUDESK_DOCKER || false

global.forks = []

nconf.argv().env()

global.env = process.env.NODE_ENV || 'development'

if (!process.env.FORK) {
  winston.info('    .                              .o8                     oooo')
  winston.info('  .o8                             "888                     `888')
  winston.info('.o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo')
  winston.info('  888   `888""8P `888  `888  d88\' `888  d88\' `88b d88(  "8  888 .8P\'')
  winston.info('  888    888      888   888  888   888  888ooo888 `"Y88b.   888888.')
  winston.info('  888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.')
  winston.info('  "888" d888b     `V88V"V8P\' `Y8bod88P" `Y8bod8P\' 8""888P\' o888o o888o')
  winston.info('==========================================================================')
  winston.info('trudesk v' + pkg.version + ' Copyright (C) 2014-2023 Chris Brame')
  winston.info('')
  winston.info('Running in: ' + global.env)
  winston.info('Server Time: ' + new Date())
}

let configFile = path.join(__dirname, '/config.yml')

if (nconf.get('config')) {
  configFile = path.resolve(__dirname, nconf.get('config'))
}

// Make sure we convert the .json file to .yml
checkForOldConfig()

const configExists = fs.existsSync(configFile)

async function launchInstallServer () {
  // Load the defaults for the install server
  nconf.defaults({
    tokens: {
      secret: chance.hash() + chance.md5()
    }
  })

  const ws = await import('./src/webserver.js')
  ws.default.installServer(function () {
    return winston.info('Trudesk Install Server Running...')
  })
}

if (nconf.get('install') || (!configExists && !isDocker)) {
  launchInstallServer()
}

function loadConfig () {
  nconf.file({
    file: configFile,
    format: require('nconf-yaml')
  })

  // Must load after file
  nconf.defaults({
    base_dir: __dirname,
    tokens: {
      secret: chance.hash() + chance.md5(),
      expires: 900
    }
  })
}

function checkForOldConfig () {
  const oldConfigFile = path.join(__dirname, '/config.json')
  if (fs.existsSync(oldConfigFile)) {
    // Convert config to yaml.
    const content = fs.readFileSync(oldConfigFile)
    const YAML = require('yaml')
    const data = JSON.parse(content)

    fs.writeFileSync(configFile, YAML.stringify(data))

    // Rename the old config.json to config.json.bk
    fs.renameSync(oldConfigFile, path.join(__dirname, '/config.json.bk'))
  }
}

async function start () {
  if (!isDocker) loadConfig()
  if (isDocker) {
    // Load some defaults for JWT token that is missing when using docker
    const jwt = process.env.TRUDESK_JWTSECRET
    nconf.defaults({
      tokens: {
        secret: jwt || chance.hash() + chance.md5(),
        expires: 900
      }
    })
  }

  const _db = await import('./src/database/index.js')

  _db.default.init(function (err, db) {
    if (err) {
      winston.error('FETAL: ' + err.message)
      winston.warn('Retrying to connect to MongoDB in 10secs...')
      return setTimeout(function () {
        _db.default.init(dbCallback)
      }, 10000)
    } else {
      dbCallback(err, db)
    }
  })
}

async function launchServer (db) {
  const ws = await import('./src/webserver.js')
  ws.default.init(db, function (err) {
    if (err) {
      winston.error(err)
      return
    }

    async.series(
      [
        function (next) {
          import('./src/settings/defaults.js').then(({ default: settingsDefaults }) => {
            settingsDefaults.init(next)
          })
        },
        function (next) {
          import('./src/permissions/index.js').then(({ default: permissions }) => {
            permissions.register(next)
          })
        },
        function (next) {
          import('./src/elasticsearch/index.js').then(({ default: elasticsearch }) => {
            elasticsearch.init(function (err) {
              if (err) {
                winston.error(err)
              }
              return next()
            })
          })
        },
        function (next) {
          import('./src/socketserver.js').then(({ default: socketserver }) => {
            socketserver(ws.default)
            return next()
          })
        },
        function (next) {
          // Start Check Mail
          import('./src/models/setting.js').then(({ default: settingSchema }) => {
            settingSchema.getSetting('mailer:check:enable', function (err, mailCheckEnabled) {
              if (err) {
                winston.warn(err)
                return next(err)
              }

              if (mailCheckEnabled && mailCheckEnabled.value) {
                settingSchema.getSettings(function (err, settings) {
                  if (err) return next(err)

                  import('./src/mailer/mailCheck.js').then(({ default: mailCheck }) => {
                    winston.debug('Starting MailCheck...')
                    mailCheck.init(settings)
                    return next()
                  })
                })
              } else {
                return next()
              }
            })
          })
        },
        function (next) {
          import('./src/migration/index.js').then(({ default: migration }) => {
            migration.run(next)
          })
        },
        function (next) {
          winston.debug('Building dynamic sass...')
          import('./src/sass/buildsass.js').then(({ default: buildsass }) => {
            buildsass.build(next)
          })
        },
        function (next) {
          import('./src/cache/index.js').then(({ default: cache }) => {
            if (isDocker) {
              cache.env = {
                TRUDESK_DOCKER: process.env.TRUDESK_DOCKER,
                TD_MONGODB_SERVER: process.env.TD_MONGODB_SERVER,
                TD_MONGODB_PORT: process.env.TD_MONGODB_PORT,
                TD_MONGODB_USERNAME: process.env.TD_MONGODB_USERNAME,
                TD_MONGODB_PASSWORD: process.env.TD_MONGODB_PASSWORD,
                TD_MONGODB_DATABASE: process.env.TD_MONGODB_DATABASE,
                TD_MONGODB_URI: process.env.TD_MONGODB_URI
              }
            }

            cache.init()
            return next()
          })
        },
        function (next) {
          import('./src/taskrunner/index.js').then(({ default: taskRunner }) => {
            return taskRunner.init(next)
          })
        }
      ],
      function (err) {
        if (err) throw new Error(err)

        ws.default.listen(function () {
          winston.info('trudesk Ready')
        })
      }
    )
  })
}

async function dbCallback (err, db) {
  if (err || !db) {
    return start()
  }

  // В Docker режиме проверяем флаг installed
  if (isDocker) {
    const s = await import('./src/models/setting.js')
    s.default.getSettingByName('installed', function (err, installed) {
      if (err) return start()

      if (!installed || !installed.value) {
        return launchInstallServer()
      } else {
        return launchServer(db)
      }
    })
  } else {
    // В нативном режиме тоже проверяем флаг installed, если есть config.yml
    if (configExists) {
      const s = await import('./src/models/setting.js')
      s.default.getSettingByName('installed', function (err, installed) {
        if (err) {
          // Если ошибка при проверке, запускаем установку
          return launchInstallServer()
        }

        if (!installed || !installed.value) {
          return launchInstallServer()
        } else {
          return launchServer(db)
        }
      })
    } else {
      // Если нет config.yml, сразу запускаем установку
      return launchInstallServer()
    }
  }
}

if (!nconf.get('install') && (configExists || isDocker)) start()

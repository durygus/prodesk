/*
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    02/24/18
 Author:     Chris Brame

 **/

import { fileURLToPath } from 'url'
import { dirname } from 'path'
import _ from 'lodash'
import fs from 'fs-extra'
import path from 'path'
import async from 'async'
import winston from '../logger/index.js'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dayjs.extend(timezone)
dayjs.extend(utc)

import SettingsSchema from '../models/setting.js'
import PrioritySchema from '../models/ticketpriority.js'
import roleSchema from '../models/role.js'
import roleOrderSchema from '../models/roleorder.js'
import http from 'http'
import os from 'os'
import semver from 'semver'
import database from '../database/index.js'
import unzipper from 'unzipper'
import ticketTypeSchema from '../models/tickettype.js'
import ticketStatusSchema from '../models/ticketStatus.js'
import tagSchema from '../models/tag.js'
import ticketSchema from '../models/ticket.js'
import templateSchema from '../models/template.js'
import nconf from 'nconf'
import Chance from 'chance'

const settingsDefaults = {}
const roleDefaults = {}

roleDefaults.userGrants = ['tickets:create view update', 'comments:create view update']
roleDefaults.supportGrants = [
  'tickets:*',
  'agent:*',
  'accounts:create update view import',
  'teams:create update view',
  'comments:create view update create delete',
  'reports:view create',
  'notices:*'
]
roleDefaults.adminGrants = [
  'admin:*',
  'agent:*',
  'chat:*',
  'tickets:*',
  'accounts:*',
  'groups:*',
  'teams:*',
  'departments:*',
  'comments:*',
  'reports:*',
  'notices:*',
  'settings:*',
  'api:*'
]

settingsDefaults.roleDefaults = roleDefaults

function rolesDefault (callback) {
  const roleSchemaModel = roleSchema

  async.series(
    [
      function (done) {
        roleSchemaModel.getRoleByName('User', function (err, role) {
          if (err) return done(err)
          if (role) return done()

          roleSchemaModel.create(
            {
              name: 'User',
              description: 'Default role for users',
              grants: roleDefaults.userGrants
            },
            function (err, userRole) {
              if (err) return done(err)
              SettingsSchema.getSetting('role:user:default', function (err, roleUserDefault) {
                if (err) return done(err)
                if (roleUserDefault) return done()

                SettingsSchema.create(
                  {
                    name: 'role:user:default',
                    value: userRole._id
                  },
                  done
                )
              })
            }
          )
        })
      },
      function (done) {
        roleSchemaModel.getRoleByName('Support', function (err, role) {
          if (err) return done(err)
          if (role) {
            return done()
            // role.updateGrants(supportGrants, done);
          } else
            roleSchemaModel.create(
              {
                name: 'Support',
                description: 'Default role for agents',
                grants: roleDefaults.supportGrants
              },
              done
            )
        })
      },
      function (done) {
        roleSchemaModel.getRoleByName('Admin', function (err, role) {
          if (err) return done(err)
          if (role) return done()
          // role.updateGrants(adminGrants, done);
          else {
            roleSchemaModel.create(
              {
                name: 'Admin',
                description: 'Default role for admins',
                grants: roleDefaults.adminGrants
              },
              done
            )
          }
        })
      },
      function (done) {
        var roleOrderSchemaModel = roleOrderSchema
        roleOrderSchemaModel.getOrder(function (err, roleOrder) {
          if (err) return done(err)
          if (roleOrder) return done()

          roleSchemaModel.getRoles(function (err, roles) {
            if (err) return done(err)

            var roleOrder = []
            roleOrder.push(_.find(roles, { name: 'Admin' })._id)
            roleOrder.push(_.find(roles, { name: 'Support' })._id)
            roleOrder.push(_.find(roles, { name: 'User' })._id)

            roleOrderSchema.create(
              {
                order: roleOrder
              },
              done
            )
          })
        })
      }
    ],
    function (err) {
      if (err) throw err

      return callback()
    }
  )
}

function defaultUserRole (callback) {
  var roleOrderSchemaModel = roleOrderSchema
  roleOrderSchemaModel.getOrderLean(function (err, roleOrder) {
    if (err) return callback(err)
    if (!roleOrder) return callback()

    SettingsSchema.getSetting('role:user:default', function (err, roleDefault) {
      if (err) return callback(err)
      if (roleDefault) return callback()

      var lastId = _.last(roleOrder.order)
      SettingsSchema.create(
        {
          name: 'role:user:default',
          value: lastId
        },
        callback
      )
    })
  })
}

function createDirectories (callback) {
  async.parallel(
    [
      function (done) {
        fs.ensureDir(path.join(__dirname, '../../backups'), done)
      },
      function (done) {
        fs.ensureDir(path.join(__dirname, '../../restores'), done)
      }
    ],
    callback
  )
}

function downloadWin32MongoDBTools (callback) {
  var httpModule = http
  var osModule = os
  var semverModule = semver
  var dbVersion = database.db.version || '5.0.6'
  var fileVersion = semverModule.major(dbVersion) + '.' + semverModule.minor(dbVersion)

  if (osModule.platform() === 'win32') {
    winston.debug('MongoDB version ' + fileVersion + ' detected.')
    var filename = 'mongodb-tools.' + fileVersion + '-win32x64.zip'
    var savePath = path.join(__dirname, '../backup/bin/win32/')
    fs.ensureDirSync(savePath)
    if (
      !fs.existsSync(path.join(savePath, 'mongodump.exe')) ||
      !fs.existsSync(path.join(savePath, 'mongorestore.exe'))
      // !fs.existsSync(path.join(savePath, 'libeay32.dll')) ||
      // !fs.existsSync(path.join(savePath, 'ssleay32.dll'))
    ) {
      winston.debug('Windows platform detected. Downloading MongoDB Tools [' + filename + ']')
      fs.emptyDirSync(savePath)
      var unzipperModule = unzipper
      var file = fs.createWriteStream(path.join(savePath, filename))
      http
        .get('http://storage.trudesk.io/tools/' + filename, function (response) {
          response.pipe(file)
          file.on('finish', function () {
            file.close()
          })
          file.on('close', function () {
            fs.createReadStream(path.join(savePath, filename))
              .pipe(unzipperModule.Extract({ path: savePath }))
              .on('close', function () {
                fs.unlink(path.join(savePath, filename), callback)
              })
          })
        })
        .on('error', function (err) {
          fs.unlink(path.join(savePath, filename))
          winston.debug(err)
          return callback()
        })
    } else {
      return callback()
    }
  } else {
    return callback()
  }
}

function timezoneDefault (callback) {
  SettingsSchema.getSettingByName('gen:timezone', function (err, setting) {
    if (err) {
      winston.warn(err)
      if (_.isFunction(callback)) return callback(err)
      return false
    }

    if (!setting) {
      var defaultTimezone = new SettingsSchema({
        name: 'gen:timezone',
        value: 'America/New_York'
      })

      defaultTimezone.save(function (err, setting) {
        if (err) {
          winston.warn(err)
          if (_.isFunction(callback)) return callback(err)
        }

        winston.debug('Timezone set to ' + setting.value)
        dayjs.tz.setDefault(setting.value)

        global.timezone = setting.value

        if (_.isFunction(callback)) return callback()
      })
    } else {
      winston.debug('Timezone set to ' + setting.value)
      dayjs.tz.setDefault(setting.value)

      global.timezone = setting.value

      if (_.isFunction(callback)) return callback()
    }
  })
}

function showTourSettingDefault (callback) {
  SettingsSchema.getSettingByName('showTour:enable', function (err, setting) {
    if (err) {
      winston.warn(err)
      if (_.isFunction(callback)) return callback(err)
      return false
    }

    if (!setting) {
      var defaultShowTour = new SettingsSchema({
        name: 'showTour:enable',
        value: 0
      })

      defaultShowTour.save(function (err) {
        if (err) {
          winston.warn(err)
          if (_.isFunction(callback)) return callback(err)
        }

        if (_.isFunction(callback)) return callback()
      })
    } else if (_.isFunction(callback)) return callback()
  })
}

function ticketTypeSettingDefault (callback) {
  SettingsSchema.getSettingByName('ticket:type:default', function (err, setting) {
    if (err) {
      winston.warn(err)
      if (_.isFunction(callback)) {
        return callback(err)
      }
    }

    if (!setting) {
      var ticketTypeSchemaModel = ticketTypeSchema
      ticketTypeSchema.getTypes(function (err, types) {
        if (err) {
          winston.warn(err)
          if (_.isFunction(callback)) {
            return callback(err)
          }
          return false
        }

        var type = _.first(types)
        if (!type) return callback('No Types Defined!')
        if (!_.isObject(type) || _.isUndefined(type._id)) return callback('Invalid Type. Skipping.')

        // Save default ticket type
        var defaultTicketType = new SettingsSchema({
          name: 'ticket:type:default',
          value: type._id
        })

        defaultTicketType.save(function (err) {
          if (err) {
            winston.warn(err)
            if (_.isFunction(callback)) {
              return callback(err)
            }
          }

          if (_.isFunction(callback)) {
            return callback()
          }
        })
      })
    } else {
      if (_.isFunction(callback)) {
        return callback()
      }
    }
  })
}

/**
 * Sets default status of tickets during creation.
 * @param {Parameters<async.AsyncFunction>[0]} callback 
 */
function ticketStatusSettingDefault(callback) {
  const statusSettingName = 'ticket:status:default'
  callback = _.isFunction(callback) ? callback : () => {}
  SettingsSchema.getSettingByName(statusSettingName, function(err, setting) { 
    if (err) {
      winston.warn(err)
      return callback(err)
    }

    if (setting) {
      return callback()
    }

    const ticketStatusSchemaModel = ticketStatusSchema
    ticketStatusSchemaModel.getStatus(function(err, statuses) {
      if (err) {
        winston.warn(err)
        return callback(err)
      }

      const status = _.first(statuses)
      if (!status) {
        return callback("No Statuses Defined!")
      }

      if (!_.isObject(status) || _.isUndefined(status._id)) {
        return callback('Invalid Status. Skipping.')
      }

      const defaultTicketStatus = new SettingsSchema({
        name: statusSettingName,
        value: status._id
      })

      defaultTicketStatus.save(function(err) {
        if (err) {
          winston.warn(err)
            return callback(err)
        }
        return callback()
      })
    })
  })
}

function ticketPriorityDefaults (callback) {
  var priorities = []

  var normal = new PrioritySchema({
    name: 'Normal',
    migrationNum: 1,
    default: true
  })

  var urgent = new PrioritySchema({
    name: 'Urgent',
    migrationNum: 2,
    htmlColor: '#8e24aa',
    default: true
  })

  var critical = new PrioritySchema({
    name: 'Critical',
    migrationNum: 3,
    htmlColor: '#e65100',
    default: true
  })

  priorities.push(normal)
  priorities.push(urgent)
  priorities.push(critical)
  async.each(
    priorities,
    function (item, next) {
      PrioritySchema.findOne({ migrationNum: item.migrationNum }, function (err, priority) {
        if (!err && (_.isUndefined(priority) || _.isNull(priority))) {
          return item.save(next)
        }

        return next(err)
      })
    },
    callback
  )
}

function normalizeTags (callback) {
  var tagSchemaModel = tagSchema
  tagSchemaModel.find({}, function (err, tags) {
    if (err) return callback(err)
    async.each(
      tags,
      function (tag, next) {
        tag.save(next)
      },
      callback
    )
  })
}

function checkPriorities (callback) {
  var ticketSchemaModel = ticketSchema
  var migrateP1 = false
  var migrateP2 = false
  var migrateP3 = false

  async.parallel(
    [
      function (done) {
        ticketSchemaModel.collection.countDocuments({ priority: 1 }).then(function (count) {
          migrateP1 = count > 0
          return done()
        })
      },
      function (done) {
        ticketSchemaModel.collection.countDocuments({ priority: 2 }).then(function (count) {
          migrateP2 = count > 0
          return done()
        })
      },
      function (done) {
        ticketSchemaModel.collection.countDocuments({ priority: 3 }).then(function (count) {
          migrateP3 = count > 0
          return done()
        })
      }
    ],
    function () {
      async.parallel(
        [
          function (done) {
            if (!migrateP1) return done()
            PrioritySchema.getByMigrationNum(1, function (err, normal) {
              if (!err) {
                winston.debug('Converting Priority: Normal')
                ticketSchemaModel.collection
                  .updateMany({ priority: 1 }, { $set: { priority: normal._id } })
                  .then(function (res) {
                    if (res && res.result) {
                      if (res.result.ok === 1) {
                        return done()
                      }

                      winston.warn(res.message)
                      return done(res.message)
                    }
                  })
              } else {
                winston.warn(err.message)
                return done()
              }
            })
          },
          function (done) {
            if (!migrateP2) return done()
            PrioritySchema.getByMigrationNum(2, function (err, urgent) {
              if (!err) {
                winston.debug('Converting Priority: Urgent')
                ticketSchemaModel.collection
                  .updateMany({ priority: 2 }, { $set: { priority: urgent._id } })
                  .then(function (res) {
                    if (res && res.result) {
                      if (res.result.ok === 1) {
                        return done()
                      }

                      winston.warn(res.message)
                      return done(res.message)
                    }
                  })
              } else {
                winston.warn(err.message)
                return done()
              }
            })
          },
          function (done) {
            if (!migrateP3) return done()
            PrioritySchema.getByMigrationNum(3, function (err, critical) {
              if (!err) {
                winston.debug('Converting Priority: Critical')
                ticketSchemaModel.collection
                  .updateMany({ priority: 3 }, { $set: { priority: critical._id } })
                  .then(function (res) {
                    if (res && res.result) {
                      if (res.result.ok === 1) {
                        return done()
                      }

                      winston.warn(res.message)
                      return done(res.message)
                    }
                  })
              } else {
                winston.warn(err.message)
                return done()
              }
            })
          }
        ],
        callback
      )
    }
  )
}

function addedDefaultPrioritiesToTicketTypes (callback) {
  async.waterfall(
    [
      function (next) {
        PrioritySchema.find({ default: true })
          .then(function (results) {
            return next(null, results)
          })
          .catch(next)
      },
      function (priorities, next) {
        priorities = _.sortBy(priorities, 'migrationNum')
        var ticketTypeSchemaModel = ticketTypeSchema
        ticketTypeSchema.getTypes(function (err, types) {
          if (err) return next(err)

          async.each(
            types,
            function (type, done) {
              var prioritiesToAdd = []
              if (!type.priorities || type.priorities.length < 1) {
                type.priorities = []
                prioritiesToAdd = _.map(priorities, '_id')
              }

              if (prioritiesToAdd.length < 1) {
                return done()
              }

              type.priorities = _.concat(type.priorities, prioritiesToAdd)
              type.save(done)
            },
            function () {
              next(null)
            }
          )
        })
      }
    ],
    callback
  )
}

function mailTemplates (callback) {
  const newTicket = newTicketModule
  const passwordReset = passwordResetModule
  var templateSchemaModel = templateSchema
  async.parallel(
    [
      function (done) {
        templateSchemaModel.findOne({ name: newTicket.name }, function (err, templates) {
          if (err) return done(err)
          if (!templates || templates.length < 1) {
            return templateSchemaModel.create(newTicket, done)
          }

          return done()
        })
      },
      function (done) {
        templateSchemaModel.findOne({ name: passwordReset.name }, function (err, templates) {
          if (err) return done(err)
          if (!templates || templates.length < 1) {
            return templateSchemaModel.create(passwordReset, done)
          }

          return done()
        })
      }
    ],
    callback
  )
}

function elasticSearchConfToDB (callback) {
  const nconfModule = nconf
  const elasticsearch = {
    enable: nconfModule.get('elasticsearch:enable') || false,
    host: nconfModule.get('elasticsearch:host') || "",
    port: nconfModule.get('elasticsearch:port') || 9200
  }

  nconfModule.set('elasticsearch', {})

  async.parallel(
    [
      function (done) {
        nconfModule.save(done)
      },
      function (done) {
        // if (!elasticsearch.enable) return done()
        SettingsSchema.getSettingByName('es:enable', function (err, setting) {
          if (err) return done(err)
          if (!setting) {
            SettingsSchema.create(
              {
                name: 'es:enable',
                value: elasticsearch.enable
              },
              done
            )
          } else done()
        })
      },
      function (done) {
        if (!elasticsearch.host) elasticsearch.host = 'localhost'
        SettingsSchema.getSettingByName('es:host', function (err, setting) {
          if (err) return done(err)
          if (!setting) {
            SettingsSchema.create(
              {
                name: 'es:host',
                value: elasticsearch.host
              },
              done
            )
          } else done()
        })
      },
      function (done) {
        if (!elasticsearch.port) return done()
        SettingsSchema.getSettingByName('es:port', function (err, setting) {
          if (err) return done(err)
          if (!setting) {
            SettingsSchema.create(
              {
                name: 'es:port',
                value: elasticsearch.port
              },
              done
            )
          } else done()
        })
      }
    ],
    callback
  )
}

function installationID (callback) {
  const ChanceModule = Chance
  const chance = new ChanceModule()
  SettingsSchema.getSettingByName('gen:installid', function (err, setting) {
    if (err) return callback(err)
    if (!setting) {
      SettingsSchema.create(
        {
          name: 'gen:installid',
          value: chance.guid()
        },
        callback
      )
    } else {
      return callback()
    }
  })
}

function maintenanceModeDefault (callback) {
  SettingsSchema.getSettingByName('maintenanceMode:enable', function (err, setting) {
    if (err) return callback(err)
    if (!setting) {
      SettingsSchema.create(
        {
          name: 'maintenanceMode:enable',
          value: false
        },
        callback
      )
    } else {
      return callback()
    }
  })
}

settingsDefaults.init = function (callback) {
  winston.debug('Checking Default Settings...')
  async.series(
    [
      function (done) {
        return createDirectories(done)
      },
      function (done) {
        return downloadWin32MongoDBTools(done)
      },
      function (done) {
        return rolesDefault(done)
      },
      function (done) {
        return defaultUserRole(done)
      },
      function (done) {
        return timezoneDefault(done)
      },
      function (done) {
        return ticketTypeSettingDefault(done)
      },
      function (done) {
        return ticketPriorityDefaults(done)
      },
      function (done) {
        return ticketStatusSettingDefault(done)
      },
      function (done) {
        return addedDefaultPrioritiesToTicketTypes(done)
      },
      function (done) {
        return checkPriorities(done)
      },
      function (done) {
        return normalizeTags(done)
      },
      function (done) {
        return mailTemplates(done)
      },
      function (done) {
        return elasticSearchConfToDB(done)
      },
      function (done) {
        return maintenanceModeDefault(done)
      },
      function (done) {
        return installationID(done)
      }
    ],
    function (err) {
      if (err) winston.warn(err)
      if (_.isFunction(callback)) return callback()
    }
  )
}

export default settingsDefaults

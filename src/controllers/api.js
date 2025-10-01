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

// Sub APIs
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const apiTicketsV1 = require('./api/v1/tickets').default
const apiTagsV1 = require('./api/v1/tags').default
const apiNoticesV1 = require('./api/v1/notices').default
const apiUsersV1 = require('./api/v1/users').default
const apiMessagesV1 = require('./api/v1/messages').default
const apiGroupsV1 = require('./api/v1/groups').default
const apiReportsV1 = require('./api/v1/reports').default
const apiSettingsV1 = require('./api/v1/settings').default
const apiPluginsV1 = require('./api/v1/plugins').default

const apiController = {}

apiController.index = function (req, res) {
  return res.json({ supported: ['v1', 'v2'] })
}

apiController.v1 = {}
apiController.v1.common = require('./api/v1/common').default
apiController.v1.tickets = apiTicketsV1
apiController.v1.tags = apiTagsV1
apiController.v1.notices = apiNoticesV1
apiController.v1.users = apiUsersV1
apiController.v1.messages = apiMessagesV1
apiController.v1.groups = apiGroupsV1
apiController.v1.reports = apiReportsV1
apiController.v1.settings = apiSettingsV1
apiController.v1.plugins = apiPluginsV1
apiController.v1.roles = require('./api/v1/roles').default

apiController.v2 = {}
apiController.v2.common = require('./api/v2/common').default
apiController.v2.accounts = require('./api/v2/accounts').default
apiController.v2.tickets = require('./api/v2/tickets').default
apiController.v2.groups = require('./api/v2/groups').default
apiController.v2.teams = require('./api/v2/teams').default
apiController.v2.departments = require('./api/v2/departments').default
apiController.v2.notices = require('./api/v2/notices').default
apiController.v2.elasticsearch = require('./api/v2/elasticsearch').default
apiController.v2.mailer = require('./api/v2/mailer').default
apiController.v2.messages = require('./api/v2/messages').default

export default apiController

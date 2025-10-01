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
import apiTicketsV1 from './api/v1/tickets.js'
import apiTagsV1 from './api/v1/tags.js'
import apiNoticesV1 from './api/v1/notices.js'
import apiUsersV1 from './api/v1/users.js'
import apiMessagesV1 from './api/v1/messages.js'
import apiGroupsV1 from './api/v1/groups.js'
import apiReportsV1 from './api/v1/reports.js'
import apiSettingsV1 from './api/v1/settings.js'
import apiPluginsV1 from './api/v1/plugins.js'

const apiController = {}

apiController.index = function (req, res) {
  return res.json({ supported: ['v1', 'v2'] })
}

import apiCommonV1 from './api/v1/common.js'
import apiRolesV1 from './api/v1/roles.js'
import apiCommonV2 from './api/v2/common.js'
import apiAccountsV2 from './api/v2/accounts.js'
import apiTicketsV2 from './api/v2/tickets.js'
import apiGroupsV2 from './api/v2/groups.js'
import apiTeamsV2 from './api/v2/teams.js'
import apiDepartmentsV2 from './api/v2/departments.js'
import apiNoticesV2 from './api/v2/notices.js'
import apiElasticsearchV2 from './api/v2/elasticsearch.js'
import apiMailerV2 from './api/v2/mailer.js'
import apiMessagesV2 from './api/v2/messages.js'

apiController.v1 = {}
apiController.v1.common = apiCommonV1
apiController.v1.tickets = apiTicketsV1
apiController.v1.tags = apiTagsV1
apiController.v1.notices = apiNoticesV1
apiController.v1.users = apiUsersV1
apiController.v1.messages = apiMessagesV1
apiController.v1.groups = apiGroupsV1
apiController.v1.reports = apiReportsV1
apiController.v1.settings = apiSettingsV1
apiController.v1.plugins = apiPluginsV1
apiController.v1.roles = apiRolesV1

apiController.v2 = {}
apiController.v2.common = apiCommonV2
apiController.v2.accounts = apiAccountsV2
apiController.v2.tickets = apiTicketsV2
apiController.v2.groups = apiGroupsV2
apiController.v2.teams = apiTeamsV2
apiController.v2.departments = apiDepartmentsV2
apiController.v2.notices = apiNoticesV2
apiController.v2.elasticsearch = apiElasticsearchV2
apiController.v2.mailer = apiMailerV2
apiController.v2.messages = apiMessagesV2

export default apiController

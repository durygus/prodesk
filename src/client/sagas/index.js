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
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import { all } from 'redux-saga/effects'
import CommonSaga from './common/index.js'
import DashboardSaga from './dashboard/index.js'
import SettingsSaga from './settings/index.js'
import TicketSaga from './tickets/index.js'
import AccountSaga from './accounts/index.js'
import GroupSaga from './groups/index.js'
import TeamSaga from './teams/index.js'
import DepartmentSaga from './departments/index.js'
import NoticeSage from './notices/index.js'
import SearchSaga from './search/index.js'
import MessagesSaga from './messages/index.js'
import ReportsSaga from './reports/index.js'

export default function * IndexSagas () {
  yield all([
    CommonSaga(),
    DashboardSaga(),
    TicketSaga(),
    SettingsSaga(),
    AccountSaga(),
    GroupSaga(),
    TeamSaga(),
    DepartmentSaga(),
    NoticeSage(),
    SearchSaga(),
    MessagesSaga(),
    ReportsSaga()
  ])
}

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

import { combineReducers } from 'redux'

import shared from './shared/index.js'
import common from './shared/common.js'
import modal from './shared/modalReducer.js'
import sidebar from './sidebarReducer.js'
import settings from './settings/index.js'
import dashboardState from './dashboardReducer.js'
import ticketsState from './ticketsReducer.js'
import tagsSettings from './tagsReducer.js'
import accountsState from './accountsReducer.js'
import groupsState from './groupsReducer.js'
import teamsState from './teamsReducer.js'
import departmentsState from './departmentsReducer.js'
import noticesState from './noticesReducer.js'
import searchState from './searchReducer.js'
import messagesState from './messagesReducer.js'

// const IndexReducer = (state = {}, action) => {
//   return {
//     shared: shared(state.shared, action),
//     common: common(state.common, action),
//     modal: modal(state.modal, action),
//     sidebar: sidebar(state.sidebar, action),
//     ticketsState: ticketsState(state.ticketsState, { ...action, sessionUser: shared.sessionUser }),
//     accountsState: accountsState(state.accountsState, action),
//     groupsState: groupsState(state.groupsState, action),
//     teamsState: teamsState(state.teamsState, action),
//     departmentsState: departmentsState(state.departmentsState, action),
//     tagsSettings: tagsSettings(state.tagsSettings, action),
//     settings: settings(state.settings, action)
//   }
// }

const IndexReducer = combineReducers({
  shared,
  common,
  searchState,
  modal,
  sidebar,
  dashboardState,
  ticketsState,
  accountsState,
  groupsState,
  teamsState,
  departmentsState,
  noticesState,
  settings,
  tagsSettings,
  messagesState
})

export default IndexReducer

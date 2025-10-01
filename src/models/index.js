import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const User = require('./user').default
const Ticket = require('./ticket').default
const TicketType = require('./tickettype').default
const Priority = require('./ticketpriority').default
const Status = require('./ticketStatus').default
const TicketTags = require('./tag').default
const Role = require('./role').default
const Session = require('./session').default
const Setting = require('./setting').default
const Group = require('./group').default
const Team = require('./team').default
const Department = require('./department').default
const Message = require('./chat/message').default
const Conversation = require('./chat/conversation').default


export default {
  User,
  Ticket,
  TicketType,
  Priority,
  TicketTags,
  Role,
  Session,
  Setting,
  Group,
  Team,
  Department,
  Message,
  Conversation,
  Status
}

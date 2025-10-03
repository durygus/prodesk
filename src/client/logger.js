// Клиентская заглушка для logger
// Заменяет серверный logger на клиентскую версию

const logger = {
  debug: (message) => console.debug(message),
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
  log: (message) => console.log(message)
}

export default logger

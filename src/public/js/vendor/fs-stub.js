// Заглушка для fs модуля в браузере
const fs = {
  readFileSync: () => '',
  writeFileSync: () => {},
  existsSync: () => false,
  mkdirSync: () => {},
  readdirSync: () => [],
  statSync: () => ({ isFile: () => false, isDirectory: () => false }),
  unlinkSync: () => {},
  rmdirSync: () => {},
  copyFileSync: () => {},
  renameSync: () => {}
}

export default fs

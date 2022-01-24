import { copy } from 'fs-extra'
import { join } from 'path'

const resolvePath = (p: string) => {
  return join(__dirname, p)
}
async function mpBuild() {
  await copy(resolvePath('../dist/index.js'), resolvePath('../dist/miniprogram/index.js'))
  await copy(resolvePath('../dist/index.js.map'), resolvePath('../dist/miniprogram/index.js.map'))
}
mpBuild()

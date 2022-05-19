export function sleep(ms?: number) {
  if (typeof ms === 'number') {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
  return Promise.resolve()
}

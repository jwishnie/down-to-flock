export const asyncTimeout = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const safeParseInt = function (val: any) {
  const maybeInt = parseInt(val)
  return isNaN(maybeInt) ? undefined : maybeInt
}

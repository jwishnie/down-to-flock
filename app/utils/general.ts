export const safeParseInt = function (val: any) {
  const maybeInt = parseInt(val)
  return isNaN(maybeInt) ? undefined : maybeInt
}

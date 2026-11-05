export const safeParseInt = function (val: any) {
  const maybeInt = parseInt(val)
  return isNaN(maybeInt) ? undefined : maybeInt
}

export const sample = function <T>(items: readonly T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)]
}

// Two distinct integers in [min, max], uniformly. Needs max > min.
export const sampleTwoInts = function (min: number, max: number) {
  const span = max - min + 1
  const first = Math.floor(Math.random() * span)
  // pick from the span - 1 remaining values, skipping over `first`
  const second = Math.floor(Math.random() * (span - 1))
  return [min + first, min + (second >= first ? second + 1 : second)] as const
}

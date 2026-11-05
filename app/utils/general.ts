export const safeParseInt = function (val: any) {
  const maybeInt = parseInt(val)
  return isNaN(maybeInt) ? undefined : maybeInt
}

// One random item, or with `count`, that many distinct items (fewer if there aren't enough).
export function sample<T>(items: readonly T[]): T | undefined
export function sample<T>(items: readonly T[], count: number): T[]
export function sample<T>(items: readonly T[], count?: number): T | undefined | T[] {
  if (count === undefined) return items[Math.floor(Math.random() * items.length)]
  const pool = [...items]
  const picked: T[] = []
  while (picked.length < count && pool.length) {
    // removing each pick from the pool is what keeps them distinct
    picked.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return picked
}

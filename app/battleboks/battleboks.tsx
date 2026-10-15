import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import type { ChickMeta } from '~/utils/data'

export type Side = 'l' | 'r'

// The <button> around each image carries cursor-pointer too: Tailwind v4 gives
// buttons the default arrow. aspect-square reserves the space before the image
// loads (all chix are square; object-cover absorbs any that are slightly off).
const bokClass =
  'p-1 sm:p-0 w-svw sm:w-full aspect-square object-cover cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

// The vote goes out when the loser's fade-out ends (~300ms); this is the backstop
// in case that transition event never arrives
const FADE_FALLBACK_MS = 1000

// Selection animations. Transitions live in these classes, so when a new battle
// swaps in and they're removed, everything snaps back instead of animating.
const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
const rslideIn = 'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

// Resolves once the image is loaded and decoded, or failed: a broken image
// shouldn't block the next battle.
const preload = (src: string) => {
  const img = new Image()
  img.src = src
  return img.decode().catch(() => {})
}

export function BattleBoks({
  adjective,
  left,
  right,
  onSelected,
}: {
  adjective: string
  left: ChickMeta
  right: ChickMeta
  onSelected: (side: Side) => void
}) {
  // The battle on screen. Lags behind props until the next battle's images load.
  const [shown, setShown] = useState({ adjective, left, right })
  const [selected, setSelected] = useState<Side>()

  const isLoading =
    shown.adjective !== adjective ||
    shown.left.src !== left.src ||
    shown.right.src !== right.src

  // Props back on the shown battle after a vote (quick back/forward): nothing will
  // swap in, so clear the selection here. Adjusted during render rather than in an
  // effect, so there's no extra render with the stale selection.
  const battleKey = `${adjective}|${left.src}|${right.src}`
  const [prevBattleKey, setPrevBattleKey] = useState(battleKey)
  if (battleKey !== prevBattleKey) {
    setPrevBattleKey(battleKey)
    if (!isLoading) setSelected(undefined)
  }

  useEffect(() => {
    if (!isLoading) return

    // Cancelled if props change again first, so a slow, stale preload can't
    // swap in the wrong battle.
    let cancelled = false
    Promise.all([left.src, right.src].map(preload)).then(() => {
      if (cancelled) return
      // One update: clearing the selection in a later effect would paint a frame
      // of the new chix with the old slide/fade classes
      setShown({ adjective, left, right })
      setSelected(undefined)
    })
    return () => {
      cancelled = true
    }
  }, [isLoading, adjective, left, right])

  // The vote waiting on the loser's fade. Resolving sends it; resolving again is a
  // no-op, so the fade and the fallback timer can't both vote.
  const pendingVote = useRef<{ resolve: () => void; timer: number }>(undefined)

  // Unmounted mid-fade (navigated away): drop the vote rather than let the
  // fallback timer submit it from a page the user has left
  useEffect(() => () => clearTimeout(pendingVote.current?.timer), [])

  // Ignore clicks while a vote is pending or the next battle is loading
  const select = (side: Side) => {
    if (selected || isLoading) return
    setSelected(side)
    const { promise, resolve } = Promise.withResolvers<void>()
    const timer = window.setTimeout(resolve, FADE_FALLBACK_MS)
    pendingVote.current = { resolve, timer }
    promise.then(() => {
      clearTimeout(timer)
      onSelected(side)
    })
  }

  // The loser's fade runs at every breakpoint, unlike the winner's slide (no left
  // slide on narrow screens), so its end is what releases the vote. Ignores
  // transitions bubbling up from the img (hover:scale) and other properties.
  const onFadeOutDone =
    (fadesWhen: Side) => (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== 'opacity') return
      if (selected === fadesWhen) pendingVote.current?.resolve()
    }

  return (
    <div>
      {/* Key change remounts the header, so it fades in with each battle */}
      <div
        key={`header-${shown.adjective}-${shown.left.src}-${shown.right.src}`}
        className="header flex items-center justify-center pt-8 animate-fade-in"
      >
        <div className="text-center">Which is more {shown.adjective}?</div>
      </div>

      <main className="flex flex-wrap justify-center gap-x-4 pt-8 pb-4">
        <div
          className={`flex-none sm:flex-1 ${
            selected === 'l' ? lslideIn : selected === 'r' ? fadeOut : ''
          }`}
          onTransitionEnd={onFadeOutDone('r')}
          onTransitionCancel={onFadeOutDone('r')}
        >
          {/* Key change on wrapper forces remount -> triggers animation */}
          <div key={shown.left.src} className="animate-fade-in">
            <button
              type="button"
              className="block w-full cursor-pointer"
              onClick={() => select('l')}
            >
              <img
                src={shown.left.src}
                alt={`Vote for the left chicken as more ${shown.adjective}`}
                className={bokClass}
              />
            </button>
          </div>
        </div>

        <div
          className={`flex-none sm:flex-1 ${
            selected === 'r' ? rslideIn : selected === 'l' ? fadeOut : ''
          }`}
          onTransitionEnd={onFadeOutDone('l')}
          onTransitionCancel={onFadeOutDone('l')}
        >
          <div key={shown.right.src} className="animate-fade-in">
            <button
              type="button"
              className="block w-full cursor-pointer"
              onClick={() => select('r')}
            >
              <img
                src={shown.right.src}
                alt={`Vote for the right chicken as more ${shown.adjective}`}
                className={bokClass}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

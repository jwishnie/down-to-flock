import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import type { ChickMeta } from '~/utils/data'

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
  onSelected: (selected: boolean) => void
}) {
  // The battle on screen. Lags behind props until the next battle's images load.
  const [shown, setShown] = useState({ adjective, left, right })
  const [selected, setSelected] = useState(undefined as boolean | undefined)

  const isLoading =
    shown.adjective !== adjective ||
    shown.left.src !== left.src ||
    shown.right.src !== right.src

  useEffect(() => {
    // Mount, or props back on the shown battle (quick back/forward)
    if (!isLoading) {
      setSelected(undefined)
      return
    }

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
    // srcs rather than the objects, so only a real change of chix re-runs this
  }, [isLoading, adjective, left.src, right.src])

  // Resolves the pending vote's fade; set per click, called by onFadeOutDone
  const fadeDone = useRef<() => void>(undefined)

  // Ignore clicks while a vote is pending or the next battle is loading
  const select = (v: boolean) => {
    if (selected !== undefined || isLoading) return
    setSelected(v)
    const { promise, resolve } = Promise.withResolvers<void>()
    fadeDone.current = resolve
    // Whichever comes first; race settles once, so the vote can't fire twice
    Promise.race([
      promise,
      new Promise((r) => setTimeout(r, FADE_FALLBACK_MS)),
    ]).then(() => onSelected(v))
  }

  // The loser's fade runs at every breakpoint, unlike the winner's slide (no left
  // slide on narrow screens), so its end is what releases the vote. Ignores
  // transitions bubbling up from the img (hover:scale) and other properties.
  const onFadeOutDone =
    (fadesWhen: boolean) => (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== 'opacity') return
      if (selected === fadesWhen) fadeDone.current?.()
    }

  const lselected = selected === true
  const rselected = selected === false

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
            lselected ? lslideIn : rselected ? fadeOut : ''
          }`}
          onTransitionEnd={onFadeOutDone(false)}
          onTransitionCancel={onFadeOutDone(false)}
        >
          {/* Key change on wrapper forces remount -> triggers animation */}
          <div key={shown.left.src} className="animate-fade-in">
            <button
              type="button"
              className="block w-full cursor-pointer"
              onClick={() => select(true)}
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
            rselected ? rslideIn : lselected ? fadeOut : ''
          }`}
          onTransitionEnd={onFadeOutDone(true)}
          onTransitionCancel={onFadeOutDone(true)}
        >
          <div key={shown.right.src} className="animate-fade-in">
            <button
              type="button"
              className="block w-full cursor-pointer"
              onClick={() => select(false)}
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

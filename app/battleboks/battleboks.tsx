import { useEffect, useRef, useState } from 'react'
import type { ChickMeta } from '~/utils/data'

const bokClass =
  'p-1 sm:p-0 w-svw sm:w-full cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

const ANIMATION_DELAY = 425

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
    // Covers mount, the swap below, and props returning to the shown battle
    // (quick back/forward): in each case the shown battle is fresh and unvoted.
    if (!isLoading) {
      setSelected(undefined)
      return
    }

    // Cancelled if props change again first, so a slow, stale preload can't
    // swap in the wrong battle.
    let cancelled = false
    Promise.all([left.src, right.src].map(preload)).then(() => {
      if (!cancelled) setShown({ adjective, left, right })
    })
    return () => {
      cancelled = true
    }
    // srcs rather than the objects, so only a real change of chix re-runs this
  }, [isLoading, adjective, left.src, right.src])

  const onSelectedRef = useRef(onSelected)
  useEffect(() => { onSelectedRef.current = onSelected }, [onSelected])

  useEffect(() => {
    if (typeof selected === 'undefined') return
    const id = setTimeout(() => { onSelectedRef.current(selected) }, ANIMATION_DELAY)
    return () => clearTimeout(id)
  }, [selected])

  // Ignore clicks while a vote is pending or the next battle is loading
  const select = (v: boolean) => {
    if (selected === undefined && !isLoading) setSelected(v)
  }

  const lselected = selected === true
  const rselected = selected === false
  
  // Outgoing animations
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const ending = isLoading ? 'transition-opacity opacity-0 ease-in duration-500' : ''

  const rslideIn = 'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
  const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

  return (
    <div>
      
      {/* Header updates with the content */}
      <div 
        key={`header-${shown.adjective}`} 
        className={`header flex items-center justify-center pt-8 animate-fade-in ${ending}`}
      >
        <div className="text-center">Which is more {shown.adjective}?</div>
      </div>

      <main className="flex flex-wrap justify-center gap-x-4 pt-8 pb-4">
        {/* Left Container */}
        <div
          className={`flex-none sm:flex-1 ${
             lselected ? lslideIn : rselected ? fadeOut : ''
          } ${ending}`}
        >
          {/* Key change on wrapper forces remount -> triggers animation */}
          <div key={shown.left.src} className="animate-fade-in">
            <img
              src={shown.left.src}
              className={`${bokClass}`}
              onClick={() => select(true)}
            />
          </div>
        </div>

        {/* Right Container */}
        <div
          className={`flex-none sm:flex-1 ${
            rselected ? rslideIn : lselected ? fadeOut : ''
          } ${ending}`}
        >
          <div key={shown.right.src} className="animate-fade-in">
             <img
              src={shown.right.src}
              className={`${bokClass}`}
              onClick={() => select(false)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

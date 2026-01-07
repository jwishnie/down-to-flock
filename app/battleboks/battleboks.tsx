import { useEffect, useState } from 'react'
import type { ChickMeta } from '~/utils/data'

const bokClass =
  'p-1 sm:p-0 w-svw sm:w-full cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

const ANIMATION_DELAY = 425

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
  // State to hold valid loaded "current" data (buffers content changes)
  const [currentAdjective, setCurrentAdjective] = useState(adjective)
  const [currentLeft, setCurrentLeft] = useState(left)
  const [currentRight, setCurrentRight] = useState(right)
  
  // State for user interaction
  const [selected, setSelected] = useState(undefined as boolean | undefined)
  const [isPreloading, setIsPreloading] = useState(false)

  // Preload next images and only update "current" state when ready
  useEffect(() => {
    if (left.src !== currentLeft.src || right.src !== currentRight.src) {
      setIsPreloading(true)
      const img1 = new Image()
      const img2 = new Image()
      let loaded = 0
      const onAllLoaded = () => {
        loaded++
        if (loaded === 2) {
          // Both ready: Swap content and reset selection
          setCurrentAdjective(adjective)
          setCurrentLeft(left)
          setCurrentRight(right)
          setSelected(undefined)
          setIsPreloading(false)
        }
      }

      img1.onload = onAllLoaded
      img1.onerror = onAllLoaded
      img2.onload = onAllLoaded
      img2.onerror = onAllLoaded

      img1.src = left.src
      img2.src = right.src
    }
  }, [left, right, adjective])

  useEffect(() => {
    if (typeof selected != 'undefined') {
      setTimeout(() => {
        onSelected(selected)
      }, ANIMATION_DELAY)
    }
  }, [selected, onSelected])

  const lselected = selected === true
  const rselected = selected === false
  
  // Outgoing animations
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const ending = isPreloading ? 'transition-opacity opacity-0 ease-in duration-500' : ''

  const rslideIn = 'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
  const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

  return (
    <div>
      
      {/* Header updates with the content */}
      <div 
        key={`header-${currentAdjective}`} 
        className={`header flex items-center justify-center pt-8 animate-fade-in ${ending}`}
      >
        <div className="text-center">Which is more {currentAdjective}?</div>
      </div>

      <main className="flex flex-wrap justify-center gap-x-4 pt-8 pb-4">
        {/* Left Container */}
        <div
          className={`flex-none sm:flex-1 ${
             lselected ? lslideIn : rselected ? fadeOut : ''
          } ${ending}`}
        >
          {/* Key change on wrapper forces remount -> triggers animation */}
          <div key={currentLeft.src} className="animate-fade-in">
            <img
              src={currentLeft.src}
              className={`${bokClass}`}
              onClick={() => setSelected(true)}
            />
          </div>
        </div>

        {/* Right Container */}
        <div
          className={`flex-none sm:flex-1 ${
            rselected ? rslideIn : lselected ? fadeOut : ''
          } ${ending}`}
        >
          <div key={currentRight.src} className="animate-fade-in">
             <img
              src={currentRight.src}
              className={`${bokClass}`}
              onClick={() => setSelected(false)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

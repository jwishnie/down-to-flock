import { useEffect, useRef, useState } from 'react'
import type { ChickMeta } from '~/utils/data'
import { asyncTimeout } from '~/utils/general'

const bokClass =
  'p-1 sm:p-0 w-svw sm:w-full cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

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
  const [selected, setSelected] = useState(undefined as boolean | undefined)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof selected !== 'undefined') {
      const handleAnimationEnd = async () => {
        await asyncTimeout(140) // wait just a bit
        onSelected(selected)
      }

      const element = selected === true ? rightRef.current : leftRef.current
      if (element) {
        element.addEventListener('transitionend', handleAnimationEnd, {
          once: true,
        })
        return () => {
          element.removeEventListener('transitionend', handleAnimationEnd)
        }
      }
    }
  }, [selected, onSelected])

  const lselected = selected === true
  const rselected = selected === false
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const rslideIn =
    'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
  const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

  return (
    <div>
      <div className="header flex items-center justify-center pt-8">
        <div className="text-center">Which is more {adjective}?</div>
      </div>
      <main className="flex flex-wrap justify-center gap-x-4 pt-8 pb-4">
        <div
          ref={leftRef}
          className={`flex-none sm:flex-1  ${
            lselected ? lslideIn : rselected ? fadeOut : ''
          }`}
        >
          <img
            src={left.src}
            className={`${bokClass}`}
            onClick={() => setSelected(true)}
          />
        </div>
        <div
          ref={rightRef}
          className={`flex-none sm:flex-1 ${
            rselected ? rslideIn : lselected ? fadeOut : ''
          }`}
        >
          <img
            src={right.src}
            className={`${bokClass}`}
            onClick={() => setSelected(false)}
          />
        </div>
      </main>
    </div>
  )
}

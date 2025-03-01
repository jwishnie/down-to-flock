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
  const [selected, setSelected] = useState(undefined as boolean | undefined)
  useEffect(() => {
    if (typeof selected != 'undefined') {
      setTimeout(() => {
        onSelected(selected)
      }, ANIMATION_DELAY)
    }
  }, [selected])

  const lselected = selected === true
  const rselected = selected === false
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const rslideIn =
    'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
  const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

  return (
    <div>
      <div className="header flex items-center justify-center pt-8"><div className='text-center'>Which is more {adjective}?</div></div>
      <main className="flex flex-wrap justify-center gap-x-2 pt-8 px-2 pb-4">
        <div
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

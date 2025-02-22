import { type ListBlobResultBlob } from '@vercel/blob'
import { useRef, useState } from 'react'
import { useLocation, useSubmit } from 'react-router'
import type { OnVotedType } from '~/routes/home'

const bokClass =
  'p-1 sm:p-0 w-svw sm:w-full cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

const bokHolderClass = 'flex-none sm:flex-1'

export function BattleBoks({
  adjective,
  left,
  right,
  onVoted,
}: {
  adjective: string
  left: ListBlobResultBlob
  right: ListBlobResultBlob
  onVoted: OnVotedType
}) {
  const submit = useSubmit()
  const path = useLocation().pathname

  let [selectedChick, setSelectedChick] = useState(
    undefined as boolean | undefined
  )
  const leftVote = (vote: boolean | undefined) => vote === true
  const rightVote = (vote: boolean | undefined) => vote === false
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const rslideIn =
    'transition-transform max-sm:-translate-y-full sm:-translate-x-1/2'
  const lslideIn = 'sm:transition-transform sm:translate-x-1/2'

  const lChickBox = useRef<HTMLDivElement>(null)
  const rChickBox = useRef<HTMLDivElement>(null)

  console.dir({ lChickBox: lChickBox.current, rChickBox: rChickBox.current })

  // const vote = function () {
  //   console.dir({ vote: selectedChick })
  //   submit(
  //     { vote: selectedChick! },
  //     { action: `${path}`, method: 'post' }
  //   ).then(() => {
  //     setSelectedChick(undefined)
  //   })
  // }

  const vote = function (v: boolean) {
    // have to do here to make sure the ref is real
    lChickBox.current!.addEventListener('click', (e) =>
      console.log('Left animation end')
    )
    rChickBox.current!.addEventListener('animationend', (e) =>
      console.log('Rgiht animation end')
    )

    setSelectedChick(v)
  }
  return (
    <div>
      <div className="flex items-center justify-center pt-8">
        Which is more {adjective}?
      </div>
      <main className="flex flex-wrap justify-center gap-x-2 pt-16 px-2 pb-4">
        <div
          ref={lChickBox}
          className={`${bokHolderClass} ${
            leftVote(selectedChick)
              ? lslideIn
              : rightVote(selectedChick)
              ? fadeOut
              : ''
          }`}
        >
          <img
            src={left.url}
            className={`${bokClass}`}
            onClick={() => vote(true)}
          />
        </div>
        <div
          ref={rChickBox}
          className={`${bokHolderClass} ${
            rightVote(selectedChick)
              ? rslideIn
              : leftVote(selectedChick)
              ? fadeOut
              : ''
          }`}
        >
          <img
            src={right.url}
            className={`${bokClass}`}
            onClick={() => vote(false)}
          />
        </div>
      </main>
    </div>
  )
}

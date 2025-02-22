import { type ListBlobResultBlob } from '@vercel/blob'
import { useState } from 'react'
import { useLocation, useSubmit } from 'react-router'

const bokClass =
  'w-full cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

export function BattleBoks({
  adjective,
  left,
  right,
}: {
  adjective: string
  left: ListBlobResultBlob
  right: ListBlobResultBlob
}) {
  const submit = useSubmit()
  const path = useLocation().pathname

  let [rvote, setRVote] = useState(false)
  let [lvote, setLVote] = useState(false)
  const fadeOut = 'transition-opacity opacity-0 ease-in duration-300'
  const rslideIn = 'transition-transform -translate-x-1/2'
  const lslideIn = 'transition-transform translate-x-1/2'

  const vote = async function (vote: 'l' | 'r') {
    if (vote === 'l') {
      setLVote(true)
    } else {
      setRVote(true)
    }
    setTimeout(() => {
      submit({ vote }, { action: `${path}`, method: 'post' }).then(() => {
        setRVote(false)
        setLVote(false)
      })
    }, 330)
  }

  return (
    <div>
      <div className="flex items-center justify-center pt-8">
        Which is more {adjective}?
      </div>
      <main className="flex justify-center gap-x-2 pt-16 px-2 pb-4">
        <div className={`flex-1 ${lvote ? lslideIn : rvote ? fadeOut : ''}`}>
          <img
            src={left.url}
            className={`${bokClass}`}
            onClick={() => vote('l' as const)}
          />
        </div>
        <div className={`flex-1 ${rvote ? rslideIn : lvote ? fadeOut : ''}`}>
          <img
            src={right.url}
            className={`${bokClass}`}
            onClick={() => vote('r' as const)}
          />
        </div>
      </main>
    </div>
  )
}

import { type ListBlobResultBlob } from '@vercel/blob'
import { useState } from 'react'
import { useLocation, useSubmit } from 'react-router'

const bokClass =
  'max-w-lg cursor-pointer transition delay-75 duration-300 ease-in-out hover:scale-105'

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
  const fadeOut = ' transition-[width] max-w-0 ease-in duration-1000'
  const slideIn = ''

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
    }, 1100)
  }

  return (
    <div>
      <div className="flex items-center justify-center pt-8">
        Which is more {adjective}?
      </div>
      <main className="flex justify-center gap-x-4 pt-16 pb-4">
        <img
          src={left.url}
          className={`${bokClass} ${lvote ? slideIn : rvote ? fadeOut : ''}`}
          onClick={() => vote('l' as const)}
        />
        <img
          src={right.url}
          className={`${bokClass} ${rvote ? slideIn : lvote ? fadeOut : ''}`}
          onClick={() => vote('r' as const)}
        />
      </main>
    </div>
  )
}

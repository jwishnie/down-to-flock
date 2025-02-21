import { type ListBlobResultBlob } from '@vercel/blob'
import { useLocation, useSubmit } from 'react-router'

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

  const vote = async function (vote: 'l' | 'r') {
    submit({ vote }, { action: `${path}`, method: 'post' })
  }
  return (
    <div>
      <div className="flex items-center justify-center pt-8">
        Which is more {adjective}?
      </div>
      <main className="flex justify-center gap-x-5 pt-16 pb-4">
        <img
          src={left.url}
          className="max-w-lg"
          onClick={() => vote('l' as const)}
        />
        <img
          src={right.url}
          className="max-w-lg"
          onClick={() => vote('r' as const)}
        />
      </main>
    </div>
  )
}

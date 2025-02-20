import { type ListBlobResultBlob } from '@vercel/blob'

export function BattleBoks({
  adjective,
  left,
  right,
}: {
  adjective: string
  left: ListBlobResultBlob
  right: ListBlobResultBlob
}) {
  return (
    <div>
      <div className="flex items-center justify-center pt-8">
        Which is more {adjective}?
      </div>
      <main className="flex justify-center gap-x-5 pt-16 pb-4">
        <img src={left.url} className="max-w-lg" />
        <img src={right.url} className="max-w-lg" />
      </main>
    </div>
  )
}

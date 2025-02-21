import { db, VOTES_TABLE } from '~/utils/data'
import type { Route } from './+types/tally'

export async function loader() {
  const votes = await db
    .selectFrom(VOTES_TABLE)
    .selectAll()
    .orderBy('timestamp', 'desc')
    .execute()
  return { votes }
}

export default function Tally({ loaderData: { votes } }: Route.ComponentProps) {
  const voteItems = votes.map(({ adjective, left, right, left_wins }) => (
    <div className="flex items-center justify-center gap-x-5 py-6 w-full">
      <img className="max-w-32" src={left_wins ? left : right} />
      <div className="w-fit text-center min-w-70">is more {adjective} than</div>
      <img className="max-w-32" src={left_wins ? right : left} />
    </div>
  ))
  return (
    <div>
      <div className="flex items-center justify-center py-16">Results</div>
      <div>{voteItems}</div>
    </div>
  )
}

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
  return <code>{JSON.stringify(votes, null, 2)}</code>
}

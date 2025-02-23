import _range from 'lodash-es/range'
import { useState } from 'react'
import { db, VOTES_TABLE } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'

const ROWS_PER_PAGE = 20

export async function loader({ params: page }: Route.LoaderArgs) {
  const votes = await db
    .selectFrom(VOTES_TABLE)
    .selectAll()
    .limit(600)
    .orderBy('timestamp', 'desc')
    .execute()

  const numPages = votes.length / ROWS_PER_PAGE
  console.log(votes.length)
  const current = safeParseInt(page) ?? 0
  return { votes, numPages, currentPage: current < numPages ? current : 0 }
}

export default function Tally({
  loaderData: { votes, numPages },
}: Route.ComponentProps) {
  const goToPage = function (page: number) {
    console.log(`goto page: ${page}`)
  }
  const [page, setPage] = useState(0)
  const pager = _range(numPages).map((n, idx) => (
    <span key={idx}>
      {!!idx ? ' | ' : ''}
      <a onClick={() => goToPage(n)}>{n+1}</a>
    </span>
  ))
  const voteItems = votes.map(({ adjective, left, right, left_wins, id }) => (
    <div
      key={id}
      className="flex items-center justify-center gap-x-5 py-6 w-full"
    >
      <img className="max-w-32" src={left_wins ? left : right} />
      <div className="w-fit text-center min-w-70">is more {adjective} than</div>
      <img className="max-w-32" src={left_wins ? right : left} />
    </div>
  ))
  return (
    <div className="px-2">
      <div className="flex items-center justify-center py-16">Results</div>
      <div className="flex items-center justify-center px-4">
        <span>{pager}</span>
      </div>
      <div>{voteItems}</div>
    </div>
  )
}

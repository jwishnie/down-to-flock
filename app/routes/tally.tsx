import _range from 'lodash-es/range'
import { useState } from 'react'
import { redirect, useNavigate } from 'react-router'
import { db, VOTES_TABLE } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'

const ROWS_PER_PAGE = 25
const MAX_ROWS_TO_RETRIEVE = ROWS_PER_PAGE * 30

export async function loader({ params: { page } }: Route.LoaderArgs) {
  const votes = await db
    .selectFrom(VOTES_TABLE)
    .selectAll()
    .limit(MAX_ROWS_TO_RETRIEVE)
    .orderBy('timestamp', 'desc')
    .execute()

  const numPages = Math.ceil(votes.length / ROWS_PER_PAGE)
  const current = safeParseInt(page)
  console.log({ numPages, current })
  if (!current || current > numPages) {
    return redirect('/results/1')
  }

  return { votes, numPages, currentPage: current }
}

export default function Tally({
  loaderData: { votes, numPages, currentPage },
}: Route.ComponentProps) {
  const nav = useNavigate()
  const [page, setPage] = useState(currentPage)
  const pager = _range(1, numPages + 1).map((n, idx) => (
    <span key={idx}>
      {!!idx ? ' | ' : ''}
      {n == currentPage ? (
        n
      ) : (
        <a
          className="cursor-pointer"
          onClick={() => {
            setPage(n)
          }}
        >
          {n}
        </a>
      )}
    </span>
  ))
  const voteItems = votes
    .slice(ROWS_PER_PAGE * (page - 1), ROWS_PER_PAGE * page)
    .map(({ adjective, left, right, left_wins, id }) => (
      <div
        key={id}
        className="flex items-center justify-center gap-x-5 py-6 w-full"
      >
        <img className="max-w-32" src={left_wins ? left : right} />
        <div className="w-fit text-center min-w-70">
          is more {adjective} than
        </div>
        <img className="max-w-32" src={left_wins ? right : left} />
      </div>
    ))
  return (
    <div className="px-2">
      <div className="flex items-center justify-center py-16">Results</div>
      {numPages > 1 ? (
        <div className="flex items-center justify-center px-4">
          <span>{pager}</span>
        </div>
      ) : (
        ''
      )}
      <div>{voteItems}</div>
    </div>
  )
}

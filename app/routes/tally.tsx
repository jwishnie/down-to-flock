import _range from 'lodash-es/range'
import { useState } from 'react'
import { redirect, useNavigate } from 'react-router'
import { getVoteCount, getVotes } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'

const ROWS_PER_PAGE = 25
const MAX_PAGES = 30
export async function loader({ params: { page } }: Route.LoaderArgs) {
  const votes = await getVotes(ROWS_PER_PAGE, MAX_PAGES)

  if (!votes?.length) {
    return { votes: [], numPages: 0, currentPage: 0 }
  }

  const numPages = Math.ceil(votes.length / ROWS_PER_PAGE)
  const current = safeParseInt(page)
  if (!current || current > numPages) {
    return redirect('/results/1')
  }

  const totalVotes = await getVoteCount()
  return { totalVotes, votes, numPages, currentPage: current }
}

export default function Tally({
  loaderData: { totalVotes, votes, numPages, currentPage },
}: Route.ComponentProps) {
  const nav = useNavigate()
  const [page, setPage] = useState(currentPage)
  const pager = votes.length
    ? _range(1, numPages + 1).map((n, idx) => (
        <span key={idx}>
          {!!idx ? ' | ' : ''}
          {n == currentPage ? (
            n
          ) : (
            <a
              className="cursor-pointer"
              onClick={() => {
                setPage(n)
                nav(`/results/${n}`)
              }}
            >
              {n}
            </a>
          )}
        </span>
      ))
    : ''
  const voteItems = votes.length
    ? votes
        .slice(ROWS_PER_PAGE * (page - 1), ROWS_PER_PAGE * page)
        .map(({ adjective, left, right, left_wins, id }) => (
          <div
            key={id}
            className="flex items-center justify-center gap-x-5 py-3 w-full"
          >
            <img className="max-w-32" src={left_wins ? left : right} />
            <div className="w-fit text-center min-w-70">
              is more {adjective} than
            </div>
            <img className="max-w-32" src={left_wins ? right : left} />
          </div>
        ))
    : ''
  return (
    <div className="px-2">
      <div className="header flex items-center justify-center pt-6">
        Results
      </div>
      <div className="subheader flex items-center justify-center pb-6">
        ~{(Math.floor(totalVotes! / 10) * 10).toLocaleString()} appraisals
      </div>
      {numPages > 1 ? (
        <div className="flex items-center justify-center px-2 pb-4">
          <div className="font-sans text-center w-full">{pager}</div>
        </div>
      ) : (
        ''
      )}
      <div>{voteItems}</div>
    </div>
  )
}

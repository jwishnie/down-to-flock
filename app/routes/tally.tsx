import { useState } from 'react'
import { redirect, useNavigate } from 'react-router'
import { getVoteCount, getVotes } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'
import { Pagination } from '~/components/Pagination'

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

  const handlePageSelected = (selectedPage: number) => {
    setPage(selectedPage)
    nav(`/results/${selectedPage}`)
  }

  const voteItems = votes.length
    ? votes
        .slice(ROWS_PER_PAGE * (page - 1), ROWS_PER_PAGE * page)
        .map(({ adjective, left, right, left_wins, id }) => (
          <div
            key={id}
            className="flex items-center justify-around gap-2 w-full"
          >
            <div>
              <img
                alt="Chicken 1"
                className="max-w-32"
                src={left_wins ? left : right}
              />
            </div>
            <div className="text-center break-all">
              is more {adjective} than
            </div>
            <div>
              <img
                alt="Chicken 2"
                className="max-w-32"
                src={left_wins ? right : left}
              />
            </div>
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
      <Pagination
        currentPage={page}
        numPages={numPages}
        onSelected={handlePageSelected}
      />
      <div className="pb-4 flex flex-col gap-4">{voteItems}</div>
      <Pagination
        currentPage={page}
        numPages={numPages}
        onSelected={handlePageSelected}
      />
    </div>
  )
}

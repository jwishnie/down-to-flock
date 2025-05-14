import { useState } from 'react'
import { redirect, useNavigate } from 'react-router'
import { getVoteCount, getVotes } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'
import { Pagination } from '~/components/Pagination'
import React from 'react'

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

  const chickGrid = votes.length
    ? votes
        .slice(ROWS_PER_PAGE * (page - 1), ROWS_PER_PAGE * page)
        .map(({ adjective, left, right, left_wins, id }) => (
          <React.Fragment key={id}>
            <div className="flex justify-end">
              <img
                alt="Chicken 1"
                className="max-w-24 sm:max-w-36 lg:max-w-64 aspect-square"
                src={left_wins ? left : right}
              />
            </div>
            <div className="text-center flex items-center justify-center h-full">
              is more {adjective} than
            </div>
            <div className="flex justify-start">
              <img
                alt="Chicken 2"
                className="max-w-24 sm:max-w-36 lg:max-w-64 aspect-square"
                src={left_wins ? right : left}
              />
            </div>
          </React.Fragment>
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
      <div className="grid grid-cols-[minmax(min-content,1fr)_minmax(min-content,1fr)_minmax(min-content,1fr)] mx-auto gap-4 pb-3">
        {chickGrid}
      </div>
      <Pagination
        currentPage={page}
        numPages={numPages}
        onSelected={handlePageSelected}
      />
    </div>
  )
}

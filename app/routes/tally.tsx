import { redirect } from 'react-router'
import { getVoteCount, getVotes } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import type { Route } from './+types/tally'
import { Pagination } from '~/components/Pagination'
import { Fragment } from 'react'

const ROWS_PER_PAGE = 25
const MAX_PAGES = 30
const resultsHref = (page: number) => `/results/${page}`
export async function loader({ params: { page } }: Route.LoaderArgs) {
  const current = safeParseInt(page)
  if (!current || current < 1 || current > MAX_PAGES) {
    return redirect('/results/1')
  }

  // Fetched together; the page's rows are wasted only on the rare redirects below
  const [totalVotes, votes] = await Promise.all([
    getVoteCount(),
    getVotes(current, ROWS_PER_PAGE),
  ])
  const numPages = Math.min(Math.ceil(totalVotes / ROWS_PER_PAGE), MAX_PAGES)

  if (numPages === 0) {
    return { totalVotes, votes: [], numPages: 0, currentPage: 0 }
  }
  if (current > numPages) {
    return redirect('/results/1')
  }

  // totalVotes is cached for COUNT_TTL, so numPages can point past the live rows.
  // Rather than render a blank page, fall back to the first one.
  if (!votes.length && current > 1) {
    return redirect('/results/1')
  }

  return { totalVotes, votes, numPages, currentPage: current }
}

export default function Tally({
  loaderData: { totalVotes, votes, numPages, currentPage },
}: Route.ComponentProps) {
  // votes is already exactly one page — the DB did the slicing.
  const chickGrid = votes.map(({ adjective, left, right, left_wins, id }) => (
    <Fragment key={id}>
      <div className="flex justify-end">
        <img
          alt={`The more ${adjective} chicken`}
          className="w-24 sm:w-36 lg:w-64 aspect-square object-cover"
          src={left_wins ? left : right}
        />
      </div>
      <div className="text-center flex items-center justify-center h-full">
        is more {adjective} than
      </div>
      <div className="flex justify-start">
        <img
          alt={`The less ${adjective} chicken`}
          className="w-24 sm:w-36 lg:w-64 aspect-square object-cover"
          src={left_wins ? right : left}
        />
      </div>
    </Fragment>
  ))
  return (
    <div className="px-2">
      <div className="header flex items-center justify-center pt-6">
        Results
      </div>
      <div className="subheader flex items-center justify-center pb-6">
        ~{(Math.floor(totalVotes / 10) * 10).toLocaleString()} appraisals
      </div>
      <Pagination
        currentPage={currentPage}
        numPages={numPages}
        hrefFor={resultsHref}
      />
      <div className="grid grid-cols-[minmax(min-content,1fr)_minmax(min-content,1fr)_minmax(min-content,1fr)] mx-auto gap-4 pb-3">
        {chickGrid}
      </div>
      <Pagination
        currentPage={currentPage}
        numPages={numPages}
        hrefFor={resultsHref}
      />
    </div>
  )
}

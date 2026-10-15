import _range from 'lodash-es/range'
import { Link } from 'react-router'

interface PaginationProps {
  currentPage: number
  numPages: number
  hrefFor: (page: number) => string
}

export function Pagination({
  currentPage,
  numPages,
  hrefFor,
}: PaginationProps) {
  if (numPages <= 1) {
    return null
  }

  const pager = _range(1, numPages + 1).map((n, idx) => (
    <span key={n}>
      {idx > 0 && ' | '}
      {n === currentPage ? (
        <span aria-current="page">{n}</span>
      ) : (
        <Link className="cursor-pointer" to={hrefFor(n)}>
          {n}
        </Link>
      )}
    </span>
  ))

  return (
    <div className="flex items-center justify-center px-2 pb-4">
      <div className="text-center w-full">{pager}</div>
    </div>
  )
}

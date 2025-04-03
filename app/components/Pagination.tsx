import _range from 'lodash-es/range'
import React from 'react'

interface PaginationProps {
  currentPage: number
  numPages: number
  onSelected: (page: number) => void
}

export function Pagination({ currentPage, numPages, onSelected }: PaginationProps) {
  if (numPages <= 1) {
    return null
  }

  const pager = _range(1, numPages + 1).map((n, idx) => (
    <span key={idx}>
      {!!idx ? ' | ' : ''}
      {n === currentPage ? (
        n
      ) : (
        <a
          className="cursor-pointer"
          onClick={() => onSelected(n)}
        >
          {n}
        </a>
      )}
    </span>
  ))

  return (
    <div className="flex items-center justify-center px-2 pb-4">
      <div className="font-sans text-center w-full">{pager}</div>
    </div>
  )
}

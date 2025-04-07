import { getTopVotesByAdjective } from '~/utils/data'
import type { Route } from '../routes/+types/rank'
import { type Word, WordCloud } from '@isoterik/react-word-cloud'
import { useState, useMemo, useEffect, useRef } from 'react'

export default function Rank({
  loaderData: { rankingArray },
}: Route.ComponentProps) {
  const [selectedWord, setSelectedWord] = useState<string>('')
  const mainRef = useRef<HTMLDivElement>(null)

  const rankingMap = Map.groupBy(rankingArray, (row) => row.adjective)

  // Memoize the words array with direct calculation
  const words = useMemo(() => {
    if (!rankingArray) return []

    return [...rankingMap.values()].slice(1, 251).map((ranks) => ({
      text: ranks[0].adjective,
      value: ranks[0].vote_count * 10,
    }))
  }, [rankingArray])

  const onWordClick = (word: Word) => {
    setSelectedWord(word.text)
  }

  return (
    <main className="container mx-auto py-8">
      <div className="pb-6">
        <WordCloud
          width={800}
          height={300}
          onWordClick={onWordClick}
          words={words}
          transition="all 0.01s linear"
        />
      </div>
      <h1 className="text-3xl font-bold text-center">
        {selectedWord
          ? `the most ${selectedWord.toLocaleUpperCase()}`
          : 'The Mostests'}
      </h1>

      <div className="text-center mb-8">
        {selectedWord && (
          <span
            onClick={() => setSelectedWord('')}
            className="cursor-pointer underline"
          >
            back to mostest
          </span>
        )}
      </div>

      {selectedWord ? (
        <div className="justify-items-center">
          {rankingMap.get(selectedWord)?.map(({ winning_url, vote_count }) => (
            <div
              key={`${selectedWord}-${winning_url}`}
              className="flex items-center justify-center gap-x-5 py-3 w-full"
            >
              <img className="max-w-32 cursor-pointer" src={winning_url} />
              {vote_count} appraisals
            </div>
          ))}
        </div>
      ) : (
        [...rankingMap.values()].slice(1, 11).map((ranks) => {
          const { adjective, winning_url, vote_count } = ranks[0]
          return (
            <div
              key={adjective}
              className="flex items-center justify-center gap-x-5 py-3 w-full"
            >
              <img
                className="max-w-32 cursor-pointer"
                src={winning_url}
                onClick={(e) => {
                  setSelectedWord(adjective)
                }}
              />{' '}
              is the MOST {adjective} ({vote_count} appraisals)
            </div>
          )
        })
      )}
    </main>
  )
}

export async function loader({ params: { page } }: Route.LoaderArgs) {
  const rankingArray = await getTopVotesByAdjective()
  return { rankingArray }
}

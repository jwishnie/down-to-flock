import { getTopVotesByAdjective } from '~/utils/data'
import type { Route } from '../routes/+types/rank'
import { type Word, WordCloud } from '@isoterik/react-word-cloud'
import { useState, useMemo, useEffect, useRef } from 'react'

export default function Rank({
  loaderData: { rankingArray },
}: Route.ComponentProps) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const wordCloudRef = useRef<HTMLDivElement>(null)

  const rankingMap = Map.groupBy(rankingArray, (row) => row.adjective)

  // Memoize the words array with direct calculation
  const words = useMemo(() => {
    if (!rankingArray) return []

    return [...rankingMap.values()].slice(1, 201).map((ranks) => ({
      text: ranks[0].adjective,
      value: ranks[0].vote_count * 20,
    }))
  }, [rankingArray])

  // Reset selected word when clicking outside the WordCloud
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wordCloudRef.current &&
        !wordCloudRef.current.contains(event.target as Node)
      ) {
        setSelectedWord(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [wordCloudRef])

  const onWordClick = (word: Word) => {
    setSelectedWord(word)
  }

  return (
    <main className="container mx-auto py-8">
      <div ref={wordCloudRef} className="pb-6">
        <WordCloud
          width={800}
          height={300}
          onWordClick={onWordClick}
          words={words}
          transition="all 0.01s linear"
        />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">
        {selectedWord
          ? `the most ${selectedWord.text.toLocaleUpperCase()}`
          : 'The Mostests'}
      </h1>
      {selectedWord ? (
        <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          {rankingMap
            .get(selectedWord.text)
            ?.map(({ winning_url, vote_count }) => (
              <div
                key={`${selectedWord.text}-${winning_url}`}
                className="flex flex-col items-center justify-center gap-1"
              >
                <img className="max-w-[100px] h-auto" src={winning_url} />
                <span className="text-center text-sm">
                  {vote_count} appraisals
                </span>
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
              <img className="max-w-32" src={winning_url} /> is the MOST{' '}
              {adjective} ({vote_count} appraisals)
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

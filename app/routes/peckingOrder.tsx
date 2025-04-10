import { getTopVotesByAdjective, type RankResult } from '~/utils/data'
import type { Route } from './+types/peckingOrder'
import { type Word, WordCloud } from '@isoterik/react-word-cloud'
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'

export default function PeckingOrder({
  loaderData: { rankingArray, adjective },
}: Route.ComponentProps) {
  const [selectedWord, setSelectedWord] = useState<string>('')
  useEffect(() => setSelectedWord(adjective || ''), [adjective])
  const nav = useNavigate()

  const rankingMap: Map<string, RankResult[]> = Map.groupBy(
    rankingArray,
    (r: (typeof rankingArray)[0]) => r.adjective
  )

  // Memoize the words array with direct calculation
  const words = useMemo(() => {
    if (!rankingArray) return []

    return [...rankingMap.values()].slice(1, 251).map((ranks) => ({
      text: ranks[0].adjective,
      value: ranks[0].vote_count * 10,
    }))
  }, [rankingArray])

  const onWordClick = (word: Word) => {
    nav(`/pecking/${word.text}`)
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
            onClick={() => onWordClick({ text: '', value: 0 })}
            className="cursor-pointer underline"
          >
            back to the mostests
          </span>
        )}
      </div>

      {selectedWord ? (
        <div className="w-full">
          {rankingMap.get(selectedWord)?.map(({ winning_url, vote_count }) => (
            <div
              key={`${selectedWord}-${winning_url}`}
              className="flex items-center gap-3 mb-5"
            >
              <div className="flex-1 flex items-center justify-end">
                <img className="max-w-32 cursor-pointer" src={winning_url} />
              </div>
              <div className="flex-1 flex items-center justify-start">
                <span>{vote_count} appraisals</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full">
          {[...rankingMap.values()].slice(1, 11).map((ranks) => {
            const { adjective, winning_url, vote_count } = ranks[0]
            return (
              <div key={adjective} className="flex items-center gap-3 mb-5">
                <div className="flex-1 flex items-center justify-end">
                  <img
                    className="max-w-32 cursor-pointer"
                    src={winning_url}
                    onClick={(e) => {
                      setSelectedWord(adjective)
                    }}
                  />
                </div>
                <div className="flex-1 flex items-center justify-start">
                  <span>
                    is the MOST {adjective} ({vote_count} appraisals)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export async function loader({ params: { adjective } }: Route.LoaderArgs) {
  const rankingArray = await getTopVotesByAdjective()
  return { rankingArray, adjective }
}

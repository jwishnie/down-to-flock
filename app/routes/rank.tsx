import { getTopVotesByAdjective } from "~/utils/data"
import type { Route } from "../routes/+types/rank"

export default function Rank({ loaderData: { rankingArray } }: Route.ComponentProps) {  
  // turn array into a map
  const rankingMap = Map.groupBy(rankingArray, (row) => row.adjective)

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">The Mostests</h1>
      {[...rankingMap.values()].slice(0, 10).map((ranks) => {
        const { adjective, winning_url, vote_count } = ranks[0]
        return (
          <div key={adjective} className="flex items-center justify-center gap-x-5 py-3 w-full">
            <img className="max-w-32" src={winning_url} /> is the MOST {adjective} ({vote_count} appraisals)
          </div>
        )
      })}
    </main>
  )
}

export async function loader({ params: { page } }: Route.LoaderArgs) {
  const rankingArray = await getTopVotesByAdjective()
  return { rankingArray }
}

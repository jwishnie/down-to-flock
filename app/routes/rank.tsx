import { getVoteRanking } from "~/utils/data"
import type { Route } from "../routes/+types/rank"


export default function Rank({ loaderData: { winningImages } }: Route.ComponentProps) {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">The Mostests</h1>
      {winningImages.slice(0, 10).map(({ adjective, winning_url, vote_count }) => (
        <div key={adjective} className="flex items-center justify-center gap-x-5 py-3 w-full">
          <img className="max-w-32" src={winning_url} /> is the MOST {adjective} ({vote_count} appraisals)
        </div>
      ))}
    </main>
  )
}

export async function loader({ params: { page } }: Route.LoaderArgs) {
  const winningImages = await getVoteRanking()
  return { winningImages }
}

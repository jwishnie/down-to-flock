import { BattleBoks } from '~/battleboks/battleboks'
import type { Route } from './+types/home'

import _range from 'lodash-es/range'
import _sampleSize from 'lodash-es/sampleSize'
import { redirect, useLocation, useSubmit } from 'react-router'
import adjectives from '~/adjectives'
import titles from '~/titles'
import {
  type ChickMeta,
  db,
  getChix,
  isNotFound,
  iVoted,
  voteCount,
  VOTES_TABLE,
} from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import bokSound from '~/assets/bok.ogg'
import { useAudio } from './hook'

const VALID_ADJECTIVES = new Set(
  adjectives.map((a) => a.toLocaleLowerCase())
)

// Shared by loader and action. The action is a separate request that can be POSTed
// to directly, so it can't assume the loader ran first and validated anything.
// Returns null for anything we shouldn't record. Indices are 1s based.
const validateBattle = function (
  adjective: string | undefined,
  left: string | undefined,
  right: string | undefined,
  chix: ChickMeta[]
) {
  const [leftIndex, rightIndex] = [left, right].map((e) => safeParseInt(e))

  if (!adjective || !VALID_ADJECTIVES.has(adjective.toLocaleLowerCase())) {
    return null
  }
  if (!leftIndex || !rightIndex) return null
  if (leftIndex < 1 || rightIndex < 1) return null
  // without this the row records a chicken as more <adjective> than itself
  if (leftIndex === rightIndex) return null
  // without this chix[index - 1] is undefined and .src throws a 500
  if (leftIndex > chix.length || rightIndex > chix.length) return null
  // a gap in the chix numbering; there's no image to show or vote on
  if (isNotFound(chix[leftIndex - 1]) || isNotFound(chix[rightIndex - 1])) {
    return null
  }

  return {
    adjective: adjective.toLocaleLowerCase(),
    leftIndex,
    rightIndex,
  }
}

// Always returns a valid battle: it runs every candidate through validateBattle (no
// NOT_FOUND gaps, no chick against itself), so picking can't drift from what the
// loader and action accept. `previous` is the battle just voted on: repeating the
// same pair would leave BattleBoks waiting on a preload that never happens.
// Indices are 1s based.
const pickYourBattle = function (
  chix: ChickMeta[],
  previous?: { leftIndex: number; rightIndex: number }
) {
  // without this the loop below can never find a valid battle and spins forever.
  // With exactly 2, a swapped pair still differs from `previous`, so it ends.
  const numFound = chix.filter((c) => !isNotFound(c)).length
  if (numFound < 2) {
    throw new Error(`need at least 2 chix to battle, found ${numFound}`)
  }

  while (true) {
    const [left, right] = _sampleSize(_range(1, chix.length + 1), 2)
    const adjective = _sampleSize(adjectives, 1)[0]
    const battle = validateBattle(adjective, `${left}`, `${right}`, chix)
    const isRepeat =
      previous &&
      battle?.leftIndex === previous.leftIndex &&
      battle?.rightIndex === previous.rightIndex
    if (battle && !isRepeat) return battle
  }
}

// params are 1s based
export async function loader({
  params: { adjective, left, right },
}: Route.LoaderArgs) {
  // voteCount is independent of the chix; fetch both at once. On the redirect path
  // it's an unused Redis read, which is cheaper than serializing the happy path.
  const [chix, count] = await Promise.all([getChix(), voteCount()])

  const battle = validateBattle(adjective, left, right, chix)
  if (!battle) {
    // invalid params, pick a new battle and redirect
    const { adjective, leftIndex, rightIndex } = pickYourBattle(chix)
    return redirect(`/${adjective}/${leftIndex}/${rightIndex}`)
  }

  // pick the chix, convert 1s based from param to 0s based
  const [leftChick, rightChick] = [battle.leftIndex, battle.rightIndex].map(
    (i) => chix[i - 1]
  )

  return {
    title: _sampleSize(titles, 1)[0],
    adjective: battle.adjective,
    left: leftChick,
    right: rightChick,
    voteCount: count,
  }
}

// In the server-rendered <head>, so the title is there before hydration
export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.title },
]

const PITCH_CF_EVERY = 10
const BOK_EVERY = 7

export async function action({
  request,
  params: { adjective, left, right },
}: Route.ActionArgs) {
  const [vote, chix] = await Promise.all([
    request.formData().then((fd) => fd.get('vote')),
    getChix(),
  ])

  const battle = validateBattle(adjective, left, right, chix)
  // without this anything but 'l' (including a missing vote) records a right win
  if (!battle || (vote !== 'l' && vote !== 'r')) {
    throw Response.json(
      { message: 'Invalid vote' },
      {
        status: 400,
        statusText: 'Bad Request',
      }
    )
  }

  const [leftChick, rightChick] = [battle.leftIndex, battle.rightIndex].map(
    (i) => chix[i - 1]
  )

  // The counter only paces the interstitial, so it's fine for it to tick even if
  // the insert fails; running both at once saves a round trip per vote.
  const [, voteCount] = await Promise.all([
    db
      .insertInto(VOTES_TABLE)
      .values({
        adjective: battle.adjective,
        left: leftChick.src,
        right: rightChick.src,
        left_wins: vote === 'l',
      })
      .execute(),
    iVoted(),
  ])

  // voteCount is 0 when the counter is unavailable; 0 % n === 0 would otherwise
  // pitch the interstitial on every single vote while Redis is down.
  if (
    process.env.CF_INTERSTITIAL === 'yes' &&
    voteCount > 0 &&
    voteCount % PITCH_CF_EVERY === 0
  ) {
    return redirect('/cff')
  }

  // pick next battle
  const {
    adjective: newAdjective,
    leftIndex,
    rightIndex,
  } = pickYourBattle(chix, battle)
  return redirect(`/${newAdjective}/${leftIndex}/${rightIndex}`)
}

export default function Home({
  loaderData: { adjective, left, right, voteCount },
}: Route.ComponentProps) {
  const { play: playBok } = useAudio(bokSound)

  const submit = useSubmit()
  const path = useLocation().pathname
  const vote = function (v: boolean) {
    if ((voteCount + 1) % BOK_EVERY === 0) {
      // Fire and forget: Home stays mounted across battles, so the bok plays on
      // while the next one loads. A failed bok must not cost the vote.
      playBok().catch(() => {})
    }
    submit({ vote: v ? 'l' : 'r' }, { action: `${path}`, method: 'post' })
  }
  return (
    <div>
      <div className="header flex items-center justify-center px-6">
          <BattleBoks
            adjective={adjective.toLocaleLowerCase()}
            left={left}
            right={right}
            onSelected={vote}
          />
      </div>
      <div className="flex items-center justify-center pb-3">
        <a className="text-sm" href="https://www.chicken.pics/about">
          <span>About</span>
        </a>
        &nbsp;|&nbsp;
        <a
          className="text-sm"
          href="mailto:squawk@chicken.pics?subject=cluk%20cluk%20adjective%20delivery%21"
        >
          <span>Suggest an adjective or just say hello</span>
        </a>
        &nbsp;|&nbsp;
        <a className="text-sm" href="https://www.chicken.pics/store">
          <span>Bok Buys!</span>
        </a>
      </div>
    </div>
  )
}

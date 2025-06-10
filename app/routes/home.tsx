import { BattleBoks } from '~/battleboks/battleboks'
import type { Route } from './+types/home'

import _range from 'lodash-es/range'
import _sampleSize from 'lodash-es/sampleSize'
import { useEffect } from 'react'
import { redirect, useLocation, useSubmit } from 'react-router'
import adjectives from '~/adjectives'
import titles from '~/titles'
import { db, getChix, iVoted, voteCount, VOTES_TABLE } from '~/utils/data'
import { safeParseInt } from '~/utils/general'
import bokSound from '~/assets/bok.ogg'
import { useAudio } from './hook'

// return values are 1s based
const pickYourBattle = async function (numChix: number) {
  const [leftIndex, rightIndex] = _sampleSize(_range(1, numChix + 1), 2)
  const adjective = _sampleSize(adjectives, 1)[0].toLocaleLowerCase()

  return { adjective, leftIndex, rightIndex }
}

// params are 1s based
export async function loader({
  params: { adjective, left, right },
}: Route.LoaderArgs) {
  const [left1sIndex, right1sIndex] = [left, right].map((e) => safeParseInt(e))
  const chix = await getChix()
  const numChix = chix.length

  if (
    !(
      adjective &&
      left1sIndex &&
      right1sIndex &&
      left1sIndex > 0 &&
      right1sIndex > 0 &&
      left1sIndex <= numChix &&
      right1sIndex <= numChix
    )
  ) {
    // invalid params, pick a new battle and redirect
    const { adjective, leftIndex, rightIndex } = await pickYourBattle(numChix)
    return redirect(`/${adjective}/${leftIndex}/${rightIndex}`)
  }

  // pick the chix, convert 1s based from param to 0s based
  const [leftChick, rightChick] = [left1sIndex, right1sIndex].map(
    (i) => chix[i - 1]
  )

  return {
    title: _sampleSize(titles, 1)[0],
    adjective: adjective,
    left: leftChick,
    right: rightChick,
    voteCount: await voteCount(),
  }
}

const PITCH_CF_EVERY = 10
const BOK_EVERY = 7

export async function action({
  request,
  params: { adjective, left, right },
}: Route.ActionArgs) {
  const vote = (await request.formData()).get('vote')
  const chix = await getChix()

  const [leftChick, rightChick] = [left, right].map((i) => {
    const index = safeParseInt(i)
    if (!index) {
      throw Response.json(
        { message: 'Invlalid Chicken Index' },
        {
          status: 400,
          statusText: 'Bad Request',
        }
      )
    }
    return chix[index - 1]
  })

  await db
    .insertInto(VOTES_TABLE)
    .values({
      adjective: adjective!, // for typescript, if empty route wouldn't have reached here
      left: leftChick.src,
      right: rightChick.src,
      left_wins: vote === 'l',
    })
    .execute()

  // check if interstitial time
  const voteCount = await iVoted()

  if (
    process.env.CF_INTERSTITIAL === 'yes' &&
    voteCount % PITCH_CF_EVERY === 0
  ) {
    console.log('Redirecting to CFF page')
    return redirect('/cff')
  }

  // pick next battle
  const {
    adjective: newAdjective,
    leftIndex,
    rightIndex,
  } = await pickYourBattle(chix.length)
  return redirect(`/${newAdjective}/${leftIndex}/${rightIndex}`)
}

export default function Home({
  loaderData: { title, adjective, left, right, voteCount },
}: Route.ComponentProps) {
  const { play: playBok } = useAudio(bokSound)

  useEffect(() => {
    document.title = title
  })

  const submit = useSubmit()
  const path = useLocation().pathname
  const vote = async function (v: boolean) {
    if ((voteCount + 1) % BOK_EVERY === 0) {
      await playBok()
    }
    submit({ vote: v ? 'l' : 'r' }, { action: `${path}`, method: 'post' })
  }
  return (
    <div>
      <div className="header flex items-center justify-center px-6">
        <BattleBoks
          key={`${adjective}${left.name}${right.name}`}
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

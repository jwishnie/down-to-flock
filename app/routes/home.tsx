import { BattleBoks } from '~/battleboks/battleboks'
import type { Route } from './+types/home'

import _range from 'lodash-es/range'
import _sampleSize from 'lodash-es/sampleSize'
import _toInteger from 'lodash-es/toInteger'
import { useEffect } from 'react'
import { redirect } from 'react-router'
import adjectives from '~/adjectives'
import titles from '~/titles'
import { db, getChix, VOTES_TABLE, type ChickMeta } from '~/utils/data'

export async function loader({
  params: { adjective, left, right },
}: Route.LoaderArgs) {
  const chix = await getChix()

  const leftChick: ChickMeta | undefined = chix[parseInt(left!)]
  const rightChick: ChickMeta | undefined = chix[parseInt(right!)]
  if (!(adjective && left && right && leftChick && rightChick)) {
    const adj = _sampleSize(adjectives)[0].toLocaleLowerCase()
    const [leftI, rightI] = _sampleSize(_range(chix.length - 1), 2)
    return redirect(`/${adj}/${leftI}/${rightI}`)
  }

  return {
    title: _sampleSize(titles)[0],
    adjective: adjective,
    left: leftChick,
    right: rightChick,
  }
}

export async function action({
  request,
  params: { adjective, left, right },
}: Route.ActionArgs) {
  const formData = await request.formData()
  const vote = formData.get('vote')
  const chix = await getChix()

  await db
    .insertInto(VOTES_TABLE)
    .values({
      adjective,
      left: chix[_toInteger(left)].src,
      right: chix[_toInteger(right)].src,
      left_wins: vote === 'l',
    } as any)
    .execute()

  return redirect('/')
}

export default function Home({
  loaderData: { title, adjective, left, right },
}: Route.ComponentProps) {
  useEffect(() => {
    document.title = title
  })
  return (
    <BattleBoks
      adjective={adjective.toLocaleLowerCase()}
      left={left}
      right={right}
    />
  )
}

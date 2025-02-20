import { BattleBoks } from '~/battleboks/battleboks'
import type { Route } from './+types/home'

import { list as listChix, type ListBlobResultBlob } from '@vercel/blob'
import { kv } from '@vercel/kv'
import _range from 'lodash-es/range'
import _sampleSize from 'lodash-es/sampleSize'
import { useEffect } from 'react'
import { redirect } from 'react-router'
import adjectives from '~/adjectives'
import titles from '~/titles'

const CHIX_KEY = 'chix'

const getChix = async function () {
  const fromStore = (await kv.get(CHIX_KEY)) as ListBlobResultBlob[] | null
  if (!fromStore) {
    const chix = (await listChix()).blobs
    await kv.set(CHIX_KEY, chix, { ex: 3600 })
    return chix
  }

  return fromStore
}

export async function loader({
  params: { adjective, left, right },
}: Route.LoaderArgs) {
  const chix = await getChix()

  const leftChick: ListBlobResultBlob | undefined = chix[parseInt(left!)]
  const rightChick: ListBlobResultBlob | undefined = chix[parseInt(right!)]
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

export async function action() {}

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

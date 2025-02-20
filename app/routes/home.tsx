import { BattleBoks } from '~/battleboks/battleboks'
import type { Route } from './+types/home'

import { list as listChix, type ListBlobResultBlob } from '@vercel/blob'
import { kv } from '@vercel/kv'
import _sampleSize from 'lodash-es/sampleSize'
import { useEffect } from 'react'
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

export async function loader({ params }: Route.LoaderArgs) {
  const chix = _sampleSize(await getChix(), 2)
  return {
    title: _sampleSize(titles)[0],
    adjective: _sampleSize(adjectives)[0],
    left: chix[0],
    right: chix[1],
  }
}

export default function Home({
  loaderData: { title, adjective, left, right },
}: Route.ComponentProps) {
  useEffect(() => {
    document.title = title
  })
  return <BattleBoks adjective={adjective} left={left} right={right} />
}

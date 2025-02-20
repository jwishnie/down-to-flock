import { BattleBoks } from '../battleboks/battleboks'
import type { Route } from './+types/home'

import { list as listChix } from '@vercel/blob'
import _sampleSize from 'lodash-es/sampleSize'
import { useEffect } from 'react'
import adjectives from '~/adjectives'
import titles from '~/titles'

export async function loader({ params }: Route.LoaderArgs) {
  const chix = _sampleSize((await listChix()).blobs, 2)
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

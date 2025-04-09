import { createKysely } from '@vercel/postgres-kysely'
import {
  Migrator,
  sql,
  type GeneratedAlways,
  type Migration,
  type MigrationProvider,
  type MigratorProps,
} from 'kysely'

import { Octokit } from '@octokit/core'
import { Redis } from '@upstash/redis'
import { safeParseInt } from './general'

export const VOTES_TABLE = 'Votes'

const kv = Redis.fromEnv()

const dbMigrationProvider: MigrationProvider = {
  getMigrations: async (): Promise<Record<string, Migration>> => ({
    '001_create_db': {
      async up(db) {
        await db.schema
          .createTable(VOTES_TABLE)
          .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
          )
          .addColumn('timestamp', 'timestamptz', (col) =>
            col.defaultTo(sql`now()`).notNull()
          )
          .addColumn('adjective', 'text', (col) => col.notNull())
          .addColumn('left', 'text', (col) => col.notNull())
          .addColumn('right', 'text', (col) => col.notNull())
          .addColumn('left_wins', 'boolean', (c) => c.notNull())
          .execute()
      },
      async down(db) {
        await db.schema.dropTable(VOTES_TABLE).ifExists().execute()
      },
    },
    '002_indexes': {
      async up(db) {
        await db.schema
          .createIndex('timestamp-index')
          .on(VOTES_TABLE)
          .column('timestamp')
          .execute()
      },
      async down(db) {
        //  await db.schema.dropIndex('timestamp-index').on(VOTES_TABLE).execute()
      },
    },
  }),
}

export const getMigrator = (props: Omit<MigratorProps, 'provider'>) =>
  new Migrator({ ...props, provider: dbMigrationProvider })

interface Votes {
  id: GeneratedAlways<string>
  timestamp: GeneratedAlways<Date>
  adjective: string
  left: string
  right: string
  left_wins: boolean
}

interface DbSchema {
  Votes: Votes
}

export const db = createKysely<DbSchema>()

const CHIX_KEY = 'chix-v12'
const RANK_KEY = 'rank-v7'
const TOP_VOTES_KEY = 'top-votes-v14'
const CHIX_PATH = '/repos/jwishnie/down-to-flock/contents/chix'
const PAGES_PATH = 'https://chix.wishnie.org'
export type ChickMeta = {
  src: string
  name: string
}

const CHIX_TTL = 60 * 60 * 8 // 8 hrs
const RANK_TTL = 60 * 30 // 30 mins

export const getChix = async function () {
  const fromStore = (await kv.get(CHIX_KEY)) as ChickMeta[] | null
  if (!fromStore) {
    const chix = (await new Octokit().request(`GET ${CHIX_PATH}`)).data.map(
      ({ name }: { name: string }) => ({ name, src: `${PAGES_PATH}/${name}` })
    ) as ChickMeta[]
    await kv.set(CHIX_KEY, chix, { ex: CHIX_TTL })
    return chix
  }

  return fromStore
}

export const getVotes = async function (rowsPerPage = 25, maxPages = 30) {
  return await db
    .selectFrom(VOTES_TABLE)
    .selectAll()
    .limit(rowsPerPage * maxPages)
    .orderBy('timestamp', 'desc')
    .execute()
}

const COUNT_TTL = 60 * 10 // ten minutes
const COUNT_KEY = 'chix-count-v1'
export const getVoteCount = async function (exact = false) {
  const fromStore = exact ? undefined : safeParseInt(await kv.get(COUNT_KEY))
  if (!fromStore) {
    const { count } = await db
      .selectFrom(VOTES_TABLE)
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirstOrThrow()
    await kv.set(COUNT_KEY, `${count}`, { ex: COUNT_TTL })
    return safeParseInt(count) || 0
  }

  return fromStore
}

interface RankResult {
  adjective: string
  winning_url: string
  vote_count: number
}

interface VoteRank extends RankResult {
  rank: number
  max_votes: number
}

export const getVoteRanking = async function (): Promise<RankResult[]> {
  const fromStore = (await kv.get(RANK_KEY)) as RankResult[] | null
  if (fromStore) return fromStore

  const ranks = await db
    .with('url_counts', (qb) =>
      qb
        .selectFrom(VOTES_TABLE)
        .select([
          'adjective',
          sql<string>`
            CASE 
              WHEN left_wins = true THEN "left" 
              ELSE "right" 
            END
          `.as('url'),
          sql<number>`COUNT(*)`.as('vote_count'),
        ])
        .groupBy([
          'adjective',
          sql`CASE WHEN left_wins = true THEN "left" ELSE "right" END`,
        ])
    )
    .selectFrom(
      db
        .selectFrom('url_counts' as any)
        .select([
          sql<string>`adjective`.as('adjective'),
          sql<string>`url`.as('winning_url'),
          sql<number>`vote_count`.as('vote_count'),
        ])
        .distinctOn(['adjective'])
        .orderBy('adjective')
        .orderBy('vote_count', 'desc')
        .as('winners')
    )
    .select(['adjective', 'winning_url', 'vote_count'])
    .orderBy('vote_count', 'desc')
    .execute()

  await kv.set(RANK_KEY, ranks, { ex: RANK_TTL })
  return ranks
}

export const getTopVotesByAdjective = async function (): Promise<RankResult[]> {
  const fromStore = (await kv.get(TOP_VOTES_KEY)) as RankResult[] | null
  if (fromStore) return fromStore

  const topVotes = await db
    .selectFrom(
      db
        .selectFrom(VOTES_TABLE)
        .select([
          'adjective',
          sql<string>`
            CASE 
              WHEN left_wins = true THEN "left" 
              ELSE "right" 
            END
          `.as('winning_url'),
          sql<number>`COUNT(*)`.as('vote_count'),
          sql<number>`
            ROW_NUMBER() OVER (
              PARTITION BY adjective 
              ORDER BY COUNT(*) DESC
            )
          `.as('rank'),
          sql<number>`
            MAX(COUNT(*)) OVER (
              PARTITION BY adjective
            )
          `.as('max_votes'),
        ])
        .groupBy([
          'adjective',
          sql`CASE WHEN left_wins = true THEN "left" ELSE "right" END`,
        ])
        .as('ranked_votes')
    )
    .select(['adjective', 'winning_url', 'vote_count', 'rank', 'max_votes'])
    .where('rank', '<=', 10)
    .orderBy(sql`max_votes DESC, adjective, vote_count DESC`)
    .execute()

  await kv.set(TOP_VOTES_KEY, topVotes, { ex: RANK_TTL })
  return topVotes
}

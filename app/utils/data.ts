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

const CHIX_KEY = 'chix-gh-v10'
const RANK_KEY = 'rank-v5'
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

type VoteRank = {
  adjective: string
  winning_url: string
  vote_count: number
}
export const getVoteRanking = async function (): Promise<VoteRank[]> {
  const fromStore = (await kv.get(RANK_KEY)) as VoteRank[] | null
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

// Cache key for the top votes by URL
const TOP_VOTES_BY_URL_KEY = 'top-votes-by-url-v1'
// Cache TTL for the top votes by URL (30 minutes)
const TOP_VOTES_TTL = 60 * 30

/**
 * Returns the top 10 vote getters per URL as a Map of url -> array of [adjective, url, vote count]
 * @returns A Map where the key is the URL ("left" or "right") and the value is an array of tuples [adjective, url, vote_count]
 */
export const getTopVotesByUrl = async function (): Promise<
  Map<string, [string, string, number][]>
> {
  // Try to get from cache first
  const fromStore = await kv.get(TOP_VOTES_BY_URL_KEY)
  if (fromStore) {
    try {
      // Parse JSON string and convert to Map
      const parsed = JSON.parse(fromStore as string) as Record<
        string,
        [string, string, number][]
      >
      return new Map(Object.entries(parsed))
    } catch (e) {
      console.error('Error parsing cached data:', e)
      // Continue to fetch from database if parsing fails
    }
  }

  // Query to get the top 10 vote getters per adjective
  const votesByUrl = await db
    .with('vote_counts', (qb) =>
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
    .with('ranked_votes', (qb) =>
      qb
        .selectFrom('vote_counts' as any)
        .select([
          'adjective',
          'url',
          'vote_count',
          sql<number>`ROW_NUMBER() OVER (PARTITION BY adjective ORDER BY vote_count DESC)`.as(
            'rank'
          ),
        ])
    )
    .with('adjective_totals', (qb) =>
      qb
        .selectFrom('vote_counts' as any)
        .select(['adjective', sql<number>`SUM(vote_count)`.as('total_votes')])
        .groupBy('adjective')
    )
    .selectFrom('ranked_votes' as any)
    .innerJoin(
      'adjective_totals as at',
      'ranked_votes.adjective',
      'at.adjective'
    )
    .select([
      'ranked_votes.adjective as adjective',
      'ranked_votes.url as url',
      'ranked_votes.vote_count as vote_count',
      'at.total_votes as total_votes',
    ])
    .where('rank', '<=', 10)
    .orderBy([sql`at.total_votes DESC`, 'ranked_votes.rank'])
    .execute()

  // Use a reducer to process the results and group by URL
  const resultMap = votesByUrl.reduce(
    (acc, row) => {
      const url = row.url
      if (!acc.has(url)) {
        acc.set(url, [])
      }
      const currentArray = acc.get(url)!
      currentArray.push([row.adjective, url, row.vote_count])
      return acc
    },
    new Map<string, [string, string, number][]>([
      ['left', []],
      ['right', []],
    ])
  )

  // Cache the results
  // Convert Map to Record and then store as JSON in Redis
  const cacheObject = Object.fromEntries(resultMap.entries())

  // Use Redis JSON.SET to store the data
  try {
    await kv.json.set(TOP_VOTES_BY_URL_KEY, '$', cacheObject)
    // Set expiration separately
    await kv.expire(TOP_VOTES_BY_URL_KEY, TOP_VOTES_TTL)
  } catch (e) {
    // Fallback to regular set if JSON functions are not available
    console.warn(
      'Redis JSON functions not available, falling back to regular set:',
      e
    )
    await kv.set(TOP_VOTES_BY_URL_KEY, JSON.stringify(cacheObject), {
      ex: TOP_VOTES_TTL,
    })
  }

  return resultMap
}

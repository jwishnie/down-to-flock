import { NeonDialect } from 'kysely-neon'
import { neon } from '@neondatabase/serverless'
import {
  Kysely,
  sql,
  type GeneratedAlways,
 
} from 'kysely'

import { type Migration,
  type MigrationProvider,
  type MigratorProps,
  Migrator
} from 'kysely/migration'

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
          .ifNotExists()
          .on(VOTES_TABLE)
          .column('timestamp')
          .execute()
      },
      async down(db) {
        // NOTE: no `.on()` here — that emits `drop index ... on <table>`, which is
        // MySQL syntax. Postgres takes the index name alone.
        await db.schema.dropIndex('timestamp-index').ifExists().execute()
      },
    },
    '003_ranking_indexes': {
      async up(db) {
        // Add index on adjective for GROUP BY and PARTITION BY operations
        await db.schema
          .createIndex('adjective-index')
          .ifNotExists()
          .on(VOTES_TABLE)
          .column('adjective')
          .execute()

        // Add composite index for ranking queries that group by adjective and left_wins
        await db.schema
          .createIndex('adjective-leftwins-index')
          .ifNotExists()
          .on(VOTES_TABLE)
          .columns(['adjective', 'left_wins'])
          .execute()
      },
      async down(db) {
        await db.schema.dropIndex('adjective-index').ifExists().execute()
        await db.schema
          .dropIndex('adjective-leftwins-index')
          .ifExists()
          .execute()
      },
    },
    // Both indexes added in 003 are dead weight: neither ranking query has a WHERE
    // clause, so they aggregate the whole table and Postgres seq-scans regardless. A
    // btree can't serve a GROUP BY whose second key is the `CASE WHEN left_wins ...`
    // expression either. That leaves them as pure insert-time cost.
    '004_drop_ranking_indexes': {
      async up(db) {
        await db.schema.dropIndex('adjective-index').ifExists().execute()
        await db.schema
          .dropIndex('adjective-leftwins-index')
          .ifExists()
          .execute()
      },
      async down(db) {
        await db.schema
          .createIndex('adjective-index')
          .ifNotExists()
          .on(VOTES_TABLE)
          .column('adjective')
          .execute()
        await db.schema
          .createIndex('adjective-leftwins-index')
          .ifNotExists()
          .on(VOTES_TABLE)
          .columns(['adjective', 'left_wins'])
          .execute()
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

export const db = new Kysely<DbSchema>({
  dialect: new NeonDialect({
    neon: neon(process.env.DATABASE_URL!),
  }),
})

const CHIX_KEY = 'chix-v13'
const CHIX_FALLBACK_KEY = 'chix-last-known-good-v1'
const TOP_VOTES_KEY = 'top-votes-v14'
const CHIX_PATH = '/repos/jwishnie/down-to-flock/contents/chix'
const PAGES_PATH = 'https://chix.wishnie.org'
export type ChickMeta = {
  src: string
  name: string
}

const CHIX_TTL = 60 * 60 * 8 // 8 hrs
const CHIX_FALLBACK_TTL = 60 * 60 * 24 * 30 // 30 days
const RANK_TTL = 60 * 30 // 30 mins

// The cache is an optimization, never a dependency. If Upstash is unreachable we log
// and fall through to the source of truth rather than 500ing a page that Postgres
// could have served perfectly well.
const cacheGet = async function <T>(key: string): Promise<T | null> {
  try {
    return (await kv.get(key)) as T | null
  } catch (err) {
    console.error(`cache read failed for ${key}`, err)
    return null
  }
}

const cacheSet = async function (key: string, value: unknown, ttl: number) {
  try {
    await kv.set(key, value, { ex: ttl })
  } catch (err) {
    console.error(`cache write failed for ${key}`, err)
  }
}

export const getChix = async function (): Promise<ChickMeta[]> {
  const fromStore = await cacheGet<ChickMeta[]>(CHIX_KEY)
  if (fromStore?.length) return fromStore

  try {
    const { data } = await new Octokit().request(`GET ${CHIX_PATH}`)
    if (!Array.isArray(data)) {
      throw new Error(`expected an array of chix, got ${typeof data}`)
    }

    const chix = data.map(({ name }: { name: string }) => ({
      name,
      src: `${PAGES_PATH}/${name}`,
    })) as ChickMeta[]

    await cacheSet(CHIX_KEY, chix, CHIX_TTL)
    await cacheSet(CHIX_FALLBACK_KEY, chix, CHIX_FALLBACK_TTL)
    return chix
  } catch (err) {
    // Unauthenticated Octokit is capped at 60 req/hr per IP. Without this, one
    // rate-limited refresh at the 8hr expiry takes down every route, since the home
    // route can't render without a chicken list.
    console.error('failed to refresh chix from GitHub', err)
    const fallback = await cacheGet<ChickMeta[]>(CHIX_FALLBACK_KEY)
    if (fallback?.length) return fallback
    throw err
  }
}

// Fetches exactly one page. `id` is a secondary sort so that rows with identical
// timestamps can't shuffle between requests and appear twice (or not at all) across
// page boundaries.
export const getVotes = async function (page = 1, rowsPerPage = 25) {
  return await db
    .selectFrom(VOTES_TABLE)
    .selectAll()
    .orderBy('timestamp', 'desc')
    .orderBy('id', 'desc')
    .limit(rowsPerPage)
    .offset((page - 1) * rowsPerPage)
    .execute()
}

const COUNT_TTL = 60 * 10 // ten minutes
const COUNT_KEY = 'chix-count-v1'
export const getVoteCount = async function () {
  // `!fromStore` would treat a cached 0 as a miss and re-query forever.
  const fromStore = safeParseInt(await cacheGet<string>(COUNT_KEY))
  if (fromStore !== undefined) return fromStore

  const { count } = await db
    .selectFrom(VOTES_TABLE)
    .select(sql<number>`COUNT(*)::int`.as('count'))
    .executeTakeFirstOrThrow()

  const total = safeParseInt(count) || 0
  await cacheSet(COUNT_KEY, `${total}`, COUNT_TTL)
  return total
}

export interface RankResult {
  adjective: string
  winning_url: string
  vote_count: number
}

export const getTopVotesByAdjective = async function (): Promise<RankResult[]> {
  const fromStore = await cacheGet<RankResult[]>(TOP_VOTES_KEY)
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
          // ::int because Postgres COUNT(*) is bigint, which the Neon driver hands
          // back as a string unless `parseInt8` is enabled — so `sql<number>` alone
          // is a type lie that survives until someone does something other than
          // arithmetic with it.
          sql<number>`COUNT(*)::int`.as('vote_count'),
          // winning_url breaks ties so equal-count rows don't reshuffle on every
          // cache refresh.
          sql<number>`
            ROW_NUMBER() OVER (
              PARTITION BY adjective
              ORDER BY
                COUNT(*) DESC,
                CASE WHEN left_wins = true THEN "left" ELSE "right" END
            )
          `.as('rank'),
          sql<number>`
            (MAX(COUNT(*)) OVER (
              PARTITION BY adjective
            ))::int
          `.as('max_votes'),
        ])
        .groupBy([
          'adjective',
          sql`CASE WHEN left_wins = true THEN "left" ELSE "right" END`,
        ])
        .as('ranked_votes')
    )
    .select(['adjective', 'winning_url', 'vote_count'])
    .where('rank', '<=', 10)
    .orderBy(sql`max_votes DESC, adjective, vote_count DESC, winning_url`)
    .execute()

  await cacheSet(TOP_VOTES_KEY, topVotes, RANK_TTL)
  return topVotes
}

const VOTE_COUNT_KEY = 'voteCount'
// Returns 0 if the counter is unavailable. Callers must treat 0 as "don't know"
// rather than "a multiple of everything" — see PITCH_CF_EVERY in routes/home.tsx.
export const iVoted = async function () {
  try {
    return safeParseInt(await kv.incr(VOTE_COUNT_KEY)) || 0
  } catch (err) {
    console.error('vote counter increment failed', err)
    return 0
  }
}

export const voteCount = async function () {
  return safeParseInt(await cacheGet<string>(VOTE_COUNT_KEY)) || 0
}
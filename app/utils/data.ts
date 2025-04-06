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

console.dir({url: import.meta.env.KV_REST_API_URL, token: import.meta.env.KV_REST_API_TOKEN})

const kv = new Redis({
  url: import.meta.env.KV_REST_API_URL,
  token: import.meta.env.KV_REST_API_TOKEN,
});

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

const CHIX_KEY = 'chix-gh-v8'
const CHIX_PATH = '/repos/jwishnie/down-to-flock/contents/chix'
const PAGES_PATH = 'https://chix.wishnie.org'
export type ChickMeta = {
  src: string
  name: string
}

const CHIX_TTL = 60 * 60 * 8 // 8 hrs
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

export const getWinningUrlsByAdjective = async function (): Promise<
  { adjective: string; winning_url: string; vote_count: number }[]
> {
  return await db
    .with('url_counts', (qb) => 
      qb.selectFrom(VOTES_TABLE)
        .select([
          'adjective',
          sql<string>`
            CASE 
              WHEN left_wins THEN left 
              ELSE right 
            END
          `.as('url'),
          sql<number>`1`.as('vote_count')
        ])
        .groupBy(['adjective', sql`CASE WHEN left_wins THEN left ELSE right END`])
    )
    .selectFrom('url_counts')
    .select([
      'adjective',
      sql<string>`
        FIRST_VALUE(url) OVER (
          PARTITION BY adjective 
          ORDER BY COUNT(*) DESC
        )
      `.as('winning_url'),
      sql<number>`
        FIRST_VALUE(COUNT(*)) OVER (
          PARTITION BY adjective 
          ORDER BY COUNT(*) DESC
        )
      `.as('vote_count')
    ])
    .distinctOn(['adjective'])
    .orderBy('adjective')
    .execute()
}

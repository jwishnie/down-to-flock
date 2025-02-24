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
import { kv } from '@vercel/kv'

export const VOTES_TABLE = 'Votes'

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

const CHIX_KEY = 'chix-gh-v2'
const octokit = new Octokit()
const CHIX_PATH = '/repos/jwishnie/down-to-flock/contents/chix'
export type ChickMeta = {
  src: string
  name: string
}

const REDIS_TTL = 60 * 60 * 8 // 8 hrs
export const getChix = async function () {
  const fromStore = (await kv.get(CHIX_KEY)) as ChickMeta[] | null
  if (!fromStore) {
    const chix = (await new Octokit().request(`GET ${CHIX_PATH}`)).data.map(
      ({
        name,
        download_url: src,
      }: {
        name: string
        download_url: string
      }) => ({ name, src })
    ) as ChickMeta[]
    await kv.set(CHIX_KEY, chix, { ex: REDIS_TTL })
    return chix
  }

  return fromStore
}

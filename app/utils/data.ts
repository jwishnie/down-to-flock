import { createKysely } from '@vercel/postgres-kysely'
import {
  Migrator,
  sql,
  type GeneratedAlways,
  type Migration,
  type MigrationProvider,
  type MigratorProps,
} from 'kysely'

import { list as listChix, type ListBlobResultBlob } from '@vercel/blob'
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
          .createIndex('Account_userId_index')
          .on(VOTES_TABLE)
          .column('timestamp')
          .execute()
      },
      async down(db) {
        await db.schema.dropIndex('timestamp').on(VOTES_TABLE).execute()
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

const CHIX_KEY = 'chix'
export const getChix = async function () {
  const fromStore = (await kv.get(CHIX_KEY)) as ListBlobResultBlob[] | null
  if (!fromStore) {
    const chix = (await listChix()).blobs
    await kv.set(CHIX_KEY, chix, { ex: 3600 })
    return chix
  }

  return fromStore
}

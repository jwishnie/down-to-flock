import { createKysely } from "@vercel/postgres-kysely";
import {
  Migrator,
  sql,
  type GeneratedAlways,
  type Migration,
  type MigrationProvider,
  type MigratorProps,
} from "kysely";

const TABLE = "Votes";

const dbMigrationProvider: MigrationProvider = {
  getMigrations: async (): Promise<Record<string, Migration>> => ({
    "001_create_db": {
      async up(db) {
        await db.schema
          .createTable(TABLE)
          .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
          )
          .addColumn("timestamp", "timestamptz", (col) =>
            col.defaultTo(sql`now()`).notNull()
          )
          .addColumn("adjective", "text", (col) => col.notNull())
          .addColumn("left", "text", (col) => col.notNull())
          .addColumn("right", "text", (col) => col.notNull())
          .addColumn("vote", "boolean", (c) => c.notNull())
          .execute();
      },
      async down(db) {
        await db.schema.dropTable(TABLE).ifExists().execute();
      },
    },
  }),
};

export const getMigrator = (props: Omit<MigratorProps, "provider">) =>
  new Migrator({ ...props, provider: dbMigrationProvider });

interface Votes {
  id: GeneratedAlways<string>;
  adjective: string;
  left: string;
  right: string;
  vote: boolean;
}

interface DbSchema {
  Votes: Votes;
}

export const db = createKysely<DbSchema>();

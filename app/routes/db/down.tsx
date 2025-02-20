import { NO_MIGRATIONS } from 'kysely'
import { db, getMigrator } from '~/utils/db'

const migrator = getMigrator({ db })

export async function loader() {
  const error = (await migrator.migrateTo(NO_MIGRATIONS)).error

  const status = error ? 500 : 200
  const resp = { action: 'down', ...(!!error && { error: error }) }

  return Response.json(resp, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

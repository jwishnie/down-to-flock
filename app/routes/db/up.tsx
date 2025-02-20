import { db, getMigrator } from '~/utils/db'

const migrator = getMigrator({ db })

export async function loader() {
  const error = (await migrator.migrateToLatest()).error

  const status = error ? 500 : 200
  const resp = { action: 'dpwn', ...(!!error && { error: error }) }

  return Response.json(resp, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

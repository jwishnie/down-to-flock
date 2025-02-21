import { type RouteConfig, prefix, route } from '@react-router/dev/routes'

export default [
  route('/results', 'routes/tally.tsx'),
  ...prefix('db', [
    route('up', 'routes/db/up.tsx'),
    route('down', 'routes/db/down.tsx'),
  ]),
  route('/:adjective?/:left?/:right?/:vote?', 'routes/home.tsx'),
] satisfies RouteConfig

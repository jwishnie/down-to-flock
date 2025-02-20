import { type RouteConfig, prefix, route } from '@react-router/dev/routes'

export default [
  //index('routes/home.tsx'),
  route('/:adjective?/:left?/:right?/:vote?', 'routes/home.tsx'),
  ...prefix('db', [
    route('up', 'routes/db/up.tsx'),
    route('down', 'routes/db/down.tsx'),
  ]),
] satisfies RouteConfig

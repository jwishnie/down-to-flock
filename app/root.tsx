import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import _sample from 'lodash-es/sample'
import type { Route } from './+types/root'
import stylesheet from './app.css?url'
import titles from './titles'

// Picks the page title. Root loaders re-run after actions, so each vote gets a
// fresh title, but not on plain navigations between pages.
export async function loader() {
  return { title: _sample(titles) }
}

// Child routes don't export meta, so this applies to every page. loaderData is
// undefined when the root loader itself failed and the error boundary renders.
export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.title ?? 'Clickens!' },
]

export const links: Route.LinksFunction = () => [
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  { rel: 'manifest', href: '/site.webmanifest' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  // Only the faces in use: Plex Mono 400 (body) and 700 (font-bold), Frank Ruhl
  // Libre 600 (.header/.subheader). Linked here rather than @imported from app.css,
  // which made the browser fetch app.css before it could discover the fonts.
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@600&family=IBM+Plex+Mono:wght@400;700&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex items-center w-full px-2">
          <div className="flex-shrink-0 flex-grow-0 w-2/5">
            <a href="https://chicken.pics">see all chicken pics</a>
          </div>
          <div className="flex-shrink-0 flex-grow-0 w-1/5">
            <div className="text-center font-bold">Clickens! (beta)</div>
          </div>
          <div className="flex-shrink-0 flex-grow-0 w-2/5 justify-end text-right">
            <NavLink to="/">cluck again</NavLink>
            <span> | </span>
            <NavLink to="/results">results</NavLink>
            <span> | </span>
            <NavLink to="/pecking">pecking order</NavLink>
          </div>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

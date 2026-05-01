import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/connection/$connId/settings/preferences',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/connection/$connId/settings/preferences"!</div>
}

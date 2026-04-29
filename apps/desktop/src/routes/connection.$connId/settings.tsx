import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/connection/$connId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/connection/$connId/settings"!</div>
}

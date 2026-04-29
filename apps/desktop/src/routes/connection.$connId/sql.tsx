import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/connection/$connId/sql')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/connection/$connId/sql"!</div>
}

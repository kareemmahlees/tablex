import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/connection/$connId/settings/keybindings',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/connection/$connId/settings/keybindings"!</div>
}

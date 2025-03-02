import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/keybindings')({
  component: () => <div>Hello /dashboard/_layout/keybindings!</div>
})
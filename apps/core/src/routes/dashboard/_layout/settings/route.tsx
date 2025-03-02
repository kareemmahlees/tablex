import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/settings')({
  component: () => <div>Hello /dashboard/_layout/settings!</div>
})
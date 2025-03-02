import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/sql-editor')({
  component: () => <div>Hello /dashboard/_layout/sql-editor!</div>
})
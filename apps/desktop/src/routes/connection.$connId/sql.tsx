import { SQLEditor } from '@/features/sql-editor/editor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/connection/$connId/sql')({
  component: SQLEditor,
})

import { SQLEditor } from "@/features/sql-editor/editor"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_table-layout/connection/$connId/sql-editor")({
  component: SQLEditorRoute
})

function SQLEditorRoute() {
  return <SQLEditor />
}

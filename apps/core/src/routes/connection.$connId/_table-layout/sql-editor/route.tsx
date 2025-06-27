import { SQLEditor } from "@/features/sql-editor/editor"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/connection/$connId/_table-layout/sql-editor")({
  component: SQLEditorRoute
})

function SQLEditorRoute() {
  return <SQLEditor />
}

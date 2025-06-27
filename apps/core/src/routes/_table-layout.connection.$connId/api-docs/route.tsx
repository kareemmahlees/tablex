import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_table-layout/connection/$connId/api-docs")({
  component: () => <div>Hello /dashboard/_layout/api-docs!</div>
})

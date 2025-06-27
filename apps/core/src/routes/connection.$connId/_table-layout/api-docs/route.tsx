import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/connection/$connId/_table-layout/api-docs")({
  component: () => <div>Hello /dashboard/_layout/api-docs!</div>
})

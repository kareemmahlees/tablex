import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/data/$tableName")({
  component: () => <div>Hello /dashboard/_layout/data!</div>
})

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/land")({
  component: DashboardPage
})

function DashboardPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-3 break-words text-center text-2xl font-bold text-gray-500 opacity-50">
      <img src={"/cube.svg"} alt="cube" width={100} height={100} />
      Choose a table
      <br />
      to get started
    </div>
  )
}

import { Settings } from "@/features/settings/settings"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/settings")({
  component: SettingsRoute
})

function SettingsRoute() {
  return <Settings />
}

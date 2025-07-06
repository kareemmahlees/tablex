import { Preferences } from "@/features/settings/preferences"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_settings-layout/settings/preferences")({
  component: () => <Preferences />
})

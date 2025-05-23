import { Preferences } from "@/features/settings/preferences"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/settings/preferences")(
  {
    component: () => <Preferences />
  }
)

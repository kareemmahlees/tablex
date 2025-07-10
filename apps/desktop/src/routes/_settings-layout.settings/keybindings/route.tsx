import { Keybindings } from "@/features/keybindings"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_settings-layout/settings/keybindings")({
  component: () => <Keybindings />
})
